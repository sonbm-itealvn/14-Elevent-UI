import { defineStore } from "pinia";
import { ref, computed } from "vue";
import CartService from "@/core/services/api/cart.service";
import type {
  CartResponse,
  CheckoutPreviewResponse,
} from "@/domain/models/cart.model";
import StorageService from "@/core/services/storages/storage.service";
import useAuthStore from "./auth.store";

const CART_TOKEN_KEY = "cartToken";

const useCartStore = defineStore("cart", () => {
  const cart = ref<CartResponse | null>(null);
  const checkoutPreview = ref<CheckoutPreviewResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  // Computed
  // Chỉ trả về cartToken nếu user chưa đăng nhập (guest cart)
  const cartToken = computed(() => {
    if (authStore.isAuthenticated) {
      return undefined;
    }
    return StorageService.getLocalStorageItem(CART_TOKEN_KEY) || undefined;
  });

  const totalItems = computed(() => {
    return cart.value?.totalItems || 0;
  });

  const subtotal = computed(() => {
    return cart.value?.subtotal || 0;
  });

  const hasItems = computed(() => {
    return (cart.value?.items.length || 0) > 0;
  });

  // Helper function để lấy cart token từ localStorage
  // Chỉ trả về token nếu user chưa đăng nhập (guest cart)
  // 
  // Logic quan trọng:
  // - Guest cart: chỉ gửi X-Cart-Token header (không có Authorization)
  // - User cart: chỉ gửi Authorization header (không có X-Cart-Token)
  // - Khi merge: có thể gửi cả hai, backend sẽ tự động merge
  const getCartToken = (): string | undefined => {
    // Nếu user đã đăng nhập, KHÔNG sử dụng cartToken
    // Đảm bảo chỉ gửi Authorization header (tự động bởi axios interceptor)
    if (authStore.isAuthenticated) {
      // Xóa cartToken nếu còn sót lại (đảm bảo không gửi nhầm)
      const existingToken = StorageService.getLocalStorageItem(CART_TOKEN_KEY);
      if (existingToken) {
        // Không xóa ngay ở đây vì có thể đang trong quá trình merge
        // Chỉ trả về undefined để không gửi X-Cart-Token header
        return undefined;
      }
      return undefined;
    }
    // Nếu user chưa đăng nhập, trả về cartToken (nếu có)
    return StorageService.getLocalStorageItem(CART_TOKEN_KEY) || undefined;
  };

  // Helper function để lưu cart token
  const saveCartToken = (token: string | null) => {
    if (token) {
      StorageService.setLocalStorageItem(CART_TOKEN_KEY, token);
    } else {
      StorageService.removeLocalStorageItem(CART_TOKEN_KEY);
    }
  };

  /**
   * Load giỏ hàng từ server
   * 
   * Logic:
   * - Nếu user đã đăng nhập: getCartToken() trả về undefined → chỉ gửi Authorization header
   * - Nếu user chưa đăng nhập: getCartToken() trả về token → gửi X-Cart-Token header
   * - Nếu có cả Authorization và X-Cart-Token: Backend tự động merge (auto-merge)
   * 
   * Theo tài liệu API:
   * - Guest cart: chỉ cần X-Cart-Token header (không có Authorization)
   * - User cart: chỉ cần Authorization header (không có X-Cart-Token)
   * - Khi có cả hai: backend tự động merge guest cart vào user cart
   */
  const loadCart = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // getCartToken() sẽ trả về undefined nếu user đã đăng nhập
      // Điều này đảm bảo chỉ gửi Authorization header (tự động bởi axios interceptor)
      // Nếu user chưa đăng nhập, trả về cartToken để gửi X-Cart-Token header
      const token = getCartToken();
      const cartData = await CartService.getCart(token);
      cart.value = cartData;

      // Xử lý cartToken sau khi nhận response
      if (cartData.userCart) {
        // Nếu là user cart, XÓA cartToken ngay lập tức
        // Đảm bảo các request sau chỉ gửi Authorization header
        // Tránh lỗi backend khi tạo cart với cả user_id và cartToken
        saveCartToken(null);
      } else if (cartData.cartToken) {
        // Nếu là guest cart, lưu cartToken
        // Đảm bảo các request sau gửi X-Cart-Token header
        saveCartToken(cartData.cartToken);
      }
    } catch (err: any) {
      error.value = err.message || "Không thể tải giỏ hàng";
      console.error("Error loading cart:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load checkout preview (bao gồm discount từ voucher)
   */
  const loadCheckoutPreview = async () => {
    try {
      loading.value = true;
      error.value = null;
      const token = getCartToken();
      const preview = await CartService.getCheckoutPreview(token);
      checkoutPreview.value = preview;
    } catch (err: any) {
      error.value = err.message || "Không thể tải thông tin thanh toán";
      console.error("Error loading checkout preview:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Thêm sản phẩm vào giỏ hàng
   * 
   * Logic:
   * - Guest: gửi X-Cart-Token header (không có Authorization)
   * - User: gửi Authorization header (không có X-Cart-Token)
   * 
   * Lưu ý: Đảm bảo không gửi cả hai headers cùng lúc trừ khi đang merge
   */
  const addItem = async (productVariantId: number, quantity: number) => {
    try {
      loading.value = true;
      error.value = null;
      
      // getCartToken() trả về undefined nếu user đã đăng nhập
      // Đảm bảo chỉ gửi đúng header theo loại cart
      const token = getCartToken();
      const cartData = await CartService.addItem(
        productVariantId,
        quantity,
        token
      );
      cart.value = cartData;

      // Xử lý cartToken sau khi nhận response
      // Quan trọng: Xóa cartToken ngay khi chuyển sang user cart
      // Tránh lỗi backend khi tạo cart với cả user_id và cartToken
      if (cartData.userCart) {
        // Nếu là user cart, XÓA cartToken ngay lập tức
        // Đảm bảo các request sau chỉ gửi Authorization header
        saveCartToken(null);
      } else if (cartData.cartToken) {
        // Nếu là guest cart, lưu cartToken
        // Đảm bảo các request sau gửi X-Cart-Token header
        saveCartToken(cartData.cartToken);
      }
    } catch (err: any) {
      error.value = err.message || "Không thể thêm sản phẩm";
      console.error("Error adding item to cart:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cập nhật số lượng sản phẩm
   */
  const updateItemQuantity = async (itemId: number, quantity: number) => {
    try {
      loading.value = true;
      error.value = null;
      const token = getCartToken();
      const cartData = await CartService.updateItemQuantity(
        itemId,
        quantity,
        token
      );
      cart.value = cartData;
    } catch (err: any) {
      error.value = err.message || "Không thể cập nhật số lượng";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  const removeItem = async (itemId: number) => {
    try {
      loading.value = true;
      error.value = null;
      const token = getCartToken();
      await CartService.removeItem(itemId, token);
      // Load lại giỏ hàng sau khi xóa
      await loadCart();
    } catch (err: any) {
      error.value = err.message || "Không thể xóa sản phẩm";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCart = async () => {
    try {
      loading.value = true;
      error.value = null;
      const token = getCartToken();
      await CartService.clearCart(token);
      // Load lại giỏ hàng sau khi xóa
      await loadCart();
    } catch (err: any) {
      error.value = err.message || "Không thể xóa giỏ hàng";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Merge guest cart vào user cart khi đăng nhập
   * 
   * Logic:
   * - Gửi cả X-Cart-Token và Authorization header
   * - Backend sẽ merge guest cart vào user cart
   * - Sau khi merge, xóa cartToken để các request sau chỉ gửi Authorization
   */
  const mergeCart = async () => {
    try {
      // Lấy token trực tiếp từ localStorage (không qua getCartToken vì nó sẽ trả về undefined khi đã đăng nhập)
      const token = StorageService.getLocalStorageItem(CART_TOKEN_KEY);
      if (!token || !authStore.isAuthenticated) {
        // Không có token hoặc chưa đăng nhập → không cần merge
        return;
      }

      loading.value = true;
      error.value = null;
      
      // Gửi cả X-Cart-Token và Authorization header
      // Backend sẽ tự động merge guest cart vào user cart
      const cartData = await CartService.mergeCart(token);
      cart.value = cartData;

      // Xóa cartToken sau khi merge thành công
      // Đảm bảo các request sau chỉ gửi Authorization header
      saveCartToken(null);
    } catch (err: any) {
      error.value = err.message || "Không thể merge giỏ hàng";
      console.error("Error merging cart:", err);
      // Đảm bảo xóa token ngay cả khi merge fail
      // Tránh gửi nhầm X-Cart-Token trong các request sau
      saveCartToken(null);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Áp dụng voucher
   */
  const applyVoucher = async (voucherCode: string) => {
    try {
      loading.value = true;
      error.value = null;
      const token = getCartToken();
      await CartService.applyVoucher(voucherCode, token);
      // Load lại checkout preview để xem discount
      await loadCheckoutPreview();
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Không thể áp dụng voucher";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Xóa voucher
   */
  const removeVoucher = async () => {
    try {
      loading.value = true;
      error.value = null;
      const token = getCartToken();
      await CartService.removeVoucher(token);
      // Load lại checkout preview
      await loadCheckoutPreview();
    } catch (err: any) {
      error.value = err.message || "Không thể xóa voucher";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reset store
   */
  const reset = () => {
    cart.value = null;
    checkoutPreview.value = null;
    error.value = null;
    saveCartToken(null);
  };

  return {
    // State
    cart,
    checkoutPreview,
    loading,
    error,
    // Computed
    cartToken,
    totalItems,
    subtotal,
    hasItems,
    // Actions
    loadCart,
    loadCheckoutPreview,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    mergeCart,
    applyVoucher,
    removeVoucher,
    reset,
  };
});

export default useCartStore;

