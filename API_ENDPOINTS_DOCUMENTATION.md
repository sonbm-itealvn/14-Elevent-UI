# Tài Liệu Mô Tả API Endpoints - 14Elevent

## Tổng Quan

Tài liệu này mô tả chi tiết tất cả các API endpoints trong hệ thống 14Elevent, bao gồm phương thức HTTP, đường dẫn, tham số, và **quyền truy cập** của từng endpoint.

---

## 1. Authentication APIs (`/api/auth`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều **PUBLIC** (không cần xác thực)

### 1.1. Đăng nhập
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Quyền:** PUBLIC
- **Mô tả:** Đăng nhập vào hệ thống bằng email và mật khẩu
- **Request Body:** `LoginRequest`
- **Response:** `ApiResponse<AuthResponse>`

### 1.2. Đăng ký
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Quyền:** PUBLIC
- **Mô tả:** Đăng ký tài khoản mới
- **Request Body:** `RegisterRequest`
- **Response:** `ApiResponse<AuthResponse>`

### 1.3. Làm mới Token
- **Method:** `POST`
- **Path:** `/api/auth/refresh`
- **Quyền:** PUBLIC
- **Mô tả:** Làm mới access token bằng refresh token
- **Request Body:** `RefreshTokenRequest`
- **Response:** `ApiResponse<AuthResponse>`

### 1.4. Đăng xuất
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Quyền:** PUBLIC
- **Mô tả:** Đăng xuất và vô hiệu hóa refresh token
- **Request Body:** `RefreshTokenRequest`
- **Response:** `ApiResponse<Void>`

---

## 2. Password Reset APIs (`/api/auth/password`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều **PUBLIC** (không cần xác thực)

### 2.1. Quên mật khẩu
- **Method:** `POST`
- **Path:** `/api/auth/password/forgot`
- **Quyền:** PUBLIC
- **Mô tả:** Gửi email đặt lại mật khẩu
- **Request Body:** `ForgotPasswordRequest`
- **Response:** `ApiResponse<String>`

### 2.2. Đặt lại mật khẩu
- **Method:** `POST`
- **Path:** `/api/auth/password/reset`
- **Quyền:** PUBLIC
- **Mô tả:** Đặt lại mật khẩu với token từ email
- **Request Body:** `ResetPasswordRequest`
- **Response:** `ApiResponse<String>`

### 2.3. Kiểm tra Token
- **Method:** `GET`
- **Path:** `/api/auth/password/validate-token`
- **Quyền:** PUBLIC
- **Mô tả:** Kiểm tra token đặt lại mật khẩu có hợp lệ không
- **Query Parameters:** `token` (String)
- **Response:** `ApiResponse<Boolean>`

---

## 3. OAuth2 APIs (`/api/oauth2`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều **PUBLIC** (không cần xác thực)

### 3.1. Lấy OAuth2 Login URLs
- **Method:** `GET`
- **Path:** `/api/oauth2/login-urls`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy danh sách URL đăng nhập OAuth2 (Google, Facebook)
- **Response:** `ApiResponse<List<OAuth2LoginUrlResponse>>`

---

## 4. Category APIs (`/api/categories`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều **PUBLIC** (không cần xác thực)

### 4.1. Lấy cây danh mục
- **Method:** `GET`
- **Path:** `/api/categories/tree`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy toàn bộ cây danh mục (bao gồm danh mục con)
- **Response:** `ApiResponse<List<CategoryTreeResponse>>`

### 4.2. Lấy danh mục gốc
- **Method:** `GET`
- **Path:** `/api/categories`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy danh sách các danh mục gốc (không có danh mục cha)
- **Response:** `ApiResponse<List<CategoryResponse>>`

### 4.3. Lấy danh mục theo slug
- **Method:** `GET`
- **Path:** `/api/categories/{slug}`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy thông tin chi tiết danh mục theo slug
- **Path Parameters:** `slug` (String)
- **Response:** `ApiResponse<CategoryResponse>`

---

## 5. Admin Category APIs (`/api/admin/categories`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều yêu cầu **ROLE_ADMIN** (quyền quản trị viên)

### 5.1. Tạo danh mục
- **Method:** `POST`
- **Path:** `/api/admin/categories`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Tạo danh mục mới
- **Request Body:** `CreateCategoryRequest`
- **Response:** `ApiResponse<CategoryResponse>`

### 5.2. Cập nhật danh mục
- **Method:** `PUT`
- **Path:** `/api/admin/categories/{id}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Cập nhật thông tin danh mục
- **Path Parameters:** `id` (Long)
- **Request Body:** `UpdateCategoryRequest`
- **Response:** `ApiResponse<CategoryResponse>`

### 5.3. Lấy danh mục theo ID
- **Method:** `GET`
- **Path:** `/api/admin/categories/{id}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Lấy thông tin chi tiết danh mục theo ID (dành cho admin)
- **Path Parameters:** `id` (Long)
- **Response:** `ApiResponse<CategoryResponse>`

### 5.4. Xóa danh mục
- **Method:** `DELETE`
- **Path:** `/api/admin/categories/{id}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Xóa danh mục
- **Path Parameters:** `id` (Long)
- **Response:** `ApiResponse<Void>`

### 5.5. Kiểm tra slug
- **Method:** `GET`
- **Path:** `/api/admin/categories/check-slug`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Kiểm tra slug có sẵn để sử dụng không
- **Query Parameters:** 
  - `slug` (String, required)
  - `excludeId` (Long, optional) - ID danh mục cần loại trừ khi kiểm tra
- **Response:** `ApiResponse<SlugCheckResponse>`

---

## 6. Product APIs (`/api/products`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều **PUBLIC** (không cần xác thực)

### 6.1. Tìm kiếm sản phẩm
- **Method:** `GET`
- **Path:** `/api/products`
- **Quyền:** PUBLIC
- **Mô tả:** Tìm kiếm và lọc sản phẩm với nhiều tiêu chí
- **Query Parameters:**
  - `categorySlug` (String, optional)
  - `keyword` (String, optional)
  - `brand` (String, optional)
  - `origin` (String, optional)
  - `minPrice` (String, optional)
  - `maxPrice` (String, optional)
  - `sort` (String, default: "newest")
  - `page` (int, default: 0)
  - `size` (int, default: 10)
- **Response:** `ApiResponse<ProductPageResponse>`

### 6.2. Lấy sản phẩm theo danh mục
- **Method:** `GET`
- **Path:** `/api/categories/{slug}/products`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy danh sách sản phẩm theo slug danh mục
- **Path Parameters:** `slug` (String)
- **Query Parameters:**
  - `keyword` (String, optional)
  - `brand` (String, optional)
  - `origin` (String, optional)
  - `minPrice` (String, optional)
  - `maxPrice` (String, optional)
  - `sort` (String, default: "newest")
  - `page` (int, default: 0)
  - `size` (int, default: 10)
- **Response:** `ApiResponse<ProductPageResponse>`

### 6.3. Lấy chi tiết sản phẩm
- **Method:** `GET`
- **Path:** `/api/products/{slug}`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy thông tin chi tiết sản phẩm theo slug
- **Path Parameters:** `slug` (String)
- **Response:** `ApiResponse<ProductDetailResponse>`

### 6.4. Lấy hình ảnh sản phẩm
- **Method:** `GET`
- **Path:** `/api/products/{productId}/images`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy danh sách hình ảnh của sản phẩm
- **Path Parameters:** `productId` (Long)
- **Response:** `ApiResponse<List<ProductImageResponse>>`

### 6.5. Lấy biến thể sản phẩm
- **Method:** `GET`
- **Path:** `/api/products/{productId}/variants`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy danh sách biến thể (variant) của sản phẩm
- **Path Parameters:** `productId` (Long)
- **Response:** `ApiResponse<List<ProductVariantResponse>>`

### 6.6. Lấy chi tiết biến thể sản phẩm
- **Method:** `GET`
- **Path:** `/api/product-variants/{variantId}`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy thông tin chi tiết một biến thể sản phẩm
- **Path Parameters:** `variantId` (Long)
- **Response:** `ApiResponse<ProductVariantResponse>`

### 6.7. Tìm kiếm sản phẩm (gợi ý)
- **Method:** `GET`
- **Path:** `/api/products/search`
- **Quyền:** PUBLIC
- **Mô tả:** Tìm kiếm sản phẩm với từ khóa, trả về danh sách gợi ý
- **Query Parameters:** `q` (String, required)
- **Response:** `ApiResponse<List<ProductSuggestionResponse>>`

### 6.8. Lấy sản phẩm liên quan
- **Method:** `GET`
- **Path:** `/api/products/{productId}/related`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy danh sách sản phẩm liên quan
- **Path Parameters:** `productId` (Long)
- **Response:** `ApiResponse<List<ProductListItemResponse>>`

### 6.9. Lấy sản phẩm bán chạy
- **Method:** `GET`
- **Path:** `/api/products/top-selling`
- **Quyền:** PUBLIC
- **Mô tả:** Lấy danh sách sản phẩm bán chạy nhất
- **Query Parameters:** `limit` (int, default: 8, min: 1)
- **Response:** `ApiResponse<List<ProductListItemResponse>>`

---

## 7. Admin Product APIs (`/api/admin/products`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều yêu cầu **ROLE_ADMIN** (quyền quản trị viên)

### 7.1. Tìm kiếm sản phẩm (Admin)
- **Method:** `GET`
- **Path:** `/api/admin/products`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Tìm kiếm và quản lý sản phẩm (dành cho admin)
- **Request:** `@ModelAttribute AdminProductSearchRequest`
- **Response:** `ApiResponse<AdminProductPageResponse>`

### 7.2. Lấy chi tiết sản phẩm (Admin)
- **Method:** `GET`
- **Path:** `/api/admin/products/{id}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Lấy thông tin chi tiết sản phẩm theo ID (dành cho admin)
- **Path Parameters:** `id` (Long)
- **Response:** `ApiResponse<AdminProductDetailResponse>`

### 7.3. Tạo sản phẩm
- **Method:** `POST`
- **Path:** `/api/admin/products`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Tạo sản phẩm mới
- **Request Body:** `AdminCreateProductRequest`
- **Response:** `ApiResponse<AdminProductDetailResponse>`

### 7.4. Cập nhật sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{id}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Cập nhật thông tin sản phẩm
- **Path Parameters:** `id` (Long)
- **Request Body:** `AdminUpdateProductRequest`
- **Response:** `ApiResponse<AdminProductDetailResponse>`

### 7.5. Cập nhật trạng thái sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{id}/status`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Bật/tắt trạng thái sản phẩm (active/inactive)
- **Path Parameters:** `id` (Long)
- **Request Body:** `ToggleProductStatusRequest`
- **Response:** `ApiResponse<Void>`

### 7.6. Kiểm tra slug sản phẩm
- **Method:** `GET`
- **Path:** `/api/admin/products/check-slug`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Kiểm tra slug sản phẩm có sẵn để sử dụng không
- **Query Parameters:**
  - `slug` (String, required)
  - `excludeId` (Long, optional)
- **Response:** `ApiResponse<ProductSlugCheckResponse>`

### 7.7. Tạo biến thể sản phẩm
- **Method:** `POST`
- **Path:** `/api/admin/products/{productId}/variants`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Tạo biến thể mới cho sản phẩm
- **Path Parameters:** `productId` (Long)
- **Request Body:** `AdminCreateVariantRequest`
- **Response:** `ApiResponse<ProductVariantResponse>`

### 7.8. Cập nhật biến thể sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{productId}/variants/{variantId}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Cập nhật thông tin biến thể sản phẩm
- **Path Parameters:** 
  - `productId` (Long)
  - `variantId` (Long)
- **Request Body:** `AdminUpdateVariantRequest`
- **Response:** `ApiResponse<ProductVariantResponse>`

### 7.9. Cập nhật tồn kho biến thể
- **Method:** `PUT`
- **Path:** `/api/admin/products/{productId}/variants/{variantId}/stock`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Cập nhật số lượng tồn kho của biến thể
- **Path Parameters:**
  - `productId` (Long)
  - `variantId` (Long)
- **Request Body:** `AdminUpdateVariantStockRequest`
- **Response:** `ApiResponse<ProductVariantResponse>`

### 7.10. Xóa biến thể sản phẩm
- **Method:** `DELETE`
- **Path:** `/api/admin/products/{productId}/variants/{variantId}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Xóa biến thể sản phẩm
- **Path Parameters:**
  - `productId` (Long)
  - `variantId` (Long)
- **Response:** `ApiResponse<Void>`

### 7.11. Upload hình ảnh sản phẩm
- **Method:** `POST`
- **Path:** `/api/admin/products/{productId}/images`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Content-Type:** `multipart/form-data`
- **Mô tả:** Upload một hoặc nhiều hình ảnh cho sản phẩm
- **Path Parameters:** `productId` (Long)
- **Request Parameters:**
  - `files` (List<MultipartFile>, required)
  - `thumbnail` (Boolean, optional) - Đánh dấu ảnh đại diện
- **Response:** `ApiResponse<List<ProductImageResponse>>`

### 7.12. Cập nhật hình ảnh sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{productId}/images/{imageId}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Cập nhật thông tin hình ảnh (ví dụ: đặt làm ảnh đại diện)
- **Path Parameters:**
  - `productId` (Long)
  - `imageId` (Long)
- **Request Body:** `AdminUpdateImageRequest`
- **Response:** `ApiResponse<ProductImageResponse>`

### 7.13. Xóa hình ảnh sản phẩm
- **Method:** `DELETE`
- **Path:** `/api/admin/products/{productId}/images/{imageId}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Xóa hình ảnh sản phẩm
- **Path Parameters:**
  - `productId` (Long)
  - `imageId` (Long)
- **Response:** `ApiResponse<Void>`

---

## 8. User APIs (`/api/users`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều yêu cầu **AUTHENTICATED USER** (người dùng đã đăng nhập)

### 8.1. Lấy thông tin người dùng hiện tại
- **Method:** `GET`
- **Path:** `/api/users/me`
- **Quyền:** **AUTHENTICATED USER** (sử dụng `@AuthenticationPrincipal`)
- **Mô tả:** Lấy thông tin profile của người dùng đang đăng nhập
- **Response:** `ApiResponse<UserProfileResponse>`

### 8.2. Cập nhật profile
- **Method:** `PUT`
- **Path:** `/api/users/me`
- **Quyền:** **AUTHENTICATED USER** (sử dụng `@AuthenticationPrincipal`)
- **Mô tả:** Cập nhật thông tin profile của người dùng
- **Request Body:** `UpdateProfileRequest`
- **Response:** `ApiResponse<UserProfileResponse>`

### 8.3. Đổi mật khẩu
- **Method:** `PUT`
- **Path:** `/api/users/me/password`
- **Quyền:** **AUTHENTICATED USER** (sử dụng `@AuthenticationPrincipal`)
- **Mô tả:** Đổi mật khẩu của người dùng
- **Request Body:** `ChangePasswordRequest`
- **Response:** `ApiResponse<Void>`

### 8.4. Cập nhật avatar
- **Method:** `PUT`
- **Path:** `/api/users/me/avatar`
- **Quyền:** **AUTHENTICATED USER** (sử dụng `@AuthenticationPrincipal`)
- **Content-Type:** `multipart/form-data`
- **Mô tả:** Cập nhật ảnh đại diện của người dùng
- **Request Parameters:** `file` (MultipartFile, required)
- **Response:** `ApiResponse<UserProfileResponse>`

---

## 9. Admin User APIs (`/api/admin/users`)

**Quyền truy cập:** Tất cả các endpoint trong nhóm này đều yêu cầu **ROLE_ADMIN** (quyền quản trị viên)

### 9.1. Lấy danh sách người dùng
- **Method:** `GET`
- **Path:** `/api/admin/users`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Lấy danh sách người dùng với phân trang và tìm kiếm
- **Query Parameters:**
  - `keyword` (String, optional) - Tìm kiếm theo tên, email
  - `active` (Boolean, optional) - Lọc theo trạng thái active
  - `page` (int, default: 0)
  - `size` (int, default: 10)
  - `sortBy` (String, default: "id")
  - `sortDir` (String, default: "asc")
- **Response:** `ApiResponse<UserPageResponse>`

### 9.2. Lấy thông tin người dùng theo ID
- **Method:** `GET`
- **Path:** `/api/admin/users/{userId}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Lấy thông tin chi tiết người dùng theo ID
- **Path Parameters:** `userId` (Long)
- **Response:** `ApiResponse<UserProfileResponse>`

### 9.3. Tạo người dùng
- **Method:** `POST`
- **Path:** `/api/admin/users`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Tạo tài khoản người dùng mới (bởi admin)
- **Request Body:** `AdminCreateUserRequest`
- **Response:** `ApiResponse<UserProfileResponse>`

### 9.4. Cập nhật người dùng
- **Method:** `PUT`
- **Path:** `/api/admin/users/{userId}`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Cập nhật thông tin người dùng
- **Path Parameters:** `userId` (Long)
- **Request Body:** `AdminUpdateUserRequest`
- **Response:** `ApiResponse<UserProfileResponse>`

### 9.5. Bật/tắt trạng thái người dùng
- **Method:** `PUT`
- **Path:** `/api/admin/users/{userId}/active`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Kích hoạt hoặc vô hiệu hóa tài khoản người dùng
- **Path Parameters:** `userId` (Long)
- **Request Body:** `ToggleActiveRequest`
- **Response:** `ApiResponse<UserProfileResponse>`

### 9.6. Đặt lại mật khẩu người dùng
- **Method:** `POST`
- **Path:** `/api/admin/users/{userId}/reset-password`
- **Quyền:** **ADMIN ONLY** (`@PreAuthorize("hasRole('ADMIN')")`)
- **Mô tả:** Đặt lại mật khẩu cho người dùng (admin có thể reset mật khẩu của bất kỳ user nào)
- **Path Parameters:** `userId` (Long)
- **Response:** `ApiResponse<Void>`

---

## 10. Cart APIs (`/api/cart`)

**Quyền truy cập:** Hỗ trợ cả **AUTHENTICATED USER** và **GUEST USER** (thông qua `X-Cart-Token` header)

### 10.1. Lấy giỏ hàng hiện tại
- **Method:** `GET`
- **Path:** `/api/cart`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (sử dụng `X-Cart-Token` header)
- **Mô tả:** Lấy thông tin giỏ hàng của người dùng đã đăng nhập hoặc guest (qua cart token)
- **Headers:** `X-Cart-Token` (String, optional) - Token cho guest user
- **Response:** `ApiResponse<CartResponse>`

### 10.2. Thêm sản phẩm vào giỏ hàng
- **Method:** `POST`
- **Path:** `/api/cart/items`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (sử dụng `X-Cart-Token` header)
- **Mô tả:** Thêm sản phẩm vào giỏ hàng
- **Headers:** `X-Cart-Token` (String, optional)
- **Request Body:** `CartItemRequest`
- **Response:** `ApiResponse<CartResponse>`

### 10.3. Cập nhật số lượng sản phẩm
- **Method:** `PATCH`
- **Path:** `/api/cart/items/{itemId}`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (sử dụng `X-Cart-Token` header)
- **Mô tả:** Cập nhật số lượng sản phẩm trong giỏ hàng
- **Headers:** `X-Cart-Token` (String, optional)
- **Path Parameters:** `itemId` (Long)
- **Request Body:** `UpdateCartItemQuantityRequest`
- **Response:** `ApiResponse<CartResponse>`

### 10.4. Xóa sản phẩm khỏi giỏ hàng
- **Method:** `DELETE`
- **Path:** `/api/cart/items/{itemId}`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (sử dụng `X-Cart-Token` header)
- **Mô tả:** Xóa một sản phẩm khỏi giỏ hàng
- **Headers:** `X-Cart-Token` (String, optional)
- **Path Parameters:** `itemId` (Long)
- **Response:** `ApiResponse<Void>`

### 10.5. Xóa toàn bộ giỏ hàng
- **Method:** `DELETE`
- **Path:** `/api/cart`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (sử dụng `X-Cart-Token` header)
- **Mô tả:** Xóa toàn bộ sản phẩm trong giỏ hàng
- **Headers:** `X-Cart-Token` (String, optional)
- **Response:** `ApiResponse<Void>`

### 10.6. Gộp giỏ hàng guest
- **Method:** `POST`
- **Path:** `/api/cart/merge`
- **Quyền:** **AUTHENTICATED USER** (yêu cầu đăng nhập)
- **Mô tả:** Gộp giỏ hàng của guest (từ cart token) vào giỏ hàng của user đã đăng nhập
- **Headers:** `X-Cart-Token` (String, optional) - Token giỏ hàng guest cần gộp
- **Response:** `ApiResponse<CartResponse>`

---

## 11. Order APIs (`/api`)

**Quyền truy cập:** Hỗ trợ cả **AUTHENTICATED USER** và **GUEST USER** (thông qua `X-Cart-Token` header)

### 11.1. Xem trước thanh toán
- **Method:** `GET`
- **Path:** `/api/checkout/preview`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (sử dụng `X-Cart-Token` header)
- **Mô tả:** Xem trước thông tin đơn hàng trước khi thanh toán (tổng tiền, phí ship, v.v.)
- **Headers:** `X-Cart-Token` (String, optional)
- **Response:** `ApiResponse<CheckoutPreviewResponse>`

### 11.2. Xác nhận thanh toán
- **Method:** `POST`
- **Path:** `/api/checkout/confirm`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (sử dụng `X-Cart-Token` header)
- **Mô tả:** Xác nhận và tạo đơn hàng, xử lý thanh toán
- **Headers:** `X-Cart-Token` (String, optional)
- **Request Body:** `CheckoutConfirmRequest`
- **Response:** `ApiResponse<CheckoutConfirmResponse>`

### 11.3. Lấy danh sách đơn hàng
- **Method:** `GET`
- **Path:** `/api/orders`
- **Quyền:** **AUTHENTICATED USER** (yêu cầu đăng nhập)
- **Mô tả:** Lấy danh sách đơn hàng của người dùng đã đăng nhập
- **Query Parameters:**
  - `page` (int, default: 0)
  - `size` (int, default: 10)
- **Response:** `ApiResponse<OrderPageResponse>`

### 11.4. Lấy chi tiết đơn hàng
- **Method:** `GET`
- **Path:** `/api/orders/{orderId}`
- **Quyền:** **AUTHENTICATED USER** (yêu cầu đăng nhập, chỉ xem được đơn hàng của chính mình)
- **Mô tả:** Lấy thông tin chi tiết một đơn hàng
- **Path Parameters:** `orderId` (Long)
- **Response:** `ApiResponse<OrderDetailResponse>`

### 11.5. Kiểm tra trạng thái thanh toán
- **Method:** `GET`
- **Path:** `/api/payments/status`
- **Quyền:** **AUTHENTICATED USER** hoặc **GUEST** (có thể kiểm tra qua email)
- **Mô tả:** Kiểm tra trạng thái thanh toán của đơn hàng
- **Query Parameters:**
  - `txnRef` (String, required) - Mã giao dịch
  - `buyerEmail` (String, optional) - Email người mua (cho guest)
- **Response:** `ApiResponse<PaymentStatusResponse>`

### 11.6. Callback VNPay
- **Method:** `GET`
- **Path:** `/api/payments/vnpay/callback`
- **Quyền:** **PUBLIC** (callback từ VNPay)
- **Mô tả:** Endpoint callback từ VNPay sau khi thanh toán
- **Response:** String (HTML redirect)

---

## 12. Upload APIs (`/api/uploads`)

**Quyền truy cập:** **PUBLIC** (không có annotation bảo mật, nhưng nên được bảo vệ trong production)

### 12.1. Upload hình ảnh
- **Method:** `POST`
- **Path:** `/api/uploads/image`
- **Quyền:** **PUBLIC** (không có annotation bảo mật)
- **Content-Type:** `multipart/form-data`
- **Mô tả:** Upload một hình ảnh lên Cloudinary
- **Request Parameters:**
  - `file` (MultipartFile, required)
  - `folder` (String, optional) - Thư mục trên Cloudinary
- **Response:** `ApiResponse<UploadImageResponse>`

---

## 13. Email APIs (`/api/email`)

**Quyền truy cập:** **PUBLIC** (không có annotation bảo mật, nhưng nên được bảo vệ trong production)

### 13.1. Gửi email test
- **Method:** `POST`
- **Path:** `/api/email/test`
- **Quyền:** **PUBLIC** (không có annotation bảo mật)
- **Mô tả:** Gửi email test để kiểm tra cấu hình email
- **Request Body:** `TestEmailRequest`
- **Response:** `ApiResponse<String>`

### 13.2. Gửi email test (async)
- **Method:** `POST`
- **Path:** `/api/email/test-async`
- **Quyền:** **PUBLIC** (không có annotation bảo mật)
- **Mô tả:** Gửi email test bất đồng bộ
- **Request Body:** `TestEmailRequest`
- **Response:** `ApiResponse<String>`

---

## Tóm Tắt Quyền Truy Cập

### PUBLIC (Không cần xác thực)
- Tất cả endpoints trong `/api/auth/**`
- Tất cả endpoints trong `/api/categories`
- Tất cả endpoints trong `/api/products` và `/api/categories/{slug}/products`
- Tất cả endpoints trong `/api/oauth2`
- Tất cả endpoints trong `/api/auth/password`
- `/api/uploads/image`
- `/api/email/test` và `/api/email/test-async`
- `/api/payments/vnpay/callback`

### AUTHENTICATED USER (Yêu cầu đăng nhập)
- Tất cả endpoints trong `/api/users/me/**`
- `/api/cart/merge`
- `/api/orders` (danh sách đơn hàng)
- `/api/orders/{orderId}` (chi tiết đơn hàng)

### AUTHENTICATED USER hoặc GUEST (Hỗ trợ cả hai)
- Tất cả endpoints trong `/api/cart` (trừ `/merge`)
- `/api/checkout/preview`
- `/api/checkout/confirm`
- `/api/payments/status`

### ADMIN ONLY (Yêu cầu ROLE_ADMIN)
- Tất cả endpoints trong `/api/admin/categories`
- Tất cả endpoints trong `/api/admin/products`
- Tất cả endpoints trong `/api/admin/users`

---

## Lưu Ý Bảo Mật

1. **SecurityConfig hiện tại:** Trong file `SecurityConfig.java`, tất cả requests đều được `permitAll()` (dòng 64), nhưng các annotation `@PreAuthorize("hasRole('ADMIN')")` ở cấp interface vẫn có hiệu lực và sẽ kiểm tra quyền ADMIN.

2. **Upload và Email APIs:** Các endpoint `/api/uploads/image` và `/api/email/**` hiện không có annotation bảo mật, nên được bảo vệ trong môi trường production (có thể thêm authentication hoặc rate limiting).

3. **Cart Token:** Guest users có thể sử dụng giỏ hàng thông qua header `X-Cart-Token`. Token này được tạo tự động khi guest thêm sản phẩm vào giỏ hàng.

4. **OAuth2 Callback:** Endpoint `/oauth2/callback/*` được xử lý bởi Spring Security OAuth2, không phải REST API endpoint.

---

**Phiên bản:** 1.0

