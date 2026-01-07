# Tài Liệu API Voucher - Kết Nối Frontend

## Tổng Quan

Tài liệu này mô tả chi tiết các endpoint liên quan đến voucher trong hệ thống, bao gồm:
- **Admin Voucher APIs**: Quản lý voucher (yêu cầu quyền ADMIN)
- **Cart Voucher APIs**: Áp dụng/xóa voucher trong giỏ hàng

---

## 1. Admin Voucher APIs

**Base URL**: `/api/admin/vouchers`

**Yêu cầu**: Tất cả endpoint yêu cầu quyền `ADMIN` và authentication token.

### 1.1. Tìm Kiếm Voucher (Search Vouchers)

**Endpoint**: `GET /api/admin/vouchers`

**Mô tả**: Tìm kiếm và lấy danh sách voucher với phân trang và bộ lọc.

**Query Parameters**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `code` | String | Không | Mã voucher để tìm kiếm |
| `active` | Boolean | Không | Lọc theo trạng thái active (true/false) |
| `startDateFrom` | DateTime (ISO 8601) | Không | Ngày bắt đầu từ (format: `yyyy-MM-ddTHH:mm:ss`) |
| `startDateTo` | DateTime (ISO 8601) | Không | Ngày bắt đầu đến (format: `yyyy-MM-ddTHH:mm:ss`) |
| `page` | Integer | Không | Số trang (mặc định: 0) |
| `size` | Integer | Không | Số lượng phần tử mỗi trang (mặc định: 10) |
| `sortBy` | String | Không | Trường sắp xếp (mặc định: "createdAt") |
| `sortDir` | String | Không | Hướng sắp xếp: "asc" hoặc "desc" (mặc định: "desc") |

**Ví dụ Request**:
```http
GET /api/admin/vouchers?code=SUMMER2024&active=true&page=0&size=20&sortBy=createdAt&sortDir=desc
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "code": "SUMMER2024",
        "discountType": "PERCENT",
        "discountValue": 20.00,
        "minOrder": 100000.00,
        "maxDiscount": 50000.00,
        "startDate": "2024-06-01T00:00:00",
        "endDate": "2024-08-31T23:59:59",
        "quantity": 1000,
        "usageLimitPerUser": 1,
        "active": true,
        "createdAt": "2024-05-15T10:30:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Response Fields**:
- `content`: Mảng các voucher
  - `id`: ID voucher
  - `code`: Mã voucher
  - `discountType`: Loại giảm giá (`PERCENT` hoặc `AMOUNT`)
  - `discountValue`: Giá trị giảm giá
  - `minOrder`: Đơn hàng tối thiểu (null nếu không có)
  - `maxDiscount`: Giảm giá tối đa (null nếu không có)
  - `startDate`: Ngày bắt đầu hiệu lực
  - `endDate`: Ngày kết thúc hiệu lực
  - `quantity`: Số lượng voucher còn lại
  - `usageLimitPerUser`: Giới hạn sử dụng mỗi user (null = không giới hạn)
  - `active`: Trạng thái active
  - `createdAt`: Ngày tạo

---

### 1.2. Lấy Chi Tiết Voucher

**Endpoint**: `GET /api/admin/vouchers/{id}`

**Mô tả**: Lấy thông tin chi tiết của một voucher bao gồm thống kê sử dụng.

**Path Parameters**:
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Long | ID của voucher |

**Ví dụ Request**:
```http
GET /api/admin/vouchers/1
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "SUMMER2024",
    "discountType": "PERCENT",
    "discountValue": 20.00,
    "minOrder": 100000.00,
    "maxDiscount": 50000.00,
    "startDate": "2024-06-01T00:00:00",
    "endDate": "2024-08-31T23:59:59",
    "quantity": 1000,
    "usageLimitPerUser": 1,
    "active": true,
    "createdAt": "2024-05-15T10:30:00",
    "totalUsage": 150,
    "remainingQuantity": 850
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Response Fields** (bổ sung so với list):
- `totalUsage`: Tổng số lần đã sử dụng
- `remainingQuantity`: Số lượng còn lại

**Error Responses**:
- `404 Not Found`: Voucher không tồn tại

---

### 1.3. Tạo Voucher Mới

**Endpoint**: `POST /api/admin/vouchers`

**Mô tả**: Tạo một voucher mới.

**Request Body**:
```json
{
  "code": "SUMMER2024",
  "discountType": "PERCENT",
  "discountValue": 20.00,
  "minOrder": 100000.00,
  "maxDiscount": 50000.00,
  "startDate": "2024-06-01T00:00:00",
  "endDate": "2024-08-31T23:59:59",
  "quantity": 1000,
  "usageLimitPerUser": 1,
  "active": true
}
```

**Request Fields**:
| Field | Kiểu | Bắt buộc | Validation | Mô tả |
|-------|------|----------|------------|-------|
| `code` | String | ✅ | 3-50 ký tự, chỉ chữ số, chữ cái, dấu gạch ngang và gạch dưới | Mã voucher (unique) |
| `discountType` | Enum | ✅ | `PERCENT` hoặc `AMOUNT` | Loại giảm giá |
| `discountValue` | BigDecimal | ✅ | > 0.01 | Giá trị giảm giá |
| `minOrder` | BigDecimal | ❌ | >= 0 | Đơn hàng tối thiểu (mặc định: 0) |
| `maxDiscount` | BigDecimal | ❌ | > 0.01 | Giảm giá tối đa (bắt buộc nếu discountType = PERCENT) |
| `startDate` | DateTime | ✅ | ISO 8601 format | Ngày bắt đầu hiệu lực |
| `endDate` | DateTime | ✅ | ISO 8601 format, phải sau startDate | Ngày kết thúc hiệu lực |
| `quantity` | Integer | ✅ | >= 0 | Số lượng voucher |
| `usageLimitPerUser` | Integer | ❌ | >= 1 | Giới hạn sử dụng mỗi user (mặc định: 1) |
| `active` | Boolean | ❌ | - | Trạng thái active (mặc định: true) |

**Ví dụ Request**:
```http
POST /api/admin/vouchers
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "code": "WELCOME10",
  "discountType": "AMOUNT",
  "discountValue": 50000.00,
  "minOrder": 200000.00,
  "startDate": "2024-07-01T00:00:00",
  "endDate": "2024-12-31T23:59:59",
  "quantity": 500,
  "usageLimitPerUser": 1,
  "active": true
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Tạo voucher thành công",
  "data": {
    "id": 2,
    "code": "WELCOME10",
    "discountType": "AMOUNT",
    "discountValue": 50000.00,
    "minOrder": 200000.00,
    "maxDiscount": null,
    "startDate": "2024-07-01T00:00:00",
    "endDate": "2024-12-31T23:59:59",
    "quantity": 500,
    "usageLimitPerUser": 1,
    "active": true,
    "createdAt": "2024-06-20T10:30:00",
    "totalUsage": 0,
    "remainingQuantity": 500
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `400 Bad Request`: Dữ liệu không hợp lệ (validation errors)
- `409 Conflict`: Mã voucher đã tồn tại

---

### 1.4. Cập Nhật Voucher

**Endpoint**: `PUT /api/admin/vouchers/{id}`

**Mô tả**: Cập nhật thông tin voucher. Tất cả các field đều optional (chỉ cập nhật các field được gửi lên).

**Path Parameters**:
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Long | ID của voucher |

**Request Body** (tất cả fields đều optional):
```json
{
  "code": "SUMMER2024_UPDATED",
  "discountType": "PERCENT",
  "discountValue": 25.00,
  "minOrder": 150000.00,
  "maxDiscount": 60000.00,
  "startDate": "2024-06-01T00:00:00",
  "endDate": "2024-09-30T23:59:59",
  "quantity": 2000,
  "usageLimitPerUser": 2,
  "active": true
}
```

**Validation Rules**: Tương tự như tạo voucher, nhưng tất cả đều optional.

**Ví dụ Request**:
```http
PUT /api/admin/vouchers/1
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "discountValue": 25.00,
  "quantity": 2000
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Cập nhật voucher thành công",
  "data": {
    "id": 1,
    "code": "SUMMER2024",
    "discountType": "PERCENT",
    "discountValue": 25.00,
    "minOrder": 100000.00,
    "maxDiscount": 50000.00,
    "startDate": "2024-06-01T00:00:00",
    "endDate": "2024-08-31T23:59:59",
    "quantity": 2000,
    "usageLimitPerUser": 1,
    "active": true,
    "createdAt": "2024-05-15T10:30:00",
    "totalUsage": 150,
    "remainingQuantity": 1850
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `400 Bad Request`: Dữ liệu không hợp lệ
- `404 Not Found`: Voucher không tồn tại
- `409 Conflict`: Mã voucher đã tồn tại (nếu cập nhật code)

---

### 1.5. Bật/Tắt Trạng Thái Voucher

**Endpoint**: `PUT /api/admin/vouchers/{id}/active`

**Mô tả**: Bật hoặc tắt trạng thái active của voucher.

**Path Parameters**:
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Long | ID của voucher |

**Request Body**:
```json
{
  "active": false
}
```

**Request Fields**:
| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `active` | Boolean | ✅ | true để bật, false để tắt |

**Ví dụ Request**:
```http
PUT /api/admin/vouchers/1/active
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "active": false
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Cập nhật trạng thái voucher thành công",
  "data": null,
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `400 Bad Request`: Dữ liệu không hợp lệ
- `404 Not Found`: Voucher không tồn tại

---

### 1.6. Xóa Voucher

**Endpoint**: `DELETE /api/admin/vouchers/{id}`

**Mô tả**: Xóa một voucher.

**Path Parameters**:
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Long | ID của voucher |

**Ví dụ Request**:
```http
DELETE /api/admin/vouchers/1
Authorization: Bearer {admin_token}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Xóa voucher thành công",
  "data": null,
  "timestamp": "2024-06-20T10:30:00"
}
```

**Error Responses**:
- `404 Not Found`: Voucher không tồn tại
- `400 Bad Request`: Không thể xóa voucher đã được sử dụng (nếu có ràng buộc)

---

### 1.7. Lấy Thống Kê Sử Dụng Voucher

**Endpoint**: `GET /api/admin/vouchers/{id}/usage`

**Mô tả**: Lấy thống kê và danh sách các lần sử dụng voucher.

**Path Parameters**:
| Tham số | Kiểu | Mô tả |
|---------|------|-------|
| `id` | Long | ID của voucher |

**Query Parameters** (Spring Pageable):
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---------|------|----------|-------|
| `page` | Integer | Không | Số trang (mặc định: 0) |
| `size` | Integer | Không | Số lượng phần tử mỗi trang (mặc định: 10) |
| `sort` | String | Không | Sắp xếp (ví dụ: "usedAt,desc") |

**Ví dụ Request**:
```http
GET /api/admin/vouchers/1/usage?page=0&size=20&sort=usedAt,desc
```

**Response 200 OK**:
```json
{
  "success": true,
  "data": {
    "totalUsage": 150,
    "recentUsage": [
      {
        "id": 1,
        "userEmail": "user@example.com",
        "userId": 123,
        "orderId": 456,
        "discountAmount": 50000.00,
        "usedAt": "2024-06-19T15:30:00"
      },
      {
        "id": 2,
        "userEmail": "customer@example.com",
        "userId": 124,
        "orderId": 457,
        "discountAmount": 45000.00,
        "usedAt": "2024-06-19T14:20:00"
      }
    ]
  },
  "timestamp": "2024-06-20T10:30:00"
}
```

**Response Fields**:
- `totalUsage`: Tổng số lần đã sử dụng
- `recentUsage`: Mảng các lần sử dụng gần đây
  - `id`: ID bản ghi sử dụng
  - `userEmail`: Email người dùng
  - `userId`: ID người dùng (null nếu là guest)
  - `orderId`: ID đơn hàng
  - `discountAmount`: Số tiền giảm giá
  - `usedAt`: Thời gian sử dụng

**Error Responses**:
- `404 Not Found`: Voucher không tồn tại

---

## 2. Cart Voucher APIs

**Base URL**: `/api/cart`

**Yêu cầu**: Có thể sử dụng với hoặc không có authentication (hỗ trợ guest cart).

### 2.1. Áp Dụng Voucher Vào Giỏ Hàng

**Endpoint**: `PUT /api/cart/voucher`

**Mô tả**: Áp dụng một voucher vào giỏ hàng hiện tại. Voucher sẽ được validate trước khi áp dụng.

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

**Ví dụ Request**:
```http
PUT /api/cart/voucher
Content-Type: application/json
X-Cart-Token: {cart_token}
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
  - Đơn hàng không đạt giá trị tối thiểu
  - User đã đạt giới hạn sử dụng
- `404 Not Found`: Voucher không tồn tại

**Lưu ý**: Sau khi áp dụng voucher thành công, cần gọi lại `GET /api/cart` để lấy thông tin giỏ hàng cập nhật (bao gồm discount amount).

---

### 2.2. Xóa Voucher Khỏi Giỏ Hàng

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
X-Cart-Token: {cart_token}
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

**Lưu ý**: Sau khi xóa voucher, cần gọi lại `GET /api/cart` để lấy thông tin giỏ hàng cập nhật.

---

## 3. Cấu Trúc Dữ Liệu

### 3.1. DiscountType Enum

```typescript
enum DiscountType {
  PERCENT = "PERCENT",  // Giảm giá theo phần trăm
  AMOUNT = "AMOUNT"     // Giảm giá theo số tiền cố định
}
```

### 3.2. Cách Tính Giảm Giá

**PERCENT (Phần trăm)**:
```
discountAmount = min(
  orderAmount * (discountValue / 100),
  maxDiscount (nếu có)
)
```

**AMOUNT (Số tiền cố định)**:
```
discountAmount = discountValue
```

**Ví dụ**:
- Voucher PERCENT: `discountValue = 20`, `maxDiscount = 50000`, `orderAmount = 300000`
  - `discountAmount = min(300000 * 0.2, 50000) = 50000`
  
- Voucher AMOUNT: `discountValue = 50000`, `orderAmount = 300000`
  - `discountAmount = 50000`

---

## 4. Validation Rules

### 4.1. Voucher Code
- Độ dài: 3-50 ký tự
- Chỉ chứa: chữ cái (A-Z, a-z), chữ số (0-9), dấu gạch ngang (-), dấu gạch dưới (_)
- Phải unique trong hệ thống

### 4.2. Discount Value
- Phải > 0.01
- Với PERCENT: thường từ 1-100
- Với AMOUNT: giá trị tiền tệ

### 4.3. Date Range
- `startDate` phải trước `endDate`
- Format: ISO 8601 (`yyyy-MM-ddTHH:mm:ss`)

### 4.4. Quantity
- Phải >= 0
- Khi quantity = 0, voucher không thể sử dụng

### 4.5. Usage Limit Per User
- Phải >= 1 nếu được chỉ định
- null = không giới hạn

---

## 5. Error Codes & Messages

### 5.1. Common Error Response Format

```json
{
  "success": false,
  "errorCode": "VOUCHER_NOT_FOUND",
  "message": "Voucher không tồn tại",
  "timestamp": "2024-06-20T10:30:00"
}
```

### 5.2. Common Error Codes

| Error Code | HTTP Status | Mô tả |
|------------|-------------|-------|
| `VOUCHER_NOT_FOUND` | 404 | Voucher không tồn tại |
| `VOUCHER_INVALID` | 400 | Voucher không hợp lệ |
| `VOUCHER_EXPIRED` | 400 | Voucher đã hết hạn hoặc chưa đến ngày hiệu lực |
| `VOUCHER_QUANTITY_EXCEEDED` | 400 | Voucher đã hết số lượng |
| `VOUCHER_MIN_ORDER_NOT_MET` | 400 | Đơn hàng không đạt giá trị tối thiểu |
| `VOUCHER_USAGE_LIMIT_EXCEEDED` | 400 | User đã đạt giới hạn sử dụng |
| `VOUCHER_CODE_EXISTS` | 409 | Mã voucher đã tồn tại |
| `VALIDATION_ERROR` | 400 | Lỗi validation dữ liệu |

---

## 6. Ví Dụ Sử Dụng Frontend

### 6.1. React/TypeScript Example

```typescript
// Types
interface Voucher {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  quantity: number;
  usageLimitPerUser?: number;
  active: boolean;
  createdAt: string;
  totalUsage?: number;
  remainingQuantity?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  errorCode?: string;
  data: T;
  timestamp: string;
}

// API Service
class VoucherService {
  private baseUrl = '/api/admin/vouchers';
  
  async searchVouchers(params: {
    code?: string;
    active?: boolean;
    startDateFrom?: string;
    startDateTo?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<AdminVoucherPageResponse>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await fetch(`${this.baseUrl}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  }
  
  async getVoucher(id: number): Promise<ApiResponse<Voucher>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  }
  
  async createVoucher(data: AdminCreateVoucherRequest): Promise<ApiResponse<Voucher>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async updateVoucher(id: number, data: Partial<AdminUpdateVoucherRequest>): Promise<ApiResponse<Voucher>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
  
  async toggleActive(id: number, active: boolean): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/${id}/active`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ active }),
    });
    return response.json();
  }
  
  async deleteVoucher(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  }
  
  async getUsageStats(id: number, page = 0, size = 10): Promise<ApiResponse<VoucherUsageStatsResponse>> {
    const response = await fetch(`${this.baseUrl}/${id}/usage?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  }
}

// Cart Voucher Service
class CartVoucherService {
  private baseUrl = '/api/cart';
  
  async applyVoucher(voucherCode: string, cartToken?: string): Promise<ApiResponse<void>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cartToken) {
      headers['X-Cart-Token'] = cartToken;
    }
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseUrl}/voucher`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ voucherCode }),
    });
    return response.json();
  }
  
  async removeVoucher(cartToken?: string): Promise<ApiResponse<void>> {
    const headers: Record<string, string> = {};
    
    if (cartToken) {
      headers['X-Cart-Token'] = cartToken;
    }
    
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseUrl}/voucher`, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  }
}
```

### 6.2. Vue.js Example

```javascript
// composables/useVoucher.js
import { ref } from 'vue';
import axios from 'axios';

export function useVoucher() {
  const vouchers = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  const searchVouchers = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get('/api/admin/vouchers', { params });
      vouchers.value = response.data.data.content;
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Có lỗi xảy ra';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const applyVoucher = async (voucherCode, cartToken = null) => {
    loading.value = true;
    error.value = null;
    try {
      const headers = {};
      if (cartToken) {
        headers['X-Cart-Token'] = cartToken;
      }
      const response = await axios.put(
        '/api/cart/voucher',
        { voucherCode },
        { headers }
      );
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể áp dụng voucher';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    vouchers,
    loading,
    error,
    searchVouchers,
    applyVoucher,
  };
}
```

---

## 7. Best Practices

### 7.1. Error Handling
- Luôn kiểm tra `success` field trong response
- Hiển thị `message` cho user khi có lỗi
- Log `errorCode` để debug

### 7.2. Validation
- Validate voucher code format ở frontend trước khi gửi request
- Validate date range (startDate < endDate)
- Validate discount value phù hợp với discount type

### 7.3. UX Recommendations
- Hiển thị loading state khi đang xử lý
- Sau khi apply/remove voucher, tự động refresh cart để cập nhật tổng tiền
- Hiển thị thông báo thành công/thất bại rõ ràng
- Disable nút submit khi đang xử lý để tránh duplicate requests

### 7.4. Security
- Luôn gửi authentication token trong header
- Không lưu token trong localStorage nếu không cần thiết
- Validate input ở cả frontend và backend

---

## 8. Testing

### 8.1. Test Cases Cho Admin APIs

1. **Tạo voucher thành công**
2. **Tạo voucher với code trùng** → 409 Conflict
3. **Tạo voucher với dữ liệu không hợp lệ** → 400 Bad Request
4. **Cập nhật voucher không tồn tại** → 404 Not Found
5. **Tìm kiếm voucher với filter** → Trả về đúng kết quả
6. **Xóa voucher** → Thành công

### 8.2. Test Cases Cho Cart APIs

1. **Áp dụng voucher hợp lệ** → Thành công
2. **Áp dụng voucher không tồn tại** → 404 Not Found
3. **Áp dụng voucher đã hết hạn** → 400 Bad Request
4. **Áp dụng voucher với đơn hàng không đạt minOrder** → 400 Bad Request
5. **Xóa voucher khỏi cart** → Thành công

---

## 9. Changelog & Notes

- Tất cả datetime sử dụng ISO 8601 format
- Tất cả số tiền sử dụng BigDecimal (precision: 12, scale: 2)
- Voucher code không phân biệt hoa thường (nên normalize ở frontend)
- Guest cart cần `X-Cart-Token` header
- User cart tự động lấy từ authentication token

---

## 10. Support & Contact

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng liên hệ team backend.

**Lưu ý**: Tài liệu này được cập nhật theo phiên bản API hiện tại. Vui lòng kiểm tra version trước khi sử dụng.

