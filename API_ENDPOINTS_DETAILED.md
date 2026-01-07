# Tài Liệu Chi Tiết API Endpoints - 14Elevent (Dành cho Frontend)

## Tổng Quan

Tài liệu này mô tả chi tiết tất cả các API endpoints với đầy đủ thông tin về:
- **Headers** cần truyền đi
- **Request Body/Query Parameters** với từng trường dữ liệu
- **Response Body** với từng trường dữ liệu trả về
- **Quyền truy cập** của từng endpoint

---

## Cấu Trúc Response Chung

Tất cả các API đều trả về dạng `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Thông báo (optional)",
  "errorCode": "Mã lỗi (nếu có)",
  "data": { /* Dữ liệu trả về */ },
  "timestamp": "2024-01-01T00:00:00"
}
```

---

## Headers Chung

### Authorization Header
- **Tên:** `Authorization`
- **Giá trị:** `Bearer {accessToken}`
- **Mô tả:** Cần thiết cho các endpoint yêu cầu authentication
- **Ví dụ:** `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Cart Token Header
- **Tên:** `X-Cart-Token`
- **Giá trị:** `{cartToken}`
- **Mô tả:** Token cho guest user để quản lý giỏ hàng
- **Ví dụ:** `X-Cart-Token: abc123def456`

---

## 1. Authentication APIs

### 1.1. Đăng nhập
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Quyền:** PUBLIC
- **Headers:** Không cần

**Request Body:**
```json
{
  "email": "string (required, email format)",
  "password": "string (required)",
  "cartToken": "string (optional) - Token giỏ hàng guest để merge sau khi login"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenType": "Bearer",
    "accessToken": "string - JWT access token",
    "expiresIn": 3600,
    "refreshToken": "string - JWT refresh token",
    "cart": {
      "cartToken": "string",
      "userCart": true,
      "items": [ /* CartItemResponse[] */ ],
      "totalItems": 0,
      "subtotal": 0.00
    }
  }
}
```

---

### 1.2. Đăng ký
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Quyền:** PUBLIC
- **Headers:** Không cần

**Request Body:**
```json
{
  "email": "string (required, email format, max 150 chars)",
  "password": "string (required, 6-100 chars)",
  "fullName": "string (required, max 150 chars)",
  "phone": "string (optional, format: +84xxxxxxxxx hoặc 0xxxxxxxxx)",
  "cartToken": "string (optional) - Token giỏ hàng guest để merge sau khi đăng ký"
}
```

**Response:** Giống như endpoint đăng nhập (AuthResponse)

---

### 1.3. Làm mới Token
- **Method:** `POST`
- **Path:** `/api/auth/refresh`
- **Quyền:** PUBLIC
- **Headers:** Không cần

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response:** Giống như endpoint đăng nhập (AuthResponse)

---

### 1.4. Đăng xuất
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Quyền:** PUBLIC
- **Headers:** Không cần

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

## 2. Password Reset APIs

### 2.1. Quên mật khẩu
- **Method:** `POST`
- **Path:** `/api/auth/password/forgot`
- **Quyền:** PUBLIC

**Request Body:**
```json
{
  "email": "string (required, email format)"
}
```

**Response:**
```json
{
  "success": true,
  "data": "string - Thông báo thành công"
}
```

---

### 2.2. Đặt lại mật khẩu
- **Method:** `POST`
- **Path:** `/api/auth/password/reset`
- **Quyền:** PUBLIC

**Request Body:**
```json
{
  "token": "string (required) - Token từ email",
  "newPassword": "string (required, 6-100 chars)",
  "confirmPassword": "string (required) - Phải khớp với newPassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": "string - Thông báo thành công"
}
```

---

### 2.3. Kiểm tra Token
- **Method:** `GET`
- **Path:** `/api/auth/password/validate-token`
- **Quyền:** PUBLIC

**Query Parameters:**
- `token` (string, required)

**Response:**
```json
{
  "success": true,
  "data": true // hoặc false nếu token không hợp lệ
}
```

---

## 3. OAuth2 APIs

### 3.1. Lấy OAuth2 Login URLs
- **Method:** `GET`
- **Path:** `/api/oauth2/login-urls`
- **Quyền:** PUBLIC

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "provider": "GOOGLE",
      "authorizationUrl": "https://accounts.google.com/oauth2/authorize?..."
    },
    {
      "provider": "FACEBOOK",
      "authorizationUrl": "https://www.facebook.com/v18.0/dialog/oauth?..."
    }
  ]
}
```

---

## 4. Category APIs (Public)

### 4.1. Lấy cây danh mục
- **Method:** `GET`
- **Path:** `/api/categories/tree`
- **Quyền:** PUBLIC

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Danh mục cha",
      "slug": "danh-muc-cha",
      "children": [
        {
          "id": 2,
          "name": "Danh mục con",
          "slug": "danh-muc-con",
          "children": []
        }
      ]
    }
  ]
}
```

---

### 4.2. Lấy danh mục gốc
- **Method:** `GET`
- **Path:** `/api/categories`
- **Quyền:** PUBLIC

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tên danh mục",
      "slug": "ten-danh-muc",
      "parentId": null,
      "parentName": null,
      "children": [ /* CategoryResponse[] */ ],
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ]
}
```

---

### 4.3. Lấy danh mục theo slug
- **Method:** `GET`
- **Path:** `/api/categories/{slug}`
- **Quyền:** PUBLIC

**Path Parameters:**
- `slug` (string, required)

**Response:** Giống như endpoint 4.2 (CategoryResponse)

---

## 5. Admin Category APIs

**Lưu ý:** Tất cả endpoints trong nhóm này yêu cầu **ROLE_ADMIN** và header `Authorization: Bearer {token}`

### 5.1. Tạo danh mục
- **Method:** `POST`
- **Path:** `/api/admin/categories`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "string (required, max 150 chars)",
  "slug": "string (optional, max 200 chars)",
  "parentId": 1 // Long, optional - ID danh mục cha
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo danh mục thành công",
  "data": {
    "id": 1,
    "name": "Tên danh mục",
    "slug": "ten-danh-muc",
    "parentId": null,
    "parentName": null,
    "children": [],
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

---

### 5.2. Cập nhật danh mục
- **Method:** `PUT`
- **Path:** `/api/admin/categories/{id}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id` (Long, required)

**Request Body:**
```json
{
  "name": "string (optional, max 150 chars)",
  "slug": "string (optional, max 200 chars)",
  "parentId": 1 // Long, optional
}
```

**Response:** Giống như endpoint 5.1

---

### 5.3. Lấy danh mục theo ID
- **Method:** `GET`
- **Path:** `/api/admin/categories/{id}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id` (Long, required)

**Response:** Giống như endpoint 5.1

---

### 5.4. Xóa danh mục
- **Method:** `DELETE`
- **Path:** `/api/admin/categories/{id}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id` (Long, required)

**Response:**
```json
{
  "success": true,
  "message": "Xóa danh mục thành công",
  "data": null
}
```

---

### 5.5. Kiểm tra slug
- **Method:** `GET`
- **Path:** `/api/admin/categories/check-slug`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `slug` (string, required)
- `excludeId` (Long, optional) - ID danh mục cần loại trừ khi kiểm tra

**Response:**
```json
{
  "success": true,
  "data": {
    "slug": "ten-danh-muc",
    "available": true
  }
}
```

---

## 6. Product APIs (Public)

### 6.1. Tìm kiếm sản phẩm
- **Method:** `GET`
- **Path:** `/api/products`
- **Quyền:** PUBLIC

**Query Parameters:**
- `categorySlug` (string, optional)
- `keyword` (string, optional)
- `brand` (string, optional)
- `origin` (string, optional)
- `minPrice` (string, optional) - Format: "100000"
- `maxPrice` (string, optional) - Format: "500000"
- `sort` (string, default: "newest") - Các giá trị: "newest", "price_asc", "price_desc", "name_asc", "name_desc"
- `page` (int, default: 0)
- `size` (int, default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Tên sản phẩm",
        "slug": "ten-san-pham",
        "thumbnail": "https://...",
        "minPrice": 100000.00,
        "brand": "Thương hiệu",
        "origin": "Xuất xứ"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10,
    "first": true,
    "last": false
  }
}
```

---

### 6.2. Lấy sản phẩm theo danh mục
- **Method:** `GET`
- **Path:** `/api/categories/{slug}/products`
- **Quyền:** PUBLIC

**Path Parameters:**
- `slug` (string, required)

**Query Parameters:** Giống như endpoint 6.1 (trừ `categorySlug`)

**Response:** Giống như endpoint 6.1

---

### 6.3. Lấy chi tiết sản phẩm
- **Method:** `GET`
- **Path:** `/api/products/{slug}`
- **Quyền:** PUBLIC

**Path Parameters:**
- `slug` (string, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tên sản phẩm",
    "slug": "ten-san-pham",
    "description": "Mô tả sản phẩm",
    "brand": "Thương hiệu",
    "origin": "Xuất xứ",
    "weight": 500.00,
    "weightUnit": "g",
    "expiryInfo": "Hạn sử dụng",
    "category": {
      "id": 1,
      "name": "Danh mục",
      "slug": "danh-muc"
    },
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00",
    "images": [
      {
        "id": 1,
        "imageUrl": "https://...",
        "thumbnail": true
      }
    ],
    "variants": [
      {
        "id": 1,
        "sku": "SKU001",
        "price": 100000.00,
        "stock": 100,
        "attributes": {
          "size": "M",
          "color": "Đỏ"
        },
        "createdAt": "2024-01-01T00:00:00",
        "updatedAt": "2024-01-01T00:00:00"
      }
    ]
  }
}
```

---

### 6.4. Lấy hình ảnh sản phẩm
- **Method:** `GET`
- **Path:** `/api/products/{productId}/images`
- **Quyền:** PUBLIC

**Path Parameters:**
- `productId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "imageUrl": "https://...",
      "thumbnail": true
    }
  ]
}
```

---

### 6.5. Lấy biến thể sản phẩm
- **Method:** `GET`
- **Path:** `/api/products/{productId}/variants`
- **Quyền:** PUBLIC

**Path Parameters:**
- `productId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sku": "SKU001",
      "price": 100000.00,
      "stock": 100,
      "attributes": {
        "size": "M",
        "color": "Đỏ"
      },
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ]
}
```

---

### 6.6. Lấy chi tiết biến thể
- **Method:** `GET`
- **Path:** `/api/product-variants/{variantId}`
- **Quyền:** PUBLIC

**Path Parameters:**
- `variantId` (Long, required)

**Response:** Giống như endpoint 6.5 (một object thay vì array)

---

### 6.7. Tìm kiếm sản phẩm (gợi ý)
- **Method:** `GET`
- **Path:** `/api/products/search`
- **Quyền:** PUBLIC

**Query Parameters:**
- `q` (string, required) - Từ khóa tìm kiếm

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tên sản phẩm",
      "slug": "ten-san-pham",
      "thumbnail": "https://..."
    }
  ]
}
```

---

### 6.8. Lấy sản phẩm liên quan
- **Method:** `GET`
- **Path:** `/api/products/{productId}/related`
- **Quyền:** PUBLIC

**Path Parameters:**
- `productId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tên sản phẩm",
      "slug": "ten-san-pham",
      "thumbnail": "https://...",
      "minPrice": 100000.00,
      "brand": "Thương hiệu",
      "origin": "Xuất xứ"
    }
  ]
}
```

---

### 6.9. Lấy sản phẩm bán chạy
- **Method:** `GET`
- **Path:** `/api/products/top-selling`
- **Quyền:** PUBLIC

**Query Parameters:**
- `limit` (int, default: 8, min: 1)

**Response:** Giống như endpoint 6.8

---

## 7. Admin Product APIs

**Lưu ý:** Tất cả endpoints trong nhóm này yêu cầu **ROLE_ADMIN** và header `Authorization: Bearer {token}`

### 7.1. Tìm kiếm sản phẩm (Admin)
- **Method:** `GET`
- **Path:** `/api/admin/products`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `keyword` (string, optional)
- `categoryId` (Long, optional)
- `brand` (string, optional)
- `origin` (string, optional)
- `status` (string, optional) - Giá trị: "ACTIVE", "INACTIVE"
- `createdFrom` (datetime, optional) - Format: "2024-01-01T00:00:00"
- `createdTo` (datetime, optional)
- `page` (int, default: 0)
- `size` (int, default: 10)
- `sortBy` (string, default: "createdAt")
- `sortDir` (string, default: "desc") - "asc" hoặc "desc"

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Tên sản phẩm",
        "slug": "ten-san-pham",
        "brand": "Thương hiệu",
        "origin": "Xuất xứ",
        "status": "ACTIVE",
        "categoryName": "Danh mục",
        "minPrice": 100000.00,
        "createdAt": "2024-01-01T00:00:00",
        "updatedAt": "2024-01-01T00:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10,
    "first": true,
    "last": false
  }
}
```

---

### 7.2. Lấy chi tiết sản phẩm (Admin)
- **Method:** `GET`
- **Path:** `/api/admin/products/{id}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tên sản phẩm",
    "slug": "ten-san-pham",
    "description": "Mô tả",
    "brand": "Thương hiệu",
    "origin": "Xuất xứ",
    "weight": 500.00,
    "weightUnit": "g",
    "expiryInfo": "Hạn sử dụng",
    "status": "ACTIVE",
    "category": {
      "id": 1,
      "name": "Danh mục",
      "slug": "danh-muc"
    },
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00",
    "images": [ /* ProductImageResponse[] */ ],
    "variants": [ /* ProductVariantResponse[] */ ]
  }
}
```

---

### 7.3. Tạo sản phẩm
- **Method:** `POST`
- **Path:** `/api/admin/products`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "categoryId": 1, // Long, required
  "name": "string (required, max 255 chars)",
  "slug": "string (optional, max 255 chars)",
  "description": "string (optional)",
  "brand": "string (optional)",
  "origin": "string (optional)",
  "weight": 500.00, // BigDecimal, optional
  "weightUnit": "string (optional)",
  "expiryInfo": "string (optional)",
  "status": "ACTIVE" // ProductStatus: "ACTIVE" hoặc "INACTIVE", optional
}
```

**Response:** Giống như endpoint 7.2

---

### 7.4. Cập nhật sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{id}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id` (Long, required)

**Request Body:** Giống như endpoint 7.3 (tất cả fields đều optional)

**Response:** Giống như endpoint 7.2

---

### 7.5. Cập nhật trạng thái sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{id}/status`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `id` (Long, required)

**Request Body:**
```json
{
  "status": "ACTIVE" // ProductStatus: "ACTIVE" hoặc "INACTIVE", required
}
```

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

### 7.6. Kiểm tra slug sản phẩm
- **Method:** `GET`
- **Path:** `/api/admin/products/check-slug`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `slug` (string, required)
- `excludeId` (Long, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "slug": "ten-san-pham",
    "available": true
  }
}
```

---

### 7.7. Tạo biến thể sản phẩm
- **Method:** `POST`
- **Path:** `/api/admin/products/{productId}/variants`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `productId` (Long, required)

**Request Body:**
```json
{
  "sku": "string (required, max 150 chars)",
  "price": 100000.00, // BigDecimal, required, > 0
  "stock": 100, // Integer, required
  "attributes": { // Map<String, Object>, optional
    "size": "M",
    "color": "Đỏ"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sku": "SKU001",
    "price": 100000.00,
    "stock": 100,
    "attributes": {
      "size": "M",
      "color": "Đỏ"
    },
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

---

### 7.8. Cập nhật biến thể sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{productId}/variants/{variantId}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `productId` (Long, required)
- `variantId` (Long, required)

**Request Body:** Giống như endpoint 7.7 (tất cả fields đều optional)

**Response:** Giống như endpoint 7.7

---

### 7.9. Cập nhật tồn kho biến thể
- **Method:** `PUT`
- **Path:** `/api/admin/products/{productId}/variants/{variantId}/stock`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `productId` (Long, required)
- `variantId` (Long, required)

**Request Body:**
```json
{
  "stock": 100 // Integer, required
}
```

**Response:** Giống như endpoint 7.7

---

### 7.10. Xóa biến thể sản phẩm
- **Method:** `DELETE`
- **Path:** `/api/admin/products/{productId}/variants/{variantId}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `productId` (Long, required)
- `variantId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

### 7.11. Upload hình ảnh sản phẩm
- **Method:** `POST`
- **Path:** `/api/admin/products/{productId}/images`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Path Parameters:**
- `productId` (Long, required)

**Request (Form Data):**
- `files` (File[], required) - Một hoặc nhiều file ảnh
- `thumbnail` (Boolean, optional) - Đánh dấu ảnh đại diện

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "imageUrl": "https://...",
      "thumbnail": true
    }
  ]
}
```

---

### 7.12. Cập nhật hình ảnh sản phẩm
- **Method:** `PUT`
- **Path:** `/api/admin/products/{productId}/images/{imageId}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `productId` (Long, required)
- `imageId` (Long, required)

**Request Body:**
```json
{
  "thumbnail": true // Boolean, optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "imageUrl": "https://...",
    "thumbnail": true
  }
}
```

---

### 7.13. Xóa hình ảnh sản phẩm
- **Method:** `DELETE`
- **Path:** `/api/admin/products/{productId}/images/{imageId}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `productId` (Long, required)
- `imageId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

## 8. User APIs

**Lưu ý:** Tất cả endpoints trong nhóm này yêu cầu **AUTHENTICATED USER** và header `Authorization: Bearer {token}`

### 8.1. Lấy thông tin người dùng hiện tại
- **Method:** `GET`
- **Path:** `/api/users/me`
- **Quyền:** AUTHENTICATED USER
- **Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Họ và tên",
    "phone": "+84901234567",
    "avatar": "https://...",
    "role": "CUSTOMER", // UserRole: "CUSTOMER" hoặc "ADMIN"
    "provider": "LOCAL", // AuthProvider: "LOCAL", "GOOGLE", "FACEBOOK"
    "active": true,
    "emailVerifiedAt": "2024-01-01T00:00:00",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

---

### 8.2. Cập nhật profile
- **Method:** `PUT`
- **Path:** `/api/users/me`
- **Quyền:** AUTHENTICATED USER
- **Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "fullName": "string (optional, 2-150 chars)",
  "phone": "string (optional, format: +84xxxxxxxxx hoặc 0xxxxxxxxx)"
}
```

**Response:** Giống như endpoint 8.1

---

### 8.3. Đổi mật khẩu
- **Method:** `PUT`
- **Path:** `/api/users/me/password`
- **Quyền:** AUTHENTICATED USER
- **Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, 6-100 chars)",
  "confirmPassword": "string (required) - Phải khớp với newPassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

### 8.4. Cập nhật avatar
- **Method:** `PUT`
- **Path:** `/api/users/me/avatar`
- **Quyền:** AUTHENTICATED USER
- **Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request (Form Data):**
- `file` (File, required) - File ảnh

**Response:** Giống như endpoint 8.1

---

## 9. Admin User APIs

**Lưu ý:** Tất cả endpoints trong nhóm này yêu cầu **ROLE_ADMIN** và header `Authorization: Bearer {token}`

### 9.1. Lấy danh sách người dùng
- **Method:** `GET`
- **Path:** `/api/admin/users`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `keyword` (string, optional) - Tìm kiếm theo tên, email
- `active` (Boolean, optional) - Lọc theo trạng thái active
- `page` (int, default: 0)
- `size` (int, default: 10)
- `sortBy` (string, default: "id")
- `sortDir` (string, default: "asc") - "asc" hoặc "desc"

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "email": "user@example.com",
        "fullName": "Họ và tên",
        "phone": "+84901234567",
        "avatar": "https://...",
        "role": "CUSTOMER",
        "provider": "LOCAL",
        "active": true,
        "emailVerifiedAt": "2024-01-01T00:00:00",
        "createdAt": "2024-01-01T00:00:00",
        "updatedAt": "2024-01-01T00:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 100,
    "totalPages": 10,
    "first": true,
    "last": false
  }
}
```

---

### 9.2. Lấy thông tin người dùng theo ID
- **Method:** `GET`
- **Path:** `/api/admin/users/{userId}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `userId` (Long, required)

**Response:** Giống như endpoint 8.1

---

### 9.3. Tạo người dùng
- **Method:** `POST`
- **Path:** `/api/admin/users`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "email": "string (required, email format, max 150 chars)",
  "password": "string (required, 6-100 chars)",
  "fullName": "string (required, 2-150 chars)",
  "phone": "string (optional, format: +84xxxxxxxxx hoặc 0xxxxxxxxx)",
  "role": "CUSTOMER", // UserRole: "CUSTOMER" hoặc "ADMIN", optional
  "active": true // Boolean, optional, default: true
}
```

**Response:** Giống như endpoint 8.1

---

### 9.4. Cập nhật người dùng
- **Method:** `PUT`
- **Path:** `/api/admin/users/{userId}`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `userId` (Long, required)

**Request Body:**
```json
{
  "fullName": "string (optional, 2-150 chars)",
  "phone": "string (optional, format: +84xxxxxxxxx hoặc 0xxxxxxxxx)",
  "role": "CUSTOMER", // UserRole: "CUSTOMER" hoặc "ADMIN", optional
  "active": true // Boolean, optional
}
```

**Response:** Giống như endpoint 8.1

---

### 9.5. Bật/tắt trạng thái người dùng
- **Method:** `PUT`
- **Path:** `/api/admin/users/{userId}/active`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `userId` (Long, required)

**Request Body:**
```json
{
  "active": true // Boolean, required
}
```

**Response:** Giống như endpoint 8.1

---

### 9.6. Đặt lại mật khẩu người dùng
- **Method:** `POST`
- **Path:** `/api/admin/users/{userId}/reset-password`
- **Quyền:** ADMIN ONLY
- **Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `userId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

## 10. Cart APIs

**Lưu ý:** Các endpoints trong nhóm này hỗ trợ cả **AUTHENTICATED USER** và **GUEST USER** (thông qua header `X-Cart-Token`)

### 10.1. Lấy giỏ hàng hiện tại
- **Method:** `GET`
- **Path:** `/api/cart`
- **Quyền:** AUTHENTICATED USER hoặc GUEST
- **Headers:** 
  - `Authorization: Bearer {token}` (optional - nếu đã đăng nhập)
  - `X-Cart-Token: {cartToken}` (optional - nếu là guest)

**Response:**
```json
{
  "success": true,
  "data": {
    "cartToken": "abc123def456",
    "userCart": false, // true nếu là user đã đăng nhập
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productVariantId": 1,
        "productName": "Tên sản phẩm",
        "sku": "SKU001",
        "quantity": 2,
        "price": 100000.00,
        "lineTotal": 200000.00
      }
    ],
    "totalItems": 2,
    "subtotal": 200000.00
  }
}
```

---

### 10.2. Thêm sản phẩm vào giỏ hàng
- **Method:** `POST`
- **Path:** `/api/cart/items`
- **Quyền:** AUTHENTICATED USER hoặc GUEST
- **Headers:** 
  - `Authorization: Bearer {token}` (optional)
  - `X-Cart-Token: {cartToken}` (optional)

**Request Body:**
```json
{
  "productVariantId": 1, // Long, required
  "quantity": 2 // Integer, required, min: 1
}
```

**Response:** Giống như endpoint 10.1

---

### 10.3. Cập nhật số lượng sản phẩm
- **Method:** `PATCH`
- **Path:** `/api/cart/items/{itemId}`
- **Quyền:** AUTHENTICATED USER hoặc GUEST
- **Headers:** 
  - `Authorization: Bearer {token}` (optional)
  - `X-Cart-Token: {cartToken}` (optional)

**Path Parameters:**
- `itemId` (Long, required)

**Request Body:**
```json
{
  "quantity": 3 // int, required, min: 1
}
```

**Response:** Giống như endpoint 10.1

---

### 10.4. Xóa sản phẩm khỏi giỏ hàng
- **Method:** `DELETE`
- **Path:** `/api/cart/items/{itemId}`
- **Quyền:** AUTHENTICATED USER hoặc GUEST
- **Headers:** 
  - `Authorization: Bearer {token}` (optional)
  - `X-Cart-Token: {cartToken}` (optional)

**Path Parameters:**
- `itemId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

### 10.5. Xóa toàn bộ giỏ hàng
- **Method:** `DELETE`
- **Path:** `/api/cart`
- **Quyền:** AUTHENTICATED USER hoặc GUEST
- **Headers:** 
  - `Authorization: Bearer {token}` (optional)
  - `X-Cart-Token: {cartToken}` (optional)

**Response:**
```json
{
  "success": true,
  "data": null
}
```

---

### 10.6. Gộp giỏ hàng guest
- **Method:** `POST`
- **Path:** `/api/cart/merge`
- **Quyền:** AUTHENTICATED USER (yêu cầu đăng nhập)
- **Headers:** 
  - `Authorization: Bearer {token}` (required)
  - `X-Cart-Token: {cartToken}` (optional) - Token giỏ hàng guest cần gộp

**Response:** Giống như endpoint 10.1

---

## 11. Order APIs

**Lưu ý:** Các endpoints trong nhóm này hỗ trợ cả **AUTHENTICATED USER** và **GUEST USER** (thông qua header `X-Cart-Token`)

### 11.1. Xem trước thanh toán
- **Method:** `GET`
- **Path:** `/api/checkout/preview`
- **Quyền:** AUTHENTICATED USER hoặc GUEST
- **Headers:** 
  - `Authorization: Bearer {token}` (optional)
  - `X-Cart-Token: {cartToken}` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 1,
        "productVariantId": 1,
        "productName": "Tên sản phẩm",
        "sku": "SKU001",
        "attributes": {
          "size": "M",
          "color": "Đỏ"
        },
        "quantity": 2,
        "unitPrice": 100000.00,
        "lineTotal": 200000.00
      }
    ],
    "subtotal": 200000.00,
    "shippingFee": 30000.00,
    "discount": 0.00,
    "total": 230000.00
  }
}
```

---

### 11.2. Xác nhận thanh toán
- **Method:** `POST`
- **Path:** `/api/checkout/confirm`
- **Quyền:** AUTHENTICATED USER hoặc GUEST
- **Headers:** 
  - `Authorization: Bearer {token}` (optional)
  - `X-Cart-Token: {cartToken}` (optional)

**Request Body:**
```json
{
  "buyerEmail": "buyer@example.com", // String, optional, email format
  "receiverName": "string (required)",
  "receiverPhone": "string (required)",
  "shippingAddress": "string (required)",
  "shippingWard": "string (optional)",
  "shippingDistrict": "string (optional)",
  "shippingCity": "string (required)",
  "paymentMethod": "COD", // PaymentMethod: "COD", "BANKING", "VNPAY", "MOMO", required
  "note": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "status": "PENDING", // OrderStatus: "PENDING", "PAID", "SHIPPING", "COMPLETED", "CANCELLED"
    "paymentStatus": "PENDING", // PaymentStatus: "PENDING", "SUCCESS", "FAILED", "CANCELLED", "EXPIRED"
    "paymentMethod": "VNPAY",
    "totalAmount": 230000.00,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..." // Có giá trị nếu paymentMethod là VNPAY hoặc MOMO
  }
}
```

---

### 11.3. Lấy danh sách đơn hàng
- **Method:** `GET`
- **Path:** `/api/orders`
- **Quyền:** AUTHENTICATED USER (yêu cầu đăng nhập)
- **Headers:** `Authorization: Bearer {token}` (required)

**Query Parameters:**
- `page` (int, default: 0)
- `size` (int, default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "status": "PENDING",
        "paymentStatus": "PENDING",
        "paymentMethod": "COD",
        "totalAmount": 230000.00,
        "createdAt": "2024-01-01T00:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 10,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

---

### 11.4. Lấy chi tiết đơn hàng
- **Method:** `GET`
- **Path:** `/api/orders/{orderId}`
- **Quyền:** AUTHENTICATED USER (yêu cầu đăng nhập, chỉ xem được đơn hàng của chính mình)
- **Headers:** `Authorization: Bearer {token}` (required)

**Path Parameters:**
- `orderId` (Long, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "buyerEmail": "buyer@example.com",
    "receiverName": "Người nhận",
    "receiverPhone": "+84901234567",
    "shippingAddress": "Địa chỉ",
    "shippingWard": "Phường",
    "shippingDistrict": "Quận",
    "shippingCity": "Thành phố",
    "subtotal": 200000.00,
    "shippingFee": 30000.00,
    "voucherDiscount": 0.00,
    "totalAmount": 230000.00,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "COD",
    "paymentTxnRef": "TXN123456",
    "paymentTransactionNo": "TRANS123456",
    "paymentPaidAt": "2024-01-01T00:00:00",
    "note": "Ghi chú",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productVariantId": 1,
        "productName": "Tên sản phẩm",
        "sku": "SKU001",
        "attributes": {
          "size": "M",
          "color": "Đỏ"
        },
        "quantity": 2,
        "unitPrice": 100000.00,
        "lineTotal": 200000.00
      }
    ]
  }
}
```

---

### 11.5. Kiểm tra trạng thái thanh toán
- **Method:** `GET`
- **Path:** `/api/payments/status`
- **Quyền:** AUTHENTICATED USER hoặc GUEST (có thể kiểm tra qua email)
- **Headers:** 
  - `Authorization: Bearer {token}` (optional)
  - `X-Cart-Token: {cartToken}` (optional)

**Query Parameters:**
- `txnRef` (string, required) - Mã giao dịch
- `buyerEmail` (string, optional) - Email người mua (cho guest)

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 1,
    "buyerEmail": "buyer@example.com",
    "orderStatus": "PAID",
    "paymentStatus": "SUCCESS",
    "paymentMethod": "VNPAY",
    "totalAmount": 230000.00,
    "paymentTxnRef": "TXN123456",
    "paymentPaidAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

---

### 11.6. Callback VNPay
- **Method:** `GET`
- **Path:** `/api/payments/vnpay/callback`
- **Quyền:** PUBLIC (callback từ VNPay)
- **Mô tả:** Endpoint callback từ VNPay sau khi thanh toán, trả về HTML redirect

**Query Parameters:** (Từ VNPay)
- `vnp_Amount`, `vnp_BankCode`, `vnp_ResponseCode`, v.v.

**Response:** HTML redirect page

---

## 12. Upload APIs

### 12.1. Upload hình ảnh
- **Method:** `POST`
- **Path:** `/api/uploads/image`
- **Quyền:** PUBLIC (không có annotation bảo mật, nên được bảo vệ trong production)
- **Headers:** `Content-Type: multipart/form-data`

**Request (Form Data):**
- `file` (File, required) - File ảnh
- `folder` (string, optional) - Thư mục trên Cloudinary

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "folder": "uploads",
    "originalFilename": "image.jpg"
  }
}
```

---

## 13. Email APIs

### 13.1. Gửi email test
- **Method:** `POST`
- **Path:** `/api/email/test`
- **Quyền:** PUBLIC (không có annotation bảo mật, nên được bảo vệ trong production)

**Request Body:**
```json
{
  "to": "string (required, email format)",
  "subject": "string (optional)",
  "body": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": "Email đã được gửi thành công đến: user@example.com"
}
```

---

### 13.2. Gửi email test (async)
- **Method:** `POST`
- **Path:** `/api/email/test-async`
- **Quyền:** PUBLIC

**Request Body:** Giống như endpoint 13.1

**Response:**
```json
{
  "success": true,
  "data": "Email đang được gửi async đến: user@example.com"
}
```

---

## Tóm Tắt Enum Values

### UserRole
- `CUSTOMER`
- `ADMIN`

### AuthProvider
- `LOCAL`
- `GOOGLE`
- `FACEBOOK`

### ProductStatus
- `ACTIVE`
- `INACTIVE`

### PaymentMethod
- `COD` - Thanh toán khi nhận hàng
- `BANKING` - Chuyển khoản ngân hàng
- `VNPAY` - Thanh toán qua VNPay
- `MOMO` - Thanh toán qua MoMo

### PaymentStatus
- `PENDING` - Đang chờ
- `SUCCESS` - Thành công
- `FAILED` - Thất bại
- `CANCELLED` - Đã hủy
- `EXPIRED` - Đã hết hạn

### OrderStatus
- `PENDING` - Đang chờ
- `PAID` - Đã thanh toán
- `SHIPPING` - Đang giao hàng
- `COMPLETED` - Hoàn thành
- `CANCELLED` - Đã hủy

---

## Lưu Ý Quan Trọng

1. **JWT Token:** Access token thường có thời hạn ngắn (ví dụ: 1 giờ). Khi token hết hạn, cần gọi `/api/auth/refresh` để lấy token mới.

2. **Cart Token:** Guest users sẽ nhận được `cartToken` trong response khi thêm sản phẩm vào giỏ hàng. Token này cần được lưu (localStorage/cookie) và gửi kèm trong header `X-Cart-Token` cho các request tiếp theo.

3. **Merge Cart:** Khi guest user đăng nhập/đăng ký, nên gọi `/api/cart/merge` với `X-Cart-Token` của guest để gộp giỏ hàng vào tài khoản.

4. **Error Handling:** Khi `success: false`, kiểm tra `errorCode` và `message` để xử lý lỗi phù hợp.

5. **Pagination:** Các endpoint có phân trang sử dụng `page` (0-based) và `size`. Response sẽ có `totalElements`, `totalPages`, `first`, `last`.

6. **File Upload:** Khi upload file, cần set `Content-Type: multipart/form-data` và không set header `Content-Type` trong request (browser sẽ tự động set).

---

**Phiên bản:** 2.0
**Cập nhật:** Bao gồm đầy đủ thông tin headers, request body, và response body

