# Tóm Tắt Sửa Lỗi Cart API

## Vấn Đề Đã Phát Hiện

### 1. Lỗi thiếu `user_id` khi khách vãng lai thêm giỏ hàng
**Nguyên nhân có thể:**
- Backend đang yêu cầu `user_id` trong request body hoặc đang cố tạo cart với `user_id = null` và database không cho phép null
- Frontend có thể đang gửi nhầm headers (gửi cả `X-Cart-Token` và `Authorization` khi không nên)

**Giải pháp đã áp dụng:**
- Đảm bảo `getCartToken()` trả về `undefined` khi user đã đăng nhập
- Đảm bảo chỉ gửi `X-Cart-Token` header khi là guest cart (không có `Authorization`)
- Xóa `cartToken` ngay khi chuyển sang user cart để tránh gửi nhầm

### 2. Lỗi `checkout_locked` doesn't have a default value khi user đã đăng nhập
**Nguyên nhân có thể:**
- Backend tạo cart cho user nhưng không set giá trị cho field `checkout_locked`
- Database không có default value cho field này
- Frontend có thể đang gửi nhầm headers (gửi cả `X-Cart-Token` và `Authorization`)

**Giải pháp đã áp dụng:**
- Đảm bảo chỉ gửi `Authorization` header khi user đã đăng nhập (không có `X-Cart-Token`)
- Xóa `cartToken` ngay sau khi đăng nhập để đảm bảo các request sau chỉ gửi `Authorization`
- Thêm logic xử lý `cartToken` trong `addItem()` để xóa ngay khi nhận được user cart

## Các Thay Đổi Đã Thực Hiện

### 1. `src/core/services/api/cart.service.ts`
- Thêm comment chi tiết về logic gửi headers
- Đảm bảo chỉ thêm `X-Cart-Token` khi có `cartToken`
- `Authorization` header được thêm tự động bởi axios interceptor

### 2. `src/ui/stores/cart.store.ts`
- Cải thiện logic `getCartToken()`: trả về `undefined` khi user đã đăng nhập
- Thêm comment chi tiết về logic xử lý headers
- Đảm bảo xóa `cartToken` ngay khi chuyển sang user cart trong:
  - `loadCart()`: Xóa `cartToken` khi nhận được user cart
  - `addItem()`: Xóa `cartToken` khi nhận được user cart
  - `mergeCart()`: Xóa `cartToken` sau khi merge thành công

## Logic Headers Theo Tài Liệu API

### Guest Cart (Chưa đăng nhập)
- **Chỉ gửi:** `X-Cart-Token` header
- **Không gửi:** `Authorization` header
- **Request:** `POST /api/cart/items` với `X-Cart-Token` header

### User Cart (Đã đăng nhập)
- **Chỉ gửi:** `Authorization` header (tự động bởi axios interceptor)
- **Không gửi:** `X-Cart-Token` header
- **Request:** `POST /api/cart/items` với `Authorization` header

### Merge Cart (Khi đăng nhập)
- **Gửi cả hai:** `X-Cart-Token` và `Authorization` header
- **Request:** `POST /api/cart/merge` hoặc bất kỳ request nào có cả hai headers
- **Sau merge:** Xóa `cartToken` để các request sau chỉ gửi `Authorization`

## Kiểm Tra Backend

Nếu vẫn còn lỗi sau khi sửa frontend, cần kiểm tra backend:

### 1. Lỗi thiếu `user_id` khi guest thêm giỏ hàng
- Kiểm tra backend có yêu cầu `user_id` trong request body không
- Kiểm tra database có cho phép `user_id = null` cho guest cart không
- Kiểm tra logic tạo cart: guest cart không nên có `user_id`

### 2. Lỗi `checkout_locked` doesn't have a default value
- Kiểm tra database schema: field `checkout_locked` có default value không
- Kiểm tra backend có set giá trị cho `checkout_locked` khi tạo cart không
- Nếu không có default value, backend phải set giá trị khi tạo cart (thường là `false`)

## Test Cases Cần Kiểm Tra

1. ✅ Guest thêm sản phẩm vào giỏ hàng (chỉ gửi `X-Cart-Token`)
2. ✅ User đã đăng nhập thêm sản phẩm vào giỏ hàng (chỉ gửi `Authorization`)
3. ✅ Guest đăng nhập → merge cart tự động
4. ✅ Sau khi đăng nhập, các request tiếp theo chỉ gửi `Authorization` (không có `X-Cart-Token`)

## Lưu Ý Quan Trọng

1. **Không bao giờ gửi cả `X-Cart-Token` và `Authorization` cùng lúc** (trừ khi đang merge)
2. **Xóa `cartToken` ngay khi chuyển sang user cart** để tránh gửi nhầm
3. **Backend sẽ tự động merge** nếu nhận được cả hai headers, nhưng frontend nên xóa `cartToken` sau khi merge
4. **Theo tài liệu API**, guest cart không cần `user_id`, chỉ cần `X-Cart-Token`

