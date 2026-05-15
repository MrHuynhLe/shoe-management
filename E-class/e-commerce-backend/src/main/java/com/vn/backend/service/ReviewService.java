package com.vn.backend.service;

import com.vn.backend.dto.request.ReviewRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductReviewResponse;
import com.vn.backend.dto.response.RatingDistributionResponse;
import com.vn.backend.dto.response.ReviewItemResponse;
import com.vn.backend.entity.Order;
import com.vn.backend.entity.OrderItem;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.Review;
import com.vn.backend.entity.User;
import com.vn.backend.entity.UserProfile;
import com.vn.backend.exception.BadRequestException;
import com.vn.backend.exception.ConflictException;
import com.vn.backend.exception.NotFoundException;
import com.vn.backend.mapper.PageMapper;
import com.vn.backend.repository.OrderItemRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.repository.ReviewRepository;
import com.vn.backend.repository.UserRepository;
import com.vn.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private static final String ORDER_STATUS_COMPLETED = "COMPLETED";
    private static final String ORDER_STATUS_DELIVERED = "DELIVERED";

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public ProductReviewResponse getReviewsByProduct(Long productId) {
        ensureProductExists(productId);

        List<Review> reviews = reviewRepository.findByProductIdAndStatusTrueOrderByCreatedAtDesc(productId);
        List<ReviewItemResponse> items = reviews.stream()
                .map(this::mapToResponse)
                .toList();

        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        long totalReviews = reviewRepository.countByProductIdAndStatusTrue(productId);

        return ProductReviewResponse.builder()
                .avgRating(roundOneDecimal(avgRating))
                .totalReviews(totalReviews)
                .ratingDistribution(buildRatingDistribution(reviews))
                .items(items)
                .build();
    }

    @Transactional
    public ReviewItemResponse createReviewFromCompletedOrder(
            Long orderItemId,
            CustomUserDetails currentUser,
            ReviewRequest request
    ) {
        if (currentUser == null) {
            throw new BadRequestException("Bạn cần đăng nhập để đánh giá sản phẩm");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating phải từ 1 đến 5");
        }

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm trong đơn hàng"));

        Order order = orderItem.getOrder();
        if (order == null) {
            throw new NotFoundException("Không tìm thấy đơn hàng");
        }

        User user = userRepository.findDetailById(currentUser.getUserId())
                .orElseGet(() -> userRepository.findById(currentUser.getUserId())
                        .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng")));

        if (!isOrderOwner(order, user)) {
            throw new AccessDeniedException("Bạn không có quyền đánh giá sản phẩm này");
        }

        if (!isReviewableOrderStatus(order.getStatus())) {
            throw new BadRequestException("Chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã giao");
        }

        if (reviewRepository.existsByOrderItemIdAndStatusTrue(orderItemId)) {
            throw new ConflictException("Sản phẩm này đã được đánh giá");
        }

        ProductVariant variant = orderItem.getProductVariant();
        Product product = variant != null ? variant.getProduct() : null;
        if (product == null) {
            throw new NotFoundException("Không tìm thấy sản phẩm trong đơn hàng");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setOrder(order);
        review.setOrderItem(orderItem);
        review.setRating(request.getRating());
        review.setComment(trimComment(request.getComment()));
        review.setStatus(true);

        return mapToResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewItemResponse> getAllReviewsAdmin(int page, int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return PageMapper.toPageResponse(reviewRepository.findAll(pageable), this::mapToResponse);
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review không tồn tại"));

        review.setStatus(false);
        reviewRepository.save(review);
    }

    private void ensureProductExists(Long productId) {
        if (productRepository.findByIdAndDeletedAtIsNull(productId).isEmpty()) {
            throw new NotFoundException("Không tìm thấy sản phẩm");
        }
    }

    private boolean isOrderOwner(Order order, User user) {
        return order.getCustomer() != null
                && order.getCustomer().getUserProfile() != null
                && user.getUserProfile() != null
                && order.getCustomer().getUserProfile().getId().equals(user.getUserProfile().getId());
    }

    private boolean isReviewableOrderStatus(String status) {
        return ORDER_STATUS_COMPLETED.equalsIgnoreCase(status)
                || ORDER_STATUS_DELIVERED.equalsIgnoreCase(status);
    }

    private ReviewItemResponse mapToResponse(Review review) {
        User user = review.getUser();
        Product product = review.getProduct();

        return ReviewItemResponse.builder()
                .reviewId(review.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .userId(user != null ? user.getId() : null)
                .fullName(resolveFullName(user))
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private String resolveFullName(User user) {
        if (user == null) {
            return "User";
        }

        UserProfile profile = user.getUserProfile();
        if (profile != null && profile.getFullName() != null && !profile.getFullName().isBlank()) {
            return profile.getFullName();
        }

        return user.getUsername();
    }

    private RatingDistributionResponse buildRatingDistribution(List<Review> reviews) {
        return RatingDistributionResponse.builder()
                .oneStar(countByRating(reviews, 1))
                .twoStar(countByRating(reviews, 2))
                .threeStar(countByRating(reviews, 3))
                .fourStar(countByRating(reviews, 4))
                .fiveStar(countByRating(reviews, 5))
                .build();
    }

    private long countByRating(List<Review> reviews, int rating) {
        return reviews.stream()
                .filter(review -> review.getRating() != null && review.getRating() == rating)
                .count();
    }

    private String trimComment(String comment) {
        if (comment == null) {
            return null;
        }

        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Double roundOneDecimal(Double value) {
        if (value == null) {
            return 0.0;
        }

        return Math.round(value * 10.0) / 10.0;
    }
}
