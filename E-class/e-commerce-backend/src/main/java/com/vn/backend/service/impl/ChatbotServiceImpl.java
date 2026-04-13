package com.vn.backend.service.impl;

import com.vn.backend.dto.request.chatbot.ChatbotAskRequest;
import com.vn.backend.dto.response.chatbot.ChatMessageResponse;
import com.vn.backend.dto.response.chatbot.ChatbotAskResponse;
import com.vn.backend.entity.*;
import com.vn.backend.exception.ResourceNotFoundException;
import com.vn.backend.repository.*;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatbotServiceImpl implements ChatbotService {

    private static final String INTENT_PRODUCT = "PRODUCT_LOOKUP";
    private static final String INTENT_PROMOTION = "PROMOTION_LOOKUP";
    private static final String INTENT_ORDER = "ORDER_LOOKUP";
    private static final String INTENT_LOW_STOCK = "LOW_STOCK";
    private static final String INTENT_GENERAL = "GENERAL";

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Locale VI_LOCALE = new Locale("vi", "VN");

    private static final Pattern ORDER_CODE_PATTERN =
            Pattern.compile("(?i)\\b(?:HD|ORD)-[A-Z0-9-]+\\b");

    private static final Pattern PROMO_CODE_PATTERN =
            Pattern.compile("\\b[A-Za-z0-9-]{5,}\\b");

    private static final Set<String> STOP_WORDS = Set.of(
            "toi", "muon", "tim", "kiem", "hoi", "ve", "cua", "cho", "shop",
            "co", "khong", "la", "gi", "the", "nao", "xin", "tu", "van",
            "can", "san", "pham", "giay", "ma", "don", "hang", "hoa",
            "trang", "thai", "voucher", "coupon", "khuyen", "mai", "giam", "gia"
    );

    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Override
    public ChatbotAskResponse ask(ChatbotAskRequest request, CustomUserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);

        ChatConversation conversation = resolveConversation(
                request.getConversationId(),
                currentUser,
                request.getChannel(),
                request.getMessage()
        );

        saveMessage(conversation, "USER", request.getMessage(), null);

        String intent = detectIntent(request.getMessage(), currentUser);
        String answer = buildAnswer(request.getMessage(), intent, currentUser);

        saveMessage(conversation, "BOT", answer, intent);

        conversation.setUpdatedAt(OffsetDateTime.now());
        chatConversationRepository.save(conversation);

        return ChatbotAskResponse.builder()
                .conversationId(conversation.getId())
                .intent(intent)
                .answer(answer)
                .suggestions(buildSuggestions(intent, currentUser))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversationMessages(Long conversationId, CustomUserDetails userDetails) {
        User currentUser = resolveCurrentUser(userDetails);

        ChatConversation conversation = chatConversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cuộc hội thoại: " + conversationId));

        validateConversationAccess(conversation, currentUser);

        return chatMessageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(message -> ChatMessageResponse.builder()
                        .id(message.getId())
                        .senderType(message.getSenderType())
                        .messageText(message.getMessageText())
                        .intent(message.getIntent())
                        .createdAt(message.getCreatedAt())
                        .build())
                .toList();
    }

    private User resolveCurrentUser(CustomUserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }

        return userRepository.findById(userDetails.getUserId()).orElse(null);
    }

    private ChatConversation resolveConversation(
            Long conversationId,
            User currentUser,
            String channel,
            String firstMessage
    ) {
        if (conversationId != null) {
            ChatConversation existing = chatConversationRepository.findById(conversationId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy cuộc hội thoại: " + conversationId
                    ));

            validateConversationAccess(existing, currentUser);
            return existing;
        }

        ChatConversation conversation = ChatConversation.builder()
                .user(currentUser)
                .channel(StringUtils.hasText(channel) ? channel.trim().toUpperCase() : "WEB_USER")
                .title(buildConversationTitle(firstMessage))
                .status("ACTIVE")
                .build();

        return chatConversationRepository.save(conversation);
    }

    private void validateConversationAccess(ChatConversation conversation, User currentUser) {
        if (conversation.getUser() == null) {
            return;
        }

        if (currentUser == null || !conversation.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập cuộc hội thoại này.");
        }
    }

    private void saveMessage(
            ChatConversation conversation,
            String senderType,
            String messageText,
            String intent
    ) {
        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderType(senderType)
                .messageText(messageText)
                .intent(intent)
                .build();

        chatMessageRepository.save(message);
    }

    private String detectIntent(String message, User currentUser) {
        String normalized = normalize(message);

        if (extractOrderCode(message) != null
                || containsAny(normalized, "don hang", "hoa don", "trang thai", "ship", "giao hang", "van don")) {
            return INTENT_ORDER;
        }

        if (currentUser != null
                && isAdmin(currentUser)
                && containsAny(normalized, "sap het", "ton kho thap", "low stock", "het hang")) {
            return INTENT_LOW_STOCK;
        }

        if (containsAny(normalized, "voucher", "coupon", "khuyen mai", "giam gia", "uu dai", "ma giam")) {
            return INTENT_PROMOTION;
        }

        if (containsAny(
                normalized,
                "san pham", "giay", "nike", "adidas", "puma", "jordan",
                "size", "mau", "chat lieu", "gia", "con hang", "ton kho", "het hang"
        )) {
            return INTENT_PRODUCT;
        }

        return INTENT_GENERAL;
    }

    private String buildAnswer(String message, String intent, User currentUser) {
        return switch (intent) {
            case INTENT_PRODUCT -> handleProductLookup(message);
            case INTENT_PROMOTION -> handlePromotionLookup(message);
            case INTENT_ORDER -> handleOrderLookup(message, currentUser);
            case INTENT_LOW_STOCK -> handleLowStock(currentUser);
            default -> handleGeneral();
        };
    }

    private String handleProductLookup(String message) {
        List<ProductVariant> variants = productVariantRepository.findAllActiveWithAttributes();

        if (variants.isEmpty()) {
            return "Hiện chưa có dữ liệu sản phẩm để tư vấn.";
        }

        String normalizedMessage = normalize(message);
        List<String> keywords = extractKeywords(normalizedMessage);

        boolean onlyInStock = containsAny(normalizedMessage, "con hang", "co hang", "ton kho");
        boolean onlyOutOfStock = containsAny(normalizedMessage, "het hang");

        List<ProductVariant> filtered = variants.stream()
                .filter(this::isVariantUsable)
                .filter(variant -> !onlyInStock || getStock(variant) > 0)
                .filter(variant -> !onlyOutOfStock || getStock(variant) <= 0)
                .toList();

        List<ProductVariant> matched;

        if (keywords.isEmpty()) {
            matched = filtered.stream()
                    .sorted(Comparator.comparingInt(this::getStock).reversed())
                    .limit(5)
                    .toList();
        } else {
            matched = filtered.stream()
                    .filter(variant -> scoreVariant(variant, keywords) > 0)
                    .sorted(
                            Comparator.comparingInt((ProductVariant variant) -> scoreVariant(variant, keywords)).reversed()
                                    .thenComparingInt(this::getStock).reversed()
                    )
                    .limit(5)
                    .toList();
        }

        if (matched.isEmpty()) {
            return """
                    Tôi chưa tìm thấy mẫu phù hợp với mô tả của bạn.
                    Bạn hãy hỏi lại rõ hơn theo kiểu:
                    - Nike size 42 còn hàng không?
                    - Giày màu trắng dưới 3 triệu
                    - Có mẫu Puma nào đang còn hàng?
                    """;
        }

        StringBuilder builder = new StringBuilder("Tôi tìm thấy các mẫu phù hợp như sau:\n");

        for (ProductVariant variant : matched) {
            Map<String, String> attributes = getAttributesMap(variant);

            builder.append("- ")
                    .append(safeText(variant.getProduct().getName()))
                    .append(" | Mã: ").append(safeText(variant.getCode()))
                    .append(" | Màu: ").append(attributes.getOrDefault("COLOR", "-"))
                    .append(" | Size: ").append(attributes.getOrDefault("SIZE", "-"))
                    .append(" | Chất liệu: ").append(attributes.getOrDefault("MATERIAL", "-"))
                    .append(" | Giá: ").append(formatMoney(variant.getSellingPrice()))
                    .append(" | Tồn: ").append(getStock(variant));

            if (getStock(variant) <= 0) {
                builder.append(" (Hết hàng)");
            } else if (getStock(variant) <= 3) {
                builder.append(" (Sắp hết)");
            }

            builder.append("\n");
        }

        builder.append("\nBạn có thể hỏi tiếp kiểu: “mẫu đầu tiên còn màu nào khác?” hoặc “cho tôi xem ưu đãi hiện có”.");

        return builder.toString();
    }

    private String handlePromotionLookup(String message) {
        OffsetDateTime now = OffsetDateTime.now();
        String exactCode = extractPromoCode(message);

        if (StringUtils.hasText(exactCode)) {
            Optional<Promotion> promotionOpt = promotionRepository.findByCode(exactCode);

            if (promotionOpt.isPresent()) {
                Promotion promotion = promotionOpt.get();
                return """
                        Tôi đã tìm thấy chương trình khuyến mãi:
                        - Mã: %s
                        - Tên: %s
                        - Kiểu giảm: %s
                        - Giá trị giảm: %s
                        - Đơn tối thiểu: %s
                        """.formatted(
                        promotion.getCode(),
                        promotion.getName(),
                        safeText(promotion.getDiscountType()),
                        formatMoney(promotion.getDiscountValue()),
                        formatMoney(defaultZero(promotion.getMinOrderValue()))
                );
            }

            Optional<Coupon> couponOpt = couponRepository.findByCodeAndIsActiveTrue(exactCode);

            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                return """
                        Tôi đã tìm thấy coupon:
                        - Mã: %s
                        - Kiểu giảm: %s
                        - Giá trị giảm: %s
                        - Giới hạn sử dụng: %s
                        """.formatted(
                        coupon.getCode(),
                        safeText(coupon.getDiscountType()),
                        formatMoney(coupon.getDiscountValue()),
                        coupon.getUsageLimit() == null ? "Không giới hạn" : coupon.getUsageLimit().toString()
                );
            }
        }

        List<Promotion> promotions = promotionRepository.findAllAvailableForPos(now)
                .stream()
                .limit(3)
                .toList();

        List<Coupon> coupons = couponRepository.findAll()
                .stream()
                .filter(coupon -> Boolean.TRUE.equals(coupon.getIsActive()))
                .limit(3)
                .toList();

        if (promotions.isEmpty() && coupons.isEmpty()) {
            return "Hiện tại shop chưa có ưu đãi hoặc coupon nào đang hoạt động.";
        }

        StringBuilder builder = new StringBuilder("Các ưu đãi hiện có:\n");

        if (!promotions.isEmpty()) {
            builder.append("\nKhuyến mãi:\n");
            for (Promotion promotion : promotions) {
                builder.append("- ")
                        .append(promotion.getCode())
                        .append(" | ")
                        .append(promotion.getName())
                        .append(" | Giảm: ")
                        .append(formatMoney(promotion.getDiscountValue()))
                        .append(" | Đơn tối thiểu: ")
                        .append(formatMoney(defaultZero(promotion.getMinOrderValue())))
                        .append("\n");
            }
        }

        if (!coupons.isEmpty()) {
            builder.append("\nCoupon:\n");
            for (Coupon coupon : coupons) {
                builder.append("- ")
                        .append(coupon.getCode())
                        .append(" | Kiểu: ")
                        .append(safeText(coupon.getDiscountType()))
                        .append(" | Giảm: ")
                        .append(formatMoney(coupon.getDiscountValue()))
                        .append("\n");
            }
        }

        builder.append("\nBạn có thể hỏi tiếp: “mã HELLO2026 áp dụng thế nào?”");

        return builder.toString();
    }

    private String handleOrderLookup(String message, User currentUser) {
        if (currentUser == null) {
            return """
                    Để tra cứu đơn hàng chính xác, bạn hãy đăng nhập trước.
                    Sau khi đăng nhập, bạn có thể hỏi:
                    - Đơn HD-0001 đang ở trạng thái nào?
                    - Liệt kê 3 đơn gần nhất của tôi
                    """;
        }

        boolean admin = isAdmin(currentUser);
        Customer customer = resolveCustomer(currentUser);
        String orderCode = extractOrderCode(message);

        if (StringUtils.hasText(orderCode)) {
            Order order;

            if (admin) {
                order = orderRepository.findByCode(orderCode).orElse(null);
            } else if (customer != null) {
                order = orderRepository.findByCodeAndCustomer_Id(orderCode, customer.getId()).orElse(null);
            } else {
                order = null;
            }

            if (order == null) {
                return "Tôi không tìm thấy đơn hàng " + orderCode + " hoặc bạn không có quyền xem đơn này.";
            }

            Shipment shipment = shipmentRepository.findByOrder_Id(order.getId()).orElse(null);
            return formatOrderDetail(order, shipment);
        }

        if (!admin && customer != null) {
            List<Order> latestOrders = orderRepository.findTop3ByCustomer_IdOrderByCreatedAtDesc(customer.getId());

            if (latestOrders.isEmpty()) {
                return "Bạn chưa có đơn hàng nào trong hệ thống.";
            }

            StringBuilder builder = new StringBuilder("3 đơn gần nhất của bạn:\n");

            for (Order order : latestOrders) {
                builder.append("- ")
                        .append(safeText(order.getCode()))
                        .append(" | Trạng thái: ")
                        .append(mapOrderStatus(order.getStatus()))
                        .append(" | Tổng tiền: ")
                        .append(formatMoney(order.getTotalAmount()))
                        .append(" | Tạo lúc: ")
                        .append(order.getCreatedAt() != null
                                ? order.getCreatedAt().format(DATE_TIME_FORMATTER)
                                : "-")
                        .append("\n");
            }

            builder.append("\nBạn có thể hỏi tiếp: “Đơn HD-0001 đang ở trạng thái nào?”");

            return builder.toString();
        }

        if (admin) {
            return """
                    Bạn đang ở quyền admin.
                    Hãy nhập mã đơn cụ thể để tôi tra nhanh cho bạn.
                    Ví dụ: Đơn HD-0001 đang ở trạng thái nào?
                    """;
        }

        return "Tôi chưa thể tra cứu đơn hàng cho tài khoản này.";
    }

    private String handleLowStock(User currentUser) {
        if (currentUser == null || !isAdmin(currentUser)) {
            return "Chức năng xem hàng sắp hết hiện chỉ dành cho tài khoản admin.";
        }

        List<ProductVariant> lowStockVariants = productVariantRepository.findAllActiveWithAttributes()
                .stream()
                .filter(this::isVariantUsable)
                .filter(variant -> getStock(variant) <= 10)
                .sorted(Comparator.comparingInt(this::getStock))
                .limit(5)
                .toList();

        if (lowStockVariants.isEmpty()) {
            return "Hiện tại chưa có biến thể nào ở mức tồn kho thấp.";
        }

        StringBuilder builder = new StringBuilder("Các biến thể sắp hết hàng:\n");

        for (ProductVariant variant : lowStockVariants) {
            Map<String, String> attributes = getAttributesMap(variant);

            builder.append("- ")
                    .append(safeText(variant.getProduct().getName()))
                    .append(" | Mã: ").append(safeText(variant.getCode()))
                    .append(" | Màu: ").append(attributes.getOrDefault("COLOR", "-"))
                    .append(" | Size: ").append(attributes.getOrDefault("SIZE", "-"))
                    .append(" | Tồn: ").append(getStock(variant))
                    .append("\n");
        }

        return builder.toString();
    }

    private String handleGeneral() {
        return """
                Tôi có thể hỗ trợ bạn các việc sau:
                - Tìm sản phẩm theo tên / màu / size / brand
                - Kiểm tra còn hàng
                - Xem ưu đãi / voucher / coupon
                - Tra cứu đơn hàng khi đã đăng nhập
                - Hỗ trợ admin xem hàng sắp hết

                Ví dụ bạn có thể hỏi:
                - Nike size 42 còn hàng không?
                - Shop đang có ưu đãi gì?
                - Đơn HD-0001 đang ở trạng thái nào?
                """;
    }

    private List<String> buildSuggestions(String intent, User currentUser) {
        return switch (intent) {
            case INTENT_PRODUCT -> List.of(
                    "Nike size 42 còn hàng không?",
                    "Có mẫu màu trắng nào không?",
                    "Giày Puma đang có giá bao nhiêu?"
            );
            case INTENT_PROMOTION -> List.of(
                    "Shop đang có ưu đãi gì?",
                    "Mã HELLO2026 áp dụng thế nào?",
                    "Hiện có coupon nào đang hoạt động?"
            );
            case INTENT_ORDER -> currentUser == null
                    ? List.of(
                    "Tôi muốn tìm sản phẩm",
                    "Shop đang có ưu đãi gì?",
                    "Nike size 42 còn hàng không?"
            )
                    : List.of(
                    "Liệt kê 3 đơn gần nhất của tôi",
                    "Đơn HD-0001 đang ở trạng thái nào?",
                    "Tôi muốn xem ưu đãi hiện có"
            );
            case INTENT_LOW_STOCK -> List.of(
                    "Mẫu nào sắp hết hàng?",
                    "Cho tôi xem hàng tồn kho thấp",
                    "Có sản phẩm nào gần hết không?"
            );
            default -> List.of(
                    "Nike size 42 còn hàng không?",
                    "Shop đang có ưu đãi gì?",
                    "Đơn hàng của tôi đang ở đâu?"
            );
        };
    }

    private boolean isAdmin(User user) {
        return user.getRole() != null
                && StringUtils.hasText(user.getRole().getCode())
                && "ADMIN".equalsIgnoreCase(user.getRole().getCode());
    }

    private Customer resolveCustomer(User currentUser) {
        if (currentUser == null || currentUser.getUserProfile() == null) {
            return null;
        }

        return customerRepository.findByUserProfileId(currentUser.getUserProfile().getId()).orElse(null);
    }

    private String formatOrderDetail(Order order, Shipment shipment) {
        StringBuilder builder = new StringBuilder("Thông tin đơn hàng:\n");

        builder.append("- Mã đơn: ").append(safeText(order.getCode())).append("\n")
                .append("- Trạng thái đơn: ").append(mapOrderStatus(order.getStatus())).append("\n")
                .append("- Tổng tiền: ").append(formatMoney(order.getTotalAmount())).append("\n")
                .append("- Loại đơn: ").append(safeText(order.getOrderType())).append("\n");

        if (order.getCreatedAt() != null) {
            builder.append("- Tạo lúc: ").append(order.getCreatedAt().format(DATE_TIME_FORMATTER)).append("\n");
        }

        if (shipment != null) {
            builder.append("- Trạng thái giao hàng: ")
                    .append(safeText(shipment.getStatus() != null ? shipment.getStatus() : "-"))
                    .append("\n");

            if (StringUtils.hasText(shipment.getTrackingCode())) {
                builder.append("- Mã vận đơn: ")
                        .append(shipment.getTrackingCode())
                        .append("\n");
            }
        }

        return builder.toString();
    }

    private String mapOrderStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return "-";
        }

        return switch (status.toUpperCase()) {
            case "PENDING" -> "Chờ xử lý";
            case "CONFIRMED" -> "Đã xác nhận";
            case "SHIPPING" -> "Đang giao";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            case "RETURN_REQUESTED" -> "Yêu cầu trả hàng";
            case "RETURNED" -> "Đã trả hàng";
            case "RETURN_REJECTED" -> "Từ chối trả hàng";
            default -> status;
        };
    }

    private String buildConversationTitle(String message) {
        String trimmed = safeText(message).trim();
        return trimmed.length() > 80 ? trimmed.substring(0, 80) : trimmed;
    }

    private boolean isVariantUsable(ProductVariant variant) {
        return variant != null
                && variant.getProduct() != null
                && Boolean.TRUE.equals(variant.getIsActive())
                && variant.getDeletedAt() == null
                && Boolean.TRUE.equals(variant.getProduct().getIsActive())
                && variant.getProduct().getDeletedAt() == null;
    }

    private int scoreVariant(ProductVariant variant, List<String> keywords) {
        String searchableText = normalize(buildVariantSearchableText(variant));
        int score = 0;

        for (String keyword : keywords) {
            if (searchableText.contains(keyword)) {
                score += keyword.length() >= 4 ? 2 : 1;
            }
        }

        return score;
    }

    private String buildVariantSearchableText(ProductVariant variant) {
        Map<String, String> attributes = getAttributesMap(variant);

        return String.join(" ",
                safeText(variant.getCode()),
                safeText(variant.getBarcode()),
                safeText(variant.getProduct().getCode()),
                safeText(variant.getProduct().getName()),
                variant.getProduct().getBrand() != null ? safeText(variant.getProduct().getBrand().getName()) : "",
                variant.getProduct().getCategory() != null ? safeText(variant.getProduct().getCategory().getName()) : "",
                attributes.getOrDefault("COLOR", ""),
                attributes.getOrDefault("SIZE", ""),
                attributes.getOrDefault("MATERIAL", "")
        );
    }

    private Map<String, String> getAttributesMap(ProductVariant variant) {
        Map<String, String> attributes = new HashMap<>();

        if (variant.getVariantAttributeValues() == null) {
            return attributes;
        }

        for (VariantAttributeValue value : variant.getVariantAttributeValues()) {
            if (value.getAttributeValue() == null || value.getAttributeValue().getAttribute() == null) {
                continue;
            }

            String code = value.getAttributeValue().getAttribute().getCode();
            String attributeValue = value.getAttributeValue().getValue();

            if (StringUtils.hasText(code) && StringUtils.hasText(attributeValue)) {
                attributes.put(code.toUpperCase(), attributeValue);
            }
        }

        return attributes;
    }

    private List<String> extractKeywords(String normalizedMessage) {
        return Arrays.stream(normalizedMessage.split("\\s+"))
                .map(String::trim)
                .filter(token -> token.length() >= 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .distinct()
                .toList();
    }

    private String extractOrderCode(String message) {
        Matcher matcher = ORDER_CODE_PATTERN.matcher(message);
        return matcher.find() ? matcher.group().toUpperCase() : null;
    }

    private String extractPromoCode(String message) {
        Matcher matcher = PROMO_CODE_PATTERN.matcher(message);

        while (matcher.find()) {
            String token = matcher.group().toUpperCase();

            if (token.matches(".*[0-9-].*")) {
                return token;
            }
        }

        return null;
    }

    private String normalize(String input) {
        if (input == null) {
            return "";
        }

        String value = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "D")
                .toLowerCase();

        return value;
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private int getStock(ProductVariant variant) {
        return variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
    }

    private String formatMoney(BigDecimal amount) {
        NumberFormat formatter = NumberFormat.getNumberInstance(VI_LOCALE);
        return formatter.format(defaultZero(amount)) + " đ";
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }
}