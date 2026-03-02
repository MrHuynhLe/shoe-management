-- ============================================================
-- Seed Data for Shoe Shop (S-Shop)
-- Auto-runs on Spring Boot startup (after JPA creates tables)
-- ON CONFLICT DO NOTHING = idempotent (safe to re-run)
-- ============================================================

-- 1. Attributes (SIZE, COLOR)
INSERT INTO attributes (id, code, name) VALUES (1, 'SIZE', 'Kích cỡ') ON CONFLICT DO NOTHING;
INSERT INTO attributes (id, code, name) VALUES (2, 'COLOR', 'Màu sắc') ON CONFLICT DO NOTHING;

-- 2. Attribute Values
INSERT INTO attribute_values (id, value, attribute_id) VALUES (1, '38', 1) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (2, '39', 1) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (3, '40', 1) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (4, '41', 1) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (5, '42', 1) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (6, '43', 1) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (7, 'Đen', 2) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (8, 'Trắng', 2) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (9, 'Đỏ', 2) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (10, 'Xanh Navy', 2) ON CONFLICT DO NOTHING;
INSERT INTO attribute_values (id, value, attribute_id) VALUES (11, 'Xám', 2) ON CONFLICT DO NOTHING;

-- 3. Brands
INSERT INTO brands (id, deleted_at, is_active, name) VALUES (1, NULL, true, 'Nike') ON CONFLICT DO NOTHING;
INSERT INTO brands (id, deleted_at, is_active, name) VALUES (2, NULL, true, 'Adidas') ON CONFLICT DO NOTHING;
INSERT INTO brands (id, deleted_at, is_active, name) VALUES (3, NULL, true, 'Puma') ON CONFLICT DO NOTHING;
INSERT INTO brands (id, deleted_at, is_active, name) VALUES (4, NULL, true, 'New Balance') ON CONFLICT DO NOTHING;
INSERT INTO brands (id, deleted_at, is_active, name) VALUES (5, NULL, true, 'Converse') ON CONFLICT DO NOTHING;

-- 4. Categories
INSERT INTO categories (id, deleted_at, is_active, name) VALUES (1, NULL, true, 'Giày chạy bộ') ON CONFLICT DO NOTHING;
INSERT INTO categories (id, deleted_at, is_active, name) VALUES (2, NULL, true, 'Giày thời trang') ON CONFLICT DO NOTHING;
INSERT INTO categories (id, deleted_at, is_active, name) VALUES (3, NULL, true, 'Giày bóng rổ') ON CONFLICT DO NOTHING;
INSERT INTO categories (id, deleted_at, is_active, name) VALUES (4, NULL, true, 'Dép & Sandal') ON CONFLICT DO NOTHING;

-- 5. Roles
INSERT INTO roles (id, code, name) VALUES (1, 'ADMIN', 'Quản trị viên') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, code, name) VALUES (2, 'STAFF', 'Nhân viên') ON CONFLICT DO NOTHING;
INSERT INTO roles (id, code, name) VALUES (3, 'CUSTOMER', 'Khách hàng') ON CONFLICT DO NOTHING;

-- 6. User Profiles
INSERT INTO user_profiles (id, address, birthday, created_at, deleted_at, full_name, is_active, phone) VALUES (1, '123 Nguyễn Huệ, Quận 1, TP.HCM', '1990-05-15', NOW(), NULL, 'Nguyễn Văn Admin', true, '0901000001') ON CONFLICT DO NOTHING;
INSERT INTO user_profiles (id, address, birthday, created_at, deleted_at, full_name, is_active, phone) VALUES (2, '456 Lê Lợi, Quận 3, TP.HCM', '1995-08-20', NOW(), NULL, 'Trần Thị Nhân Viên', true, '0901000002') ON CONFLICT DO NOTHING;
INSERT INTO user_profiles (id, address, birthday, created_at, deleted_at, full_name, is_active, phone) VALUES (3, '789 Trần Hưng Đạo, Quận 5, TP.HCM', '1998-03-10', NOW(), NULL, 'Lê Văn An', true, '0912345678') ON CONFLICT DO NOTHING;
INSERT INTO user_profiles (id, address, birthday, created_at, deleted_at, full_name, is_active, phone) VALUES (4, '12 Võ Văn Tần, Quận 3, TP.HCM', '2000-11-25', NOW(), NULL, 'Phạm Thị Bình', true, '0987654321') ON CONFLICT DO NOTHING;
INSERT INTO user_profiles (id, address, birthday, created_at, deleted_at, full_name, is_active, phone) VALUES (5, '99 Điện Biên Phủ, Bình Thạnh, TP.HCM', '1997-07-04', NOW(), NULL, 'Hoàng Minh Châu', true, '0909123456') ON CONFLICT DO NOTHING;

-- 7. Users
INSERT INTO users (id, deleted_at, email, is_active, password_hash, username, role_id, user_profile_id) VALUES (1, NULL, 'admin@sshop.vn', true, '$2a$10$hash1', 'admin', 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO users (id, deleted_at, email, is_active, password_hash, username, role_id, user_profile_id) VALUES (2, NULL, 'staff01@sshop.vn', true, '$2a$10$hash2', 'staff01', 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO users (id, deleted_at, email, is_active, password_hash, username, role_id, user_profile_id) VALUES (3, NULL, 'lean@gmail.com', true, '$2a$10$hash3', 'lean', 3, 3) ON CONFLICT DO NOTHING;
INSERT INTO users (id, deleted_at, email, is_active, password_hash, username, role_id, user_profile_id) VALUES (4, NULL, 'binh@gmail.com', true, '$2a$10$hash4', 'phambinh', 3, 4) ON CONFLICT DO NOTHING;
INSERT INTO users (id, deleted_at, email, is_active, password_hash, username, role_id, user_profile_id) VALUES (5, NULL, 'chau@gmail.com', true, '$2a$10$hash5', 'hoangchau', 3, 5) ON CONFLICT DO NOTHING;

-- 8. Customers
INSERT INTO customers (id, code, customer_type, loyalty_points, user_profile_id) VALUES (1, 'KH-001', 'RETAIL', 150, 3) ON CONFLICT DO NOTHING;
INSERT INTO customers (id, code, customer_type, loyalty_points, user_profile_id) VALUES (2, 'KH-002', 'RETAIL', 80, 4) ON CONFLICT DO NOTHING;
INSERT INTO customers (id, code, customer_type, loyalty_points, user_profile_id) VALUES (3, 'KH-003', 'VIP', 500, 5) ON CONFLICT DO NOTHING;

-- 9. Origins
INSERT INTO origins (id, created_at, deleted_at, is_active, name, updated_at) VALUES (1, NOW(), NULL, true, 'Việt Nam', NULL) ON CONFLICT DO NOTHING;
INSERT INTO origins (id, created_at, deleted_at, is_active, name, updated_at) VALUES (2, NOW(), NULL, true, 'Trung Quốc', NULL) ON CONFLICT DO NOTHING;
INSERT INTO origins (id, created_at, deleted_at, is_active, name, updated_at) VALUES (3, NOW(), NULL, true, 'Indonesia', NULL) ON CONFLICT DO NOTHING;

-- 10. Suppliers
INSERT INTO suppliers (id, code, deleted_at, is_active, name, phone) VALUES (1, 'NCC-001', NULL, true, 'Công ty TNHH Nike Việt Nam', '02812345678') ON CONFLICT DO NOTHING;
INSERT INTO suppliers (id, code, deleted_at, is_active, name, phone) VALUES (2, 'NCC-002', NULL, true, 'Adidas Vietnam Trading', '02887654321') ON CONFLICT DO NOTHING;
INSERT INTO suppliers (id, code, deleted_at, is_active, name, phone) VALUES (3, 'NCC-003', NULL, true, 'Puma Sports Vietnam', '02811112222') ON CONFLICT DO NOTHING;

-- 11. Stores
INSERT INTO stores (id, address, is_active, name) VALUES (1, '123 Nguyễn Huệ, Quận 1, TP.HCM', true, 'S-Shop Quận 1') ON CONFLICT DO NOTHING;
INSERT INTO stores (id, address, is_active, name) VALUES (2, '456 Nguyễn Hữu Thọ, Quận 7, TP.HCM', true, 'S-Shop Quận 7') ON CONFLICT DO NOTHING;

-- 12. Shipping Providers
INSERT INTO shipping_providers (id, code, created_at, is_active, name) VALUES (1, 'GHN', NOW(), true, 'Giao Hàng Nhanh') ON CONFLICT DO NOTHING;
INSERT INTO shipping_providers (id, code, created_at, is_active, name) VALUES (2, 'GHTK', NOW(), true, 'Giao Hàng Tiết Kiệm') ON CONFLICT DO NOTHING;
INSERT INTO shipping_providers (id, code, created_at, is_active, name) VALUES (3, 'JNT', NOW(), true, 'J&T Express') ON CONFLICT DO NOTHING;

-- 13. Products
INSERT INTO products (id, code, deleted_at, description, is_active, name, brand_id, category_id, origin_id, supplier_id) VALUES (1, 'SP-001', NULL, 'Đôi giày huyền thoại với thiết kế cổ điển, đế Air êm ái. Phù hợp cho mọi phong cách thời trang.', true, 'Nike Air Force 1 ''07', 1, 2, 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO products (id, code, deleted_at, description, is_active, name, brand_id, category_id, origin_id, supplier_id) VALUES (2, 'SP-002', NULL, 'Giày chạy bộ cao cấp với công nghệ Boost hoàn trả năng lượng, êm ái tối đa.', true, 'Adidas Ultraboost 22', 2, 1, 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO products (id, code, deleted_at, description, is_active, name, brand_id, category_id, origin_id, supplier_id) VALUES (3, 'SP-003', NULL, 'Phiên bản cổ mid của dòng Jordan huyền thoại, chất liệu da cao cấp.', true, 'Nike Air Jordan 1 Mid', 1, 3, 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO products (id, code, deleted_at, description, is_active, name, brand_id, category_id, origin_id, supplier_id) VALUES (4, 'SP-004', NULL, 'Giày thời trang cổ điển với chất liệu da lộn mềm mại, đế cao su bền bỉ.', true, 'Puma Suede Classic XXI', 3, 2, 2, 3) ON CONFLICT DO NOTHING;
INSERT INTO products (id, code, deleted_at, description, is_active, name, brand_id, category_id, origin_id, supplier_id) VALUES (5, 'SP-005', NULL, 'Thiết kế retro kinh điển, đệm ENCAP cho sự thoải mái suốt ngày dài.', true, 'New Balance 574 Core', 4, 2, 2, 2) ON CONFLICT DO NOTHING;
INSERT INTO products (id, code, deleted_at, description, is_active, name, brand_id, category_id, origin_id, supplier_id) VALUES (6, 'SP-006', NULL, 'Biểu tượng thời trang từ năm 1917, canvas bền bỉ, đế cao su vulcanized.', true, 'Converse Chuck Taylor All Star', 5, 2, 2, 2) ON CONFLICT DO NOTHING;

-- 14. Product Variants
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (1, '8000000001', 'AF1-DEN-40', 1800000.00, NULL, true, 2999000.00, 25, 1) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (2, '8000000002', 'AF1-DEN-41', 1800000.00, NULL, true, 2999000.00, 30, 1) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (3, '8000000003', 'AF1-DEN-42', 1800000.00, NULL, true, 2999000.00, 20, 1) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (4, '8000000004', 'AF1-TRANG-40', 1800000.00, NULL, true, 2999000.00, 15, 1) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (5, '8000000005', 'AF1-TRANG-42', 1800000.00, NULL, true, 2999000.00, 18, 1) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (6, '8000000006', 'UB22-DEN-41', 2700000.00, NULL, true, 4500000.00, 12, 2) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (7, '8000000007', 'UB22-DEN-42', 2700000.00, NULL, true, 4500000.00, 10, 2) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (8, '8000000008', 'UB22-TRANG-41', 2700000.00, NULL, true, 4500000.00, 8, 2) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (9, '8000000009', 'JD1-DO-41', 2300000.00, NULL, true, 3899000.00, 10, 3) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (10, '8000000010', 'JD1-DO-42', 2300000.00, NULL, true, 3899000.00, 12, 3) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (11, '8000000011', 'JD1-DEN-42', 2300000.00, NULL, true, 3899000.00, 15, 3) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (12, '8000000012', 'PUMA-DEN-40', 1100000.00, NULL, true, 1899000.00, 20, 4) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (13, '8000000013', 'PUMA-DEN-42', 1100000.00, NULL, true, 1899000.00, 18, 4) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (14, '8000000014', 'NB574-XAM-41', 1500000.00, NULL, true, 2599000.00, 14, 5) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (15, '8000000015', 'NB574-XAM-42', 1500000.00, NULL, true, 2599000.00, 16, 5) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (16, '8000000016', 'NB574-NAVY-41', 1500000.00, NULL, true, 2599000.00, 10, 5) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (17, '8000000017', 'CVS-DEN-39', 850000.00, NULL, true, 1499000.00, 30, 6) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (18, '8000000018', 'CVS-DEN-40', 850000.00, NULL, true, 1499000.00, 25, 6) ON CONFLICT DO NOTHING;
INSERT INTO product_variants (id, barcode, code, cost_price, deleted_at, is_active, selling_price, stock_quantity, product_id) VALUES (19, '8000000019', 'CVS-TRANG-40', 850000.00, NULL, true, 1499000.00, 20, 6) ON CONFLICT DO NOTHING;

-- 15. Variant Attribute Values (SIZE + COLOR mapping)
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (1, 3, 1) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (2, 7, 1) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (3, 4, 2) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (4, 7, 2) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (5, 5, 3) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (6, 7, 3) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (7, 3, 4) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (8, 8, 4) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (9, 5, 5) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (10, 8, 5) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (11, 4, 6) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (12, 7, 6) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (13, 5, 7) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (14, 7, 7) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (15, 4, 8) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (16, 8, 8) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (17, 4, 9) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (18, 9, 9) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (19, 5, 10) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (20, 9, 10) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (21, 5, 11) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (22, 7, 11) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (23, 3, 12) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (24, 7, 12) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (25, 5, 13) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (26, 7, 13) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (27, 4, 14) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (28, 11, 14) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (29, 5, 15) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (30, 11, 15) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (31, 4, 16) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (32, 10, 16) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (33, 2, 17) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (34, 7, 17) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (35, 3, 18) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (36, 7, 18) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (37, 3, 19) ON CONFLICT DO NOTHING;
INSERT INTO variant_attribute_values (id, attribute_value_id, variant_id) VALUES (38, 8, 19) ON CONFLICT DO NOTHING;

-- 16. Product Images
INSERT INTO product_images (id, display_order, image_url, is_primary, product_id, product_variant_id) VALUES (1, 1, '/image/nike-af1-white.jpg', true, 1, NULL) ON CONFLICT DO NOTHING;
INSERT INTO product_images (id, display_order, image_url, is_primary, product_id, product_variant_id) VALUES (2, 1, '/image/adidas-ultraboost-black.jpg', true, 2, NULL) ON CONFLICT DO NOTHING;
INSERT INTO product_images (id, display_order, image_url, is_primary, product_id, product_variant_id) VALUES (3, 1, '/image/jordan1-mid-red.jpg', true, 3, NULL) ON CONFLICT DO NOTHING;
INSERT INTO product_images (id, display_order, image_url, is_primary, product_id, product_variant_id) VALUES (4, 1, '/image/puma-suede-black.jpg', true, 4, NULL) ON CONFLICT DO NOTHING;
INSERT INTO product_images (id, display_order, image_url, is_primary, product_id, product_variant_id) VALUES (5, 1, '/image/nb-574-grey.jpg', true, 5, NULL) ON CONFLICT DO NOTHING;
INSERT INTO product_images (id, display_order, image_url, is_primary, product_id, product_variant_id) VALUES (6, 1, '/image/converse-chuck-black.jpg', true, 6, NULL) ON CONFLICT DO NOTHING;

-- 17. Orders
INSERT INTO orders (id, code, created_at, discount_amount, status, total_amount, customer_id, note, payment_method, shipping_address, shipping_name, shipping_phone, updated_at) VALUES (1, 'ORD-20260201001', '2026-02-01 10:30:00', 0.00, 'COMPLETED', 7497000.00, 1, 'Giao giờ hành chính', 'COD', '789 Trần Hưng Đạo, Quận 5, TP.HCM', 'Lê Văn An', '0912345678', '2026-02-03 14:00:00') ON CONFLICT DO NOTHING;
INSERT INTO orders (id, code, created_at, discount_amount, status, total_amount, customer_id, note, payment_method, shipping_address, shipping_name, shipping_phone, updated_at) VALUES (2, 'ORD-20260215002', '2026-02-15 08:15:00', 0.00, 'PENDING', 4500000.00, 2, NULL, 'QR_TRANSFER', '12 Võ Văn Tần, Quận 3, TP.HCM', 'Phạm Thị Bình', '0987654321', '2026-02-15 08:15:00') ON CONFLICT DO NOTHING;
INSERT INTO orders (id, code, created_at, discount_amount, status, total_amount, customer_id, note, payment_method, shipping_address, shipping_name, shipping_phone, updated_at) VALUES (3, 'ORD-20260220003', '2026-02-20 14:45:00', 50000.00, 'CONFIRMED', 8397000.00, 3, 'Gọi trước khi giao', 'COD', '99 Điện Biên Phủ, Bình Thạnh, TP.HCM', 'Hoàng Minh Châu', '0909123456', '2026-02-20 14:45:00') ON CONFLICT DO NOTHING;
INSERT INTO orders (id, code, created_at, discount_amount, status, total_amount, customer_id, note, payment_method, shipping_address, shipping_name, shipping_phone, updated_at) VALUES (4, 'ORD-20260222004', '2026-02-22 16:20:00', 0.00, 'CONFIRMED', 4398000.00, 1, NULL, 'QR_TRANSFER', '789 Trần Hưng Đạo, Quận 5, TP.HCM', 'Lê Văn An', '0912345678', '2026-02-22 17:00:00') ON CONFLICT DO NOTHING;
INSERT INTO orders (id, code, created_at, discount_amount, status, total_amount, customer_id, note, payment_method, shipping_address, shipping_name, shipping_phone, updated_at) VALUES (5, 'ORD-20260225005', '2026-02-25 09:00:00', 0.00, 'CONFIRMED', 1499000.00, 2, 'Khách hủy - đổi ý', 'COD', '12 Võ Văn Tần, Quận 3, TP.HCM', 'Phạm Thị Bình', '0987654321', '2026-02-25 09:00:00') ON CONFLICT DO NOTHING;

-- 18. Order Items
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (1, '/image/nike-af1-white.jpg', 'Nike Air Force 1 ''07', 1, 2999000.00, 2999000.00, 'SIZE: 42, COLOR: Đen', 1, 3) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (2, '/image/adidas-ultraboost-black.jpg', 'Adidas Ultraboost 22', 1, 4500000.00, 4500000.00, 'SIZE: 41, COLOR: Đen', 1, 6) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (3, '/image/adidas-ultraboost-black.jpg', 'Adidas Ultraboost 22', 1, 4500000.00, 4500000.00, 'SIZE: 41, COLOR: Trắng', 2, 8) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (4, '/image/jordan1-mid-red.jpg', 'Nike Air Jordan 1 Mid', 1, 3899000.00, 3899000.00, 'SIZE: 42, COLOR: Đỏ', 3, 10) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (5, '/image/puma-suede-black.jpg', 'Puma Suede Classic XXI', 1, 1899000.00, 1899000.00, 'SIZE: 42, COLOR: Đen', 3, 13) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (6, '/image/nb-574-grey.jpg', 'New Balance 574 Core', 1, 2599000.00, 2599000.00, 'SIZE: 42, COLOR: Xám', 3, 15) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (7, '/image/nike-af1-white.jpg', 'Nike Air Force 1 ''07', 1, 2999000.00, 2999000.00, 'SIZE: 40, COLOR: Trắng', 4, 4) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (8, '/image/converse-chuck-black.jpg', 'Converse Chuck Taylor All Star', 1, 1499000.00, 1499000.00, 'SIZE: 39, COLOR: Đen', 4, 17) ON CONFLICT DO NOTHING;
INSERT INTO order_items (id, image_url, product_name, quantity, total_price, unit_price, variant_info, order_id, product_variant_id) VALUES (9, '/image/converse-chuck-black.jpg', 'Converse Chuck Taylor All Star', 1, 1499000.00, 1499000.00, 'SIZE: 40, COLOR: Trắng', 5, 19) ON CONFLICT DO NOTHING;

-- 19. Promotions (Vouchers)
INSERT INTO promotions (id, code, created_at, deleted_at, description, discount_type, discount_value, end_date, is_active, name, start_date, max_usage, min_order_amount, used_count) VALUES (1, 'WELCOME10', NOW(), NULL, 'Ưu đãi cho khách hàng mới', 'PERCENTAGE', 10.00, '2026-12-31 00:00:00', true, 'Giảm 10% đơn đầu', '2026-01-01 00:00:00', 100, 500000.00, 6) ON CONFLICT DO NOTHING;
INSERT INTO promotions (id, code, created_at, deleted_at, description, discount_type, discount_value, end_date, is_active, name, start_date, max_usage, min_order_amount, used_count) VALUES (2, 'SUMMER50K', NOW(), NULL, 'Giảm 50.000đ cho đơn từ 500K', 'FIXED_AMOUNT', 50000.00, '2026-08-31 00:00:00', true, 'Giảm 50K mùa hè', '2026-06-01 00:00:00', 50, 1000000.00, 12) ON CONFLICT DO NOTHING;
INSERT INTO promotions (id, code, created_at, deleted_at, description, discount_type, discount_value, end_date, is_active, name, start_date, max_usage, min_order_amount, used_count) VALUES (3, 'FREESHIP', NOW(), NULL, 'Giảm 30.000đ phí ship cho đơn từ 300K', 'FIXED_AMOUNT', 30000.00, '2026-12-31 00:00:00', true, 'Miễn phí vận chuyển', '2026-01-01 00:00:00', 200, 300000.00, 45) ON CONFLICT DO NOTHING;
INSERT INTO promotions (id, code, created_at, deleted_at, description, discount_type, discount_value, end_date, is_active, name, start_date, max_usage, min_order_amount, used_count) VALUES (4, 'VIP20', NOW(), NULL, 'Ưu đãi đặc biệt cho khách VIP - giảm 20%', 'PERCENTAGE', 20.00, '2026-06-30 00:00:00', true, 'VIP giảm 20%', '2026-01-01 00:00:00', 30, 2000000.00, 8) ON CONFLICT DO NOTHING;
INSERT INTO promotions (id, code, created_at, deleted_at, description, discount_type, discount_value, end_date, is_active, name, start_date, max_usage, min_order_amount, used_count) VALUES (5, 'EXPIRED01', NOW(), NULL, 'Voucher test hết hạn', 'FIXED_AMOUNT', 100000.00, '2025-12-31 00:00:00', true, 'Voucher đã hết hạn', '2025-01-01 00:00:00', NULL, NULL, 0) ON CONFLICT DO NOTHING;

-- 20. Reset sequences to max(id) + 1
SELECT setval('attributes_id_seq', (SELECT COALESCE(MAX(id), 0) FROM attributes) + 1, false);
SELECT setval('attribute_values_id_seq', (SELECT COALESCE(MAX(id), 0) FROM attribute_values) + 1, false);
SELECT setval('brands_id_seq', (SELECT COALESCE(MAX(id), 0) FROM brands) + 1, false);
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 0) FROM categories) + 1, false);
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 0) FROM roles) + 1, false);
SELECT setval('user_profiles_id_seq', (SELECT COALESCE(MAX(id), 0) FROM user_profiles) + 1, false);
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users) + 1, false);
SELECT setval('customers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM customers) + 1, false);
SELECT setval('origins_id_seq', (SELECT COALESCE(MAX(id), 0) FROM origins) + 1, false);
SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM suppliers) + 1, false);
SELECT setval('stores_id_seq', (SELECT COALESCE(MAX(id), 0) FROM stores) + 1, false);
SELECT setval('shipping_providers_id_seq', (SELECT COALESCE(MAX(id), 0) FROM shipping_providers) + 1, false);
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 0) FROM products) + 1, false);
SELECT setval('product_variants_id_seq', (SELECT COALESCE(MAX(id), 0) FROM product_variants) + 1, false);
SELECT setval('variant_attribute_values_id_seq', (SELECT COALESCE(MAX(id), 0) FROM variant_attribute_values) + 1, false);
SELECT setval('product_images_id_seq', (SELECT COALESCE(MAX(id), 0) FROM product_images) + 1, false);
SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 0) FROM orders) + 1, false);
SELECT setval('order_items_id_seq', (SELECT COALESCE(MAX(id), 0) FROM order_items) + 1, false);
SELECT setval('promotions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM promotions) + 1, false);
