# Tài Liệu API Giỏ Hàng (Cart) - Kết Nối Frontend

## Tổng Quan

Tài liệu này mô tả chi tiết các endpoint liên quan đến giỏ hàng (cart) của người dùng, bao gồm:
- Quản lý sản phẩm trong giỏ hàng (thêm, sửa, xóa)
- Áp dụng và xóa voucher
- Merge giỏ hàng guest với user cart
- Preview checkout với voucher

**Base URL**: `/api/cart`

**Lưu ý quan trọng**:
- Hệ thống hỗ trợ cả **guest cart** (chưa đăng nhập) và **user cart** (đã đăng nhập)
- Guest cart sử dụng `X-Cart-Token` header để định danh
- User cart tự động lấy từ authentication token
- Khi user đăng nhập, hệ thống tự động merge guest cart vào user cart nếu có

---

## 1. Cấu Trúc Dữ Liệu

### 1.1. CartResponse

Response chính cho các API giỏ hàng:

```typescript
interface CartResponse {
  cartToken: string | null;        // Token cho guest cart (null nếu là user cart)
  userCart: boolean;                // true nếu là user cart, false nếu là guest cart
  items: CartItemResponse[];         // Danh sách sản phẩm trong giỏ hàng
  totalItems: number;                // Tổng số lượng sản phẩm (tổng quantity)
  subtotal: number;                 // Tổng tiền trước giảm giá (BigDecimal)
}
```

### 1.2. CartItemResponse

Thông tin chi tiết một sản phẩm trong giỏ hàng:

```typescript
interface CartItemResponse {
  id: number;                        // ID của cart item
  productId: number;                 // ID sản phẩm
  productVariantId: number;          // ID biến thể sản phẩm
  productName: string;               // Tên sản phẩm
  sku: string;                       // SKU của biến thể
  quantity: number;                  // Số lượng
  price: number;                     // Giá tại thời điểm thêm vào giỏ (BigDecimal)
  lineTotal: number;                 // Tổng tiền = price * quantity (BigDecimal)
}
```

**Lưu ý**: `price` là giá tại thời điểm thêm vào giỏ hàng (`priceAtAdd`), không phải giá hiện tại. Điều này đảm bảo giá không thay đổi sau khi đã thêm vào giỏ.

---

## 2. API Endpoints

### 2.1. Lấy Giỏ Hàng Hiện Tại

**Endpoint**: `GET /api/cart`

**Mô tả**: Lấy thông tin giỏ hàng hiện tại của user hoặc guest.

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Logic xử lý**:
- Nếu có `Authorization` header → lấy user cart
- Nếu chỉ có `X-Cart-Token` → lấy guest cart
- Nếu có cả hai → tự động merge guest cart vào user cart (nếu khác nhau)
- Nếu không có gì → trả về giỏ hàng rỗng

**Ví dụ Request (Guest)**:
```http
GET /api/cart
X-Cart-Token: abc123def456...
```

**Ví dụ Request (User)**:
```http
GET /api/cart
Authorization: Bearer {user_token}
```

**Ví dụ Request (Cả hai - tự động merge)**:
```http
GET /api/cart
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "cartToken": "abc123def456...",
    "userCart": false,
    "items": [
      {
        "id": 1,
        "productId": 10,
        "productVariantId": 25,
        "productName": "Áo thun nam",
        "sku": "ATN-RED-M",
        "quantity": 2,
        "price": 150000.00,
        "lineTotal": 300000.00
      },
      {
        "id": 2,
        "productId": 11,
        "productVariantId": 26,
        "productName": "Quần jean nữ",
        "sku": "QJN-BLUE-L",
        "quantity": 1,
        "price": 500000.00,
        "lineTotal": 500000.00
      }
    ],
    "totalItems": 3,
    "subtotal": 800000.00
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Response khi giỏ hàng rỗng**:
```json
{
  "success": true,
  "data": {
    "cartToken": null,
    "userCart": true,
    "items": [],
    "totalItems": 0,
    "subtotal": 0.00
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

---

### 2.2. Thêm Sản Phẩm Vào Giỏ Hàng

**Endpoint**: `POST /api/cart/items`

**Mô tả**: Thêm sản phẩm vào giỏ hàng. Nếu sản phẩm đã tồn tại, sẽ cộng dồn số lượng.

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Request Body**:
```json
{
  "productVariantId": 25,
  "quantity": 2
}
```

**Request Fields**:
| Field | Kiểu | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `productVariantId` | Long | ✅ | Phải tồn tại | ID biến thể sản phẩm |
| `quantity` | Integer | ✅ | >= 1 | Số lượng muốn thêm |

**Logic xử lý**:
1. Tìm hoặc tạo giỏ hàng (tự động merge nếu có cả token và user)
2. Kiểm tra sản phẩm có tồn tại và còn hàng không
3. Kiểm tra stock (nếu có giới hạn)
4. Nếu sản phẩm đã có trong giỏ → cộng dồn quantity
5. Nếu chưa có → thêm mới với `priceAtAdd` = giá hiện tại
6. Lưu giá tại thời điểm thêm (`priceAtAdd`) để đảm bảo giá không đổi

**Ví dụ Request**:
```http
POST /api/cart/items
Content-Type: application/json
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}

{
  "productVariantId": 25,
  "quantity": 2
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "cartToken": null,
    "userCart": true,
    "items": [
      {
        "id": 1,
        "productId": 10,
        "productVariantId": 25,
        "productName": "Áo thun nam",
        "sku": "ATN-RED-M",
        "quantity": 3,
        "price": 150000.00,
        "lineTotal": 450000.00
      }
    ],
    "totalItems": 3,
    "subtotal": 450000.00
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `400 Bad Request`: 
  - Sản phẩm hết hàng (quantity > stock)
  - Validation errors
- `404 Not Found`: 
  - Product variant không tồn tại

---

### 2.3. Cập Nhật Số Lượng Sản Phẩm

**Endpoint**: `PATCH /api/cart/items/{itemId}`

**Mô tả**: Cập nhật số lượng của một sản phẩm trong giỏ hàng.

**Path Parameters**:
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `itemId` | Long | ID của cart item |

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Request Body**:
```json
{
  "quantity": 5
}
```

**Request Fields**:
| Field | Kiểu | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `quantity` | Integer | ✅ | >= 1 | Số lượng mới |

**Ví dụ Request**:
```http
PATCH /api/cart/items/1
Content-Type: application/json
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}

{
  "quantity": 5
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "cartToken": null,
    "userCart": true,
    "items": [
      {
        "id": 1,
        "productId": 10,
        "productVariantId": 25,
        "productName": "Áo thun nam",
        "sku": "ATN-RED-M",
        "quantity": 5,
        "price": 150000.00,
        "lineTotal": 750000.00
      }
    ],
    "totalItems": 5,
    "subtotal": 750000.00
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `400 Bad Request`: 
  - Quantity < 1
  - Sản phẩm hết hàng (quantity > stock)
- `404 Not Found`: 
  - Cart item không tồn tại
  - Cart không tồn tại

---

### 2.4. Xóa Sản Phẩm Khỏi Giỏ Hàng

**Endpoint**: `DELETE /api/cart/items/{itemId}`

**Mô tả**: Xóa một sản phẩm khỏi giỏ hàng.

**Path Parameters**:
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `itemId` | Long | ID của cart item |

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Ví dụ Request**:
```http
DELETE /api/cart/items/1
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": null,
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `404 Not Found`: 
  - Cart item không tồn tại
  - Cart không tồn tại

**Lưu ý**: Sau khi xóa, cần gọi lại `GET /api/cart` để lấy giỏ hàng cập nhật.

---

### 2.5. Xóa Toàn Bộ Giỏ Hàng

**Endpoint**: `DELETE /api/cart`

**Mô tả**: Xóa tất cả sản phẩm khỏi giỏ hàng (giữ nguyên cart, chỉ xóa items).

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Ví dụ Request**:
```http
DELETE /api/cart
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": null,
  "timestamp": "2024-06-20T10:30:00"
}
```

**Lưu ý**: 
- Voucher code vẫn được giữ lại (nếu có)
- Sau khi xóa, cần gọi lại `GET /api/cart` để lấy giỏ hàng rỗng

---

### 2.6. Merge Guest Cart Vào User Cart

**Endpoint**: `POST /api/cart/merge`

**Mô tả**: Merge giỏ hàng guest vào giỏ hàng user khi user đăng nhập. Endpoint này được gọi tự động khi có cả `X-Cart-Token` và `Authorization`, nhưng có thể gọi thủ công để đảm bảo merge.

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng guest |
| `Authorization` | String | ✅ | Bearer token (bắt buộc) |

**Logic xử lý**:
1. Lấy guest cart từ `X-Cart-Token`
2. Lấy user cart từ `Authorization`
3. Merge items:
   - Nếu cùng product variant → cộng dồn quantity
   - Nếu vượt stock → tự động giới hạn ở stock có sẵn (không throw error)
   - Nếu user chưa có cart → chuyển guest cart thành user cart
4. Xóa guest cart sau khi merge
5. Giữ voucher code từ guest cart nếu user cart chưa có

**Ví dụ Request**:
```http
POST /api/cart/merge
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "cartToken": null,
    "userCart": true,
    "items": [
      {
        "id": 1,
        "productId": 10,
        "productVariantId": 25,
        "productName": "Áo thun nam",
        "sku": "ATN-RED-M",
        "quantity": 3,
        "price": 150000.00,
        "lineTotal": 450000.00
      }
    ],
    "totalItems": 3,
    "subtotal": 450000.00
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `401 Unauthorized`: Không có authentication token

**Lưu ý**: 
- Merge tự động xử lý stock overflow (giới hạn ở stock có sẵn)
- Sau khi merge, guest cart token không còn hợp lệ

---

## 3. Voucher APIs

### 3.1. Áp Dụng Voucher Vào Giỏ Hàng

**Endpoint**: `PUT /api/cart/voucher`

**Mô tả**: Áp dụng một voucher vào giỏ hàng. Voucher sẽ được validate trước khi áp dụng.

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Request Body**:
```json
{
  "voucherCode": "SUMMER2024"
}
```

**Request Fields**:
| Field | Kiểu | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `voucherCode` | String | ✅ | 3-50 ký tự, chỉ chữ số, chữ cái, dấu gạch ngang và gạch dưới | Mã voucher |

**Logic xử lý**:
1. Tìm hoặc tạo giỏ hàng
2. Tính subtotal hiện tại của giỏ hàng
3. Validate voucher:
   - Voucher phải tồn tại và active
   - Voucher phải trong thời gian hiệu lực
   - Voucher phải còn số lượng
   - Subtotal phải >= minOrder (nếu có)
   - User chưa vượt quá usageLimitPerUser (nếu có)
4. Lưu voucher code vào cart (uppercase)
5. Voucher code được normalize (trim + uppercase)

**Ví dụ Request**:
```http
PUT /api/cart/voucher
Content-Type: application/json
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}

{
  "voucherCode": "SUMMER2024"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Voucher applied successfully",
  "data": null,
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `400 Bad Request`: 
  - Voucher không hợp lệ
  - Voucher đã hết hạn
  - Voucher đã hết số lượng
  - Đơn hàng không đạt giá trị tối thiểu (`minOrder`)
  - User đã đạt giới hạn sử dụng (`usageLimitPerUser`)
- `404 Not Found`: Voucher không tồn tại

**Lưu ý quan trọng**:
- Sau khi áp dụng voucher thành công, **cần gọi lại `GET /api/cart`** để lấy giỏ hàng cập nhật
- Voucher code được lưu trong cart, nhưng **discount amount không được tính trong `CartResponse`**
- Để xem discount amount, cần gọi `GET /api/checkout/preview` (xem phần 4)

---

### 3.2. Xóa Voucher Khỏi Giỏ Hàng

**Endpoint**: `DELETE /api/cart/voucher`

**Mô tả**: Xóa voucher đã áp dụng khỏi giỏ hàng.

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Ví dụ Request**:
```http
DELETE /api/cart/voucher
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Voucher removed successfully",
  "data": null,
  "timestamp": "2024-06-20T10:30:00"
}
```

**Lưu ý**: 
- Sau khi xóa voucher, cần gọi lại `GET /api/cart` hoặc `GET /api/checkout/preview` để cập nhật tổng tiền

---

## 4. Checkout Preview (Xem Trước Thanh Toán)

**Endpoint**: `GET /api/checkout/preview`

**Mô tả**: Xem trước thông tin thanh toán, bao gồm tính toán discount từ voucher. Endpoint này validate cart và tính toán chính xác tổng tiền cuối cùng.

**Headers**:
| Header | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| `X-Cart-Token` | String | Không | Token giỏ hàng (cho guest cart) |
| `Authorization` | String | Không | Bearer token (cho user đã đăng nhập) |

**Ví dụ Request**:
```http
GET /api/checkout/preview
X-Cart-Token: abc123def456...
Authorization: Bearer {user_token}
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": 10,
        "productVariantId": 25,
        "productName": "Áo thun nam",
        "sku": "ATN-RED-M",
        "attributes": {
          "color": "Red",
          "size": "M"
        },
        "quantity": 2,
        "unitPrice": 150000.00,
        "lineTotal": 300000.00,
        "priceAtAdd": 150000.00,
        "priceChanged": false
      }
    ],
    "subtotal": 800000.00,
    "shippingFee": 0.00,
    "discount": 50000.00,
    "total": 750000.00,
    "priceChangeWarning": null,
    "appliedVoucher": {
      "code": "SUMMER2024",
      "discountType": "PERCENT",
      "discountValue": 20.00,
      "maxDiscount": 50000.00
    }
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Response Fields**:
- `items`: Danh sách sản phẩm với giá hiện tại
  - `priceAtAdd`: Giá tại thời điểm thêm vào giỏ
  - `priceChanged`: true nếu giá hiện tại khác `priceAtAdd`
- `subtotal`: Tổng tiền sản phẩm (tính theo giá hiện tại)
- `shippingFee`: Phí vận chuyển (hiện tại = 0)
- `discount`: Số tiền giảm giá từ voucher
- `total`: Tổng tiền cuối cùng = subtotal + shippingFee - discount
- `priceChangeWarning`: Cảnh báo nếu có giá thay đổi (null nếu không có)
- `appliedVoucher`: Thông tin voucher đã áp dụng (null nếu không có)

**Logic tính discount**:
1. Lấy voucher code từ cart
2. Validate voucher với subtotal hiện tại
3. Tính discount:
   - **PERCENT**: `discount = min(subtotal * discountValue / 100, maxDiscount)`
   - **AMOUNT**: `discount = discountValue`
4. Đảm bảo discount không vượt quá subtotal

**Error Responses**:
- `400 Bad Request`: 
  - Sản phẩm hết hàng
  - Sản phẩm không active
  - Voucher không hợp lệ (nếu có)
- `404 Not Found`: 
  - Product variant không tồn tại

**Lưu ý**: 
- Endpoint này sử dụng **giá hiện tại** của sản phẩm, không phải `priceAtAdd`
- Nếu giá thay đổi, `priceChangeWarning` sẽ có giá trị
- Đây là endpoint chính để hiển thị tổng tiền cuối cùng cho user

---

## 5. Flow Xử Lý Voucher

### 5.1. Flow Áp Dụng Voucher

```
1. User nhập voucher code
   ↓
2. FE gọi PUT /api/cart/voucher
   ↓
3. Backend validate voucher:
   - Tồn tại và active?
   - Trong thời gian hiệu lực?
   - Còn số lượng?
   - Subtotal >= minOrder?
   - User chưa vượt usageLimitPerUser?
   ↓
4. Lưu voucher code vào cart
   ↓
5. FE gọi GET /api/checkout/preview để xem discount
   ↓
6. Hiển thị tổng tiền cuối cùng cho user
```

### 5.2. Flow Checkout Với Voucher

```
1. User xem giỏ hàng
   ↓
2. FE gọi GET /api/cart (chỉ có subtotal, chưa có discount)
   ↓
3. User áp dụng voucher
   ↓
4. FE gọi PUT /api/cart/voucher
   ↓
5. FE gọi GET /api/checkout/preview để xem tổng tiền với discount
   ↓
6. User xác nhận đặt hàng
   ↓
7. FE gọi POST /api/checkout/confirm
   ↓
8. Backend:
   - Validate voucher lại một lần nữa
   - Tính discount chính xác
   - Tạo order với discount
   - Ghi nhận voucher usage
   - Clear cart
```

---

## 6. Cách Tính Discount

### 6.1. Voucher PERCENT (Phần trăm)

**Công thức**:
```
discount = min(
  subtotal × (discountValue / 100),
  maxDiscount (nếu có)
)
```

**Ví dụ**:
- `subtotal = 300,000 VND`
- `discountValue = 20%`
- `maxDiscount = 50,000 VND`
- `discount = min(300,000 × 0.2, 50,000) = 50,000 VND`

### 6.2. Voucher AMOUNT (Số tiền cố định)

**Công thức**:
```
discount = discountValue
```

**Ví dụ**:
- `discountValue = 50,000 VND`
- `discount = 50,000 VND`

### 6.3. Giới Hạn

- Discount không bao giờ vượt quá `subtotal`
- Nếu `discount > subtotal` → `discount = subtotal`

---

## 7. Ví Dụ Code Frontend

### 7.1. React/TypeScript Example

```typescript
// types/cart.ts
interface CartResponse {
  cartToken: string | null;
  userCart: boolean;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
}

interface CartItemResponse {
  id: number;
  productId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface CheckoutPreviewResponse {
  items: CheckoutItemResponse[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  priceChangeWarning: string | null;
  appliedVoucher: VoucherInfo | null;
}

interface VoucherInfo {
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  maxDiscount: number | null;
}

// services/cartService.ts
class CartService {
  private baseUrl = '/api/cart';
  
  private getHeaders(cartToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (cartToken) {
      headers['X-Cart-Token'] = cartToken;
    }
    
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  async getCart(cartToken?: string): Promise<ApiResponse<CartResponse>> {
    const response = await fetch(this.baseUrl, {
      headers: this.getHeaders(cartToken),
    });
    return response.json();
  }
  
  async addItem(
    productVariantId: number,
    quantity: number,
    cartToken?: string
  ): Promise<ApiResponse<CartResponse>> {
    const response = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: this.getHeaders(cartToken),
      body: JSON.stringify({ productVariantId, quantity }),
    });
    return response.json();
  }
  
  async updateItemQuantity(
    itemId: number,
    quantity: number,
    cartToken?: string
  ): Promise<ApiResponse<CartResponse>> {
    const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
      method: 'PATCH',
      headers: this.getHeaders(cartToken),
      body: JSON.stringify({ quantity }),
    });
    return response.json();
  }
  
  async removeItem(itemId: number, cartToken?: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/items/${itemId}`, {
      method: 'DELETE',
      headers: this.getHeaders(cartToken),
    });
    return response.json();
  }
  
  async clearCart(cartToken?: string): Promise<ApiResponse<void>> {
    const response = await fetch(this.baseUrl, {
      method: 'DELETE',
      headers: this.getHeaders(cartToken),
    });
    return response.json();
  }
  
  async mergeCart(cartToken: string): Promise<ApiResponse<CartResponse>> {
    const response = await fetch(`${this.baseUrl}/merge`, {
      method: 'POST',
      headers: this.getHeaders(cartToken),
    });
    return response.json();
  }
  
  async applyVoucher(voucherCode: string, cartToken?: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/voucher`, {
      method: 'PUT',
      headers: this.getHeaders(cartToken),
      body: JSON.stringify({ voucherCode }),
    });
    return response.json();
  }
  
  async removeVoucher(cartToken?: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/voucher`, {
      method: 'DELETE',
      headers: this.getHeaders(cartToken),
    });
    return response.json();
  }
  
  async getCheckoutPreview(cartToken?: string): Promise<ApiResponse<CheckoutPreviewResponse>> {
    const response = await fetch('/api/checkout/preview', {
      headers: this.getHeaders(cartToken),
    });
    return response.json();
  }
}

// hooks/useCart.ts
import { useState, useEffect } from 'react';
import { CartService } from '../services/cartService';

export function useCart() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [checkoutPreview, setCheckoutPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cartService = new CartService();
  const cartToken = localStorage.getItem('cartToken');
  
  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart(cartToken || undefined);
      if (response.success) {
        setCart(response.data);
        // Lưu cartToken nếu là guest cart
        if (response.data.cartToken && !cartToken) {
          localStorage.setItem('cartToken', response.data.cartToken);
        }
      }
    } catch (err) {
      setError('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCheckoutPreview = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCheckoutPreview(cartToken || undefined);
      if (response.success) {
        setCheckoutPreview(response.data);
      }
    } catch (err) {
      setError('Không thể tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };
  
  const addItem = async (productVariantId: number, quantity: number) => {
    setLoading(true);
    try {
      const response = await cartService.addItem(productVariantId, quantity, cartToken || undefined);
      if (response.success) {
        setCart(response.data);
        // Cập nhật cartToken nếu có
        if (response.data.cartToken) {
          localStorage.setItem('cartToken', response.data.cartToken);
        }
      }
    } catch (err) {
      setError('Không thể thêm sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const applyVoucher = async (voucherCode: string) => {
    setLoading(true);
    try {
      const response = await cartService.applyVoucher(voucherCode, cartToken || undefined);
      if (response.success) {
        // Sau khi áp dụng voucher, load lại checkout preview
        await loadCheckoutPreview();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Không thể áp dụng voucher';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const removeVoucher = async () => {
    setLoading(true);
    try {
      const response = await cartService.removeVoucher(cartToken || undefined);
      if (response.success) {
        await loadCheckoutPreview();
      }
    } catch (err) {
      setError('Không thể xóa voucher');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadCart();
  }, []);
  
  return {
    cart,
    checkoutPreview,
    loading,
    error,
    loadCart,
    loadCheckoutPreview,
    addItem,
    applyVoucher,
    removeVoucher,
  };
}

// components/CartPage.tsx
import { useCart } from '../hooks/useCart';
import { useState } from 'react';

export function CartPage() {
  const { cart, checkoutPreview, loading, applyVoucher, removeVoucher, loadCheckoutPreview } = useCart();
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  
  const handleApplyVoucher = async () => {
    setVoucherError(null);
    try {
      await applyVoucher(voucherCode);
      setVoucherCode('');
    } catch (err: any) {
      setVoucherError(err.response?.data?.message || 'Voucher không hợp lệ');
    }
  };
  
  const handleRemoveVoucher = async () => {
    try {
      await removeVoucher();
    } catch (err) {
      console.error('Error removing voucher:', err);
    }
  };
  
  // Load checkout preview khi có voucher
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      loadCheckoutPreview();
    }
  }, [cart]);
  
  if (loading) return <div>Đang tải...</div>;
  
  return (
    <div>
      <h1>Giỏ Hàng</h1>
      
      {/* Danh sách sản phẩm */}
      {cart?.items.map(item => (
        <div key={item.id}>
          <h3>{item.productName}</h3>
          <p>SKU: {item.sku}</p>
          <p>Số lượng: {item.quantity}</p>
          <p>Giá: {item.price.toLocaleString('vi-VN')} VND</p>
          <p>Tổng: {item.lineTotal.toLocaleString('vi-VN')} VND</p>
        </div>
      ))}
      
      {/* Tổng tiền từ cart (chưa có discount) */}
      <div>
        <p>Tổng tiền: {cart?.subtotal.toLocaleString('vi-VN')} VND</p>
      </div>
      
      {/* Voucher section */}
      <div>
        <h2>Mã Giảm Giá</h2>
        {checkoutPreview?.appliedVoucher ? (
          <div>
            <p>Voucher đã áp dụng: {checkoutPreview.appliedVoucher.code}</p>
            <button onClick={handleRemoveVoucher}>Xóa voucher</button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã voucher"
            />
            <button onClick={handleApplyVoucher}>Áp dụng</button>
            {voucherError && <p style={{ color: 'red' }}>{voucherError}</p>}
          </div>
        )}
      </div>
      
      {/* Tổng tiền cuối cùng từ checkout preview */}
      {checkoutPreview && (
        <div>
          <h2>Tổng Thanh Toán</h2>
          <p>Tạm tính: {checkoutPreview.subtotal.toLocaleString('vi-VN')} VND</p>
          {checkoutPreview.discount > 0 && (
            <p>Giảm giá: -{checkoutPreview.discount.toLocaleString('vi-VN')} VND</p>
          )}
          <p>Phí vận chuyển: {checkoutPreview.shippingFee.toLocaleString('vi-VN')} VND</p>
          <p><strong>Tổng cộng: {checkoutPreview.total.toLocaleString('vi-VN')} VND</strong></p>
          {checkoutPreview.priceChangeWarning && (
            <p style={{ color: 'orange' }}>{checkoutPreview.priceChangeWarning}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### 7.2. Vue.js Example

```javascript
// composables/useCart.js
import { ref, computed } from 'vue';
import axios from 'axios';

export function useCart() {
  const cart = ref(null);
  const checkoutPreview = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  const getCartToken = () => {
    return localStorage.getItem('cartToken');
  };
  
  const getHeaders = () => {
    const headers = {};
    const token = localStorage.getItem('authToken');
    const cartToken = getCartToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (cartToken) {
      headers['X-Cart-Token'] = cartToken;
    }
    
    return headers;
  };
  
  const loadCart = async () => {
    loading.value = true;
    try {
      const response = await axios.get('/api/cart', { headers: getHeaders() });
      if (response.data.success) {
        cart.value = response.data.data;
        // Lưu cartToken nếu là guest cart
        if (response.data.data.cartToken && !getCartToken()) {
          localStorage.setItem('cartToken', response.data.data.cartToken);
        }
      }
    } catch (err) {
      error.value = 'Không thể tải giỏ hàng';
    } finally {
      loading.value = false;
    }
  };
  
  const loadCheckoutPreview = async () => {
    loading.value = true;
    try {
      const response = await axios.get('/api/checkout/preview', { headers: getHeaders() });
      if (response.data.success) {
        checkoutPreview.value = response.data.data;
      }
    } catch (err) {
      error.value = 'Không thể tải thông tin thanh toán';
    } finally {
      loading.value = false;
    }
  };
  
  const applyVoucher = async (voucherCode) => {
    loading.value = true;
    try {
      const response = await axios.put(
        '/api/cart/voucher',
        { voucherCode },
        { headers: getHeaders() }
      );
      if (response.data.success) {
        await loadCheckoutPreview();
        return true;
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể áp dụng voucher';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const removeVoucher = async () => {
    loading.value = true;
    try {
      const response = await axios.delete('/api/cart/voucher', { headers: getHeaders() });
      if (response.data.success) {
        await loadCheckoutPreview();
      }
    } catch (err) {
      error.value = 'Không thể xóa voucher';
    } finally {
      loading.value = false;
    }
  };
  
  return {
    cart,
    checkoutPreview,
    loading,
    error,
    loadCart,
    loadCheckoutPreview,
    applyVoucher,
    removeVoucher,
  };
}
```

---

## 8. Best Practices & Lưu Ý

### 8.1. Quản Lý Cart Token

- **Guest cart**: Lưu `cartToken` vào `localStorage` hoặc `sessionStorage`
- **User cart**: Không cần `cartToken`, sử dụng `Authorization` header
- **Merge tự động**: Khi có cả `cartToken` và `Authorization`, hệ thống tự động merge

### 8.2. Hiển Thị Tổng Tiền

- **Trong giỏ hàng**: Sử dụng `GET /api/cart` → chỉ có `subtotal` (chưa có discount)
- **Trong checkout**: Sử dụng `GET /api/checkout/preview` → có đầy đủ `discount` và `total`

### 8.3. Xử Lý Voucher

1. **Áp dụng voucher**:
   - Gọi `PUT /api/cart/voucher`
   - Sau đó gọi `GET /api/checkout/preview` để xem discount
   
2. **Xóa voucher**:
   - Gọi `DELETE /api/cart/voucher`
   - Sau đó gọi `GET /api/checkout/preview` để cập nhật tổng tiền

3. **Validate voucher**:
   - Luôn validate ở frontend trước (format, length)
   - Backend sẽ validate đầy đủ (tồn tại, hết hạn, số lượng, minOrder, usageLimit)

### 8.4. Error Handling

- Luôn kiểm tra `success` field trong response
- Hiển thị `message` cho user khi có lỗi
- Xử lý các error codes:
  - `VOUCHER_NOT_FOUND`: Voucher không tồn tại
  - `VOUCHER_EXPIRED`: Voucher đã hết hạn
  - `VOUCHER_QUANTITY_EXCEEDED`: Voucher đã hết số lượng
  - `VOUCHER_MIN_ORDER_NOT_MET`: Đơn hàng không đạt giá trị tối thiểu
  - `VOUCHER_USAGE_LIMIT_EXCEEDED`: User đã đạt giới hạn sử dụng

### 8.5. UX Recommendations

1. **Loading states**: Hiển thị loading khi đang xử lý
2. **Optimistic updates**: Có thể cập nhật UI trước, sau đó sync với server
3. **Auto-refresh**: Sau khi apply/remove voucher, tự động refresh checkout preview
4. **Error messages**: Hiển thị lỗi rõ ràng, dễ hiểu
5. **Voucher input**: Tự động uppercase và trim voucher code

### 8.6. Performance

- Cache cart response nếu có thể
- Debounce khi user nhập voucher code
- Chỉ gọi `checkout/preview` khi cần thiết (trước khi checkout)

---

## 9. Test Cases

### 9.1. Test Cases Cho Cart APIs

1. ✅ Thêm sản phẩm vào giỏ hàng rỗng
2. ✅ Thêm sản phẩm đã có trong giỏ (cộng dồn)
3. ✅ Thêm sản phẩm hết hàng → Error
4. ✅ Cập nhật số lượng
5. ✅ Cập nhật số lượng vượt stock → Error
6. ✅ Xóa sản phẩm
7. ✅ Xóa toàn bộ giỏ hàng
8. ✅ Merge guest cart vào user cart
9. ✅ Merge với stock overflow (tự động giới hạn)

### 9.2. Test Cases Cho Voucher

1. ✅ Áp dụng voucher hợp lệ
2. ✅ Áp dụng voucher không tồn tại → Error
3. ✅ Áp dụng voucher đã hết hạn → Error
4. ✅ Áp dụng voucher đã hết số lượng → Error
5. ✅ Áp dụng voucher với subtotal < minOrder → Error
6. ✅ Áp dụng voucher vượt quá usageLimitPerUser → Error
7. ✅ Xóa voucher
8. ✅ Checkout preview hiển thị đúng discount
9. ✅ Tính discount PERCENT với maxDiscount
10. ✅ Tính discount AMOUNT

---

## 10. Troubleshooting

### 10.1. Voucher không áp dụng được

**Kiểm tra**:
- Voucher code đúng format? (3-50 ký tự, chỉ chữ số, chữ cái, dấu gạch ngang và gạch dưới)
- Voucher có active không?
- Voucher có trong thời gian hiệu lực không?
- Subtotal có >= minOrder không?
- User có vượt quá usageLimitPerUser không?

### 10.2. Discount không hiển thị

**Kiểm tra**:
- Đã gọi `GET /api/checkout/preview` sau khi áp dụng voucher?
- Voucher có được lưu trong cart không? (kiểm tra `cart.voucherCode`)
- Response có `appliedVoucher` không?

### 10.3. Cart token không hoạt động

**Kiểm tra**:
- Cart token có được lưu đúng không?
- Header `X-Cart-Token` có được gửi đúng không?
- Cart token có bị mất sau khi merge không? (đây là hành vi bình thường)

---

## 11. Changelog & Notes

- Tất cả số tiền sử dụng BigDecimal (precision: 12, scale: 2)
- Voucher code được normalize (trim + uppercase) khi lưu
- Giá sản phẩm được lưu tại thời điểm thêm vào giỏ (`priceAtAdd`)
- Checkout preview sử dụng giá hiện tại, có cảnh báo nếu giá thay đổi
- Guest cart tự động merge vào user cart khi có cả token và auth
- Stock overflow được xử lý gracefully (giới hạn ở stock có sẵn)

---

## 12. Support & Contact

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ team backend.

**Lưu ý**: Tài liệu này được cập nhật theo phiên bản API hiện tại. Vui lòng kiểm tra version trước khi sử dụng.

