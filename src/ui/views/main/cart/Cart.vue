<template>
  <div class="cart-page container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Giỏ Hàng</h1>

    <n-spin :show="cartStore.loading">
      <div v-if="!cartStore.hasItems" class="empty-cart text-center py-12">
        <n-empty description="Giỏ hàng của bạn đang trống">
          <template #extra>
            <n-button type="primary" @click="goToProducts">
              Tiếp tục mua sắm
            </n-button>
          </template>
        </n-empty>
      </div>

      <div v-else class="cart-content">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Danh sách sản phẩm -->
          <div class="lg:col-span-2">
            <div class="cart-items bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Sản phẩm</h2>
              <div class="space-y-4">
                <div
                  v-for="item in cartStore.cart?.items"
                  :key="item.id"
                  class="cart-item flex gap-4 p-4 border-b border-gray-200 last:border-0"
                >
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg mb-1">
                      {{ item.productName }}
                    </h3>
                    <p class="text-sm text-gray-500 mb-2">SKU: {{ item.sku }}</p>
                    <p class="text-lg font-semibold text-red-600">
                      {{ formatPrice(item.price) }} VND
                    </p>
                  </div>

                  <div class="flex items-center gap-4">
                    <!-- Số lượng -->
                    <div class="flex items-center gap-2">
                      <n-button
                        size="small"
                        :disabled="item.quantity <= 1 || cartStore.loading"
                        @click="updateQuantity(item.id, item.quantity - 1)"
                      >
                        -
                      </n-button>
                      <span class="w-12 text-center">{{ item.quantity }}</span>
                      <n-button
                        size="small"
                        :disabled="cartStore.loading"
                        @click="updateQuantity(item.id, item.quantity + 1)"
                      >
                        +
                      </n-button>
                    </div>

                    <!-- Tổng tiền -->
                    <div class="w-32 text-right">
                      <p class="font-semibold text-lg">
                        {{ formatPrice(item.lineTotal) }} VND
                      </p>
                    </div>

                    <!-- Xóa -->
                    <n-button
                      type="error"
                      size="small"
                      :disabled="cartStore.loading"
                      @click="removeItem(item.id)"
                    >
                      Xóa
                    </n-button>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-4 border-t border-gray-200">
                <n-button
                  type="error"
                  :disabled="cartStore.loading"
                  @click="clearCart"
                >
                  Xóa toàn bộ giỏ hàng
                </n-button>
              </div>
            </div>
          </div>

          <!-- Tổng tiền và Voucher -->
          <div class="lg:col-span-1">
            <div class="cart-summary bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 class="text-xl font-semibold mb-4">Tổng Thanh Toán</h2>

              <!-- Voucher Section -->
              <div class="voucher-section mb-6 pb-6 border-b border-gray-200">
                <h3 class="font-semibold mb-3">Mã Giảm Giá</h3>
                <div v-if="checkoutPreview?.appliedVoucher" class="applied-voucher mb-3">
                  <div class="flex items-center justify-between p-3 bg-green-50 rounded">
                    <div>
                      <p class="font-semibold text-green-700">
                        {{ checkoutPreview.appliedVoucher.code }}
                      </p>
                      <p class="text-sm text-green-600">
                        Đã áp dụng
                      </p>
                    </div>
                    <n-button
                      size="small"
                      type="error"
                      :disabled="cartStore.loading"
                      @click="handleRemoveVoucher"
                    >
                      Xóa
                    </n-button>
                  </div>
                </div>
                <div v-else>
                  <div class="flex gap-2">
                    <n-input
                      v-model:value="voucherCode"
                      placeholder="Nhập mã voucher"
                      :disabled="cartStore.loading"
                      @keyup.enter="handleApplyVoucher"
                      class="flex-1"
                    />
                    <n-button
                      type="primary"
                      :loading="cartStore.loading"
                      :disabled="!voucherCode.trim()"
                      @click="handleApplyVoucher"
                    >
                      Áp dụng
                    </n-button>
                  </div>
                  <p v-if="voucherError" class="text-red-500 text-sm mt-2">
                    {{ voucherError }}
                  </p>
                </div>
              </div>

              <!-- Tổng tiền -->
              <div class="summary-details space-y-3">
                <div class="flex justify-between">
                  <span>Tạm tính:</span>
                  <span class="font-semibold">
                    {{ formatPrice(checkoutPreview?.subtotal || cartStore.subtotal) }} VND
                  </span>
                </div>
                <div v-if="checkoutPreview && checkoutPreview.discount > 0" class="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span class="font-semibold">
                    -{{ formatPrice(checkoutPreview.discount) }} VND
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span class="font-semibold">
                    {{ formatPrice(checkoutPreview?.shippingFee || 0) }} VND
                  </span>
                </div>
                <div class="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                  <span>Tổng cộng:</span>
                  <span class="text-red-600">
                    {{ formatPrice(checkoutPreview?.total || cartStore.subtotal) }} VND
                  </span>
                </div>
              </div>

              <!-- Cảnh báo giá thay đổi -->
              <div v-if="checkoutPreview?.priceChangeWarning" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p class="text-sm text-yellow-800">
                  {{ checkoutPreview.priceChangeWarning }}
                </p>
              </div>

              <!-- Nút thanh toán -->
              <div class="mt-6">
                <n-button
                  type="primary"
                  size="large"
                  block
                  :disabled="cartStore.loading"
                  @click="goToCheckout"
                >
                  Thanh toán
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-spin>

    <!-- Gợi ý đăng ký nhận voucher cho khách vãng lai -->
    <NModal
      v-model:show="showSignupSuggestionModal"
      title="Nhận voucher giảm giá đến 20%?"
      preset="dialog"
      style="max-width: 520px"
    >
      <div class="space-y-4">
        <p class="text-sm text-neutral-700">
          Tạo tài khoản 14Elevent để lưu lịch sử mua hàng, theo dõi đơn dễ dàng và
          nhận ưu đãi độc quyền lên đến
          <span class="font-semibold text-red-600">20% cho các đơn tiếp theo</span>.
        </p>
        <ul class="text-sm text-neutral-700 list-disc pl-5 space-y-1">
          <li>Lưu địa chỉ giao hàng cho những lần mua sau.</li>
          <li>Nhận thông báo sớm về các chương trình khuyến mãi.</li>
          <li>Quản lý đơn hàng và trạng thái thanh toán thuận tiện.</li>
        </ul>
      </div>
      <template #action>
        <NButton quaternary @click="handleSignupLater">
          Để sau, thanh toán luôn
        </NButton>
        <NButton type="primary" @click="handleGoRegister">
          Đăng ký ngay
        </NButton>
      </template>
    </NModal>

    <!-- Checkout Modal -->
    <NModal
      v-model:show="showCheckoutModal"
      title="Thông tin giao hàng"
      preset="card"
      style="width: 600px"
      :mask-closable="!submittingCheckout"
      :close-on-esc="!submittingCheckout"
    >
      <NForm>
        <NFormItem
          v-if="!authStore.isAuthenticated"
          label="Email"
          required
          :show-feedback="false"
        >
            <NInput
              v-model:value="checkoutForm.buyerEmail"
              type="text"
              placeholder="your.email@example.com"
              :disabled="submittingCheckout"
            />
        </NFormItem>

        <NFormItem label="Họ và tên người nhận" required :show-feedback="false">
          <NInput
            v-model:value="checkoutForm.receiverName"
            placeholder="Nhập họ và tên"
            :disabled="submittingCheckout"
          />
        </NFormItem>

        <NFormItem label="Số điện thoại" required :show-feedback="false">
          <NInput
            v-model:value="checkoutForm.receiverPhone"
            placeholder="0123456789"
            :disabled="submittingCheckout"
          />
        </NFormItem>

        <NFormItem label="Địa chỉ" required :show-feedback="false">
          <NInput
            v-model:value="checkoutForm.shippingAddress"
            placeholder="Số nhà, tên đường"
            :disabled="submittingCheckout"
          />
        </NFormItem>

        <NFormItem label="Phường/Xã" :show-feedback="false">
          <NInput
            v-model:value="checkoutForm.shippingWard"
            placeholder="Phường/Xã"
            :disabled="submittingCheckout"
          />
        </NFormItem>

        <NFormItem label="Quận/Huyện" :show-feedback="false">
          <NInput
            v-model:value="checkoutForm.shippingDistrict"
            placeholder="Quận/Huyện"
            :disabled="submittingCheckout"
          />
        </NFormItem>

        <NFormItem label="Thành phố/Tỉnh" required :show-feedback="false">
          <NInput
            v-model:value="checkoutForm.shippingCity"
            placeholder="Hà Nội, TP.HCM, ..."
            :disabled="submittingCheckout"
          />
        </NFormItem>

        <NFormItem label="Ghi chú" :show-feedback="false">
          <NInput
            v-model:value="checkoutForm.note"
            type="textarea"
            placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
            :rows="3"
            :disabled="submittingCheckout"
          />
        </NFormItem>

        <div class="mt-4 p-3 bg-gray-50 rounded">
          <div class="flex justify-between mb-2">
            <span>Tạm tính:</span>
            <span class="font-semibold">
              {{ formatPrice(checkoutPreview?.subtotal || 0) }} VND
            </span>
          </div>
          <div
            v-if="checkoutPreview && checkoutPreview.discount > 0"
            class="flex justify-between mb-2 text-green-600"
          >
            <span>Giảm giá:</span>
            <span class="font-semibold">
              -{{ formatPrice(checkoutPreview.discount) }} VND
            </span>
          </div>
          <div class="flex justify-between mb-2">
            <span>Phí vận chuyển:</span>
            <span class="font-semibold">
              {{ formatPrice(checkoutPreview?.shippingFee || 0) }} VND
            </span>
          </div>
          <div class="flex justify-between pt-2 border-t border-gray-300">
            <span class="font-bold">Tổng cộng:</span>
            <span class="font-bold text-red-600 text-lg">
              {{ formatPrice(checkoutPreview?.total || 0) }} VND
            </span>
          </div>
        </div>

        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-sm text-blue-800">
            <strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng
            (COD)
          </p>
        </div>
      </NForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <NButton
            :disabled="submittingCheckout"
            @click="closeCheckoutModal"
          >
            Hủy
          </NButton>
          <NButton
            type="primary"
            :loading="submittingCheckout"
            @click="handleCheckout"
          >
            {{ submittingCheckout ? "Đang xử lý..." : "Xác nhận đặt hàng" }}
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import {
  NSpin,
  NEmpty,
  NButton,
  NInput,
  NModal,
  NForm,
  NFormItem,
  useMessage,
} from "naive-ui";
import useCartStore from "@/ui/stores/cart.store";
import useAuthStore from "@/ui/stores/auth.store";
import CheckoutService from "@/core/services/api/checkout.service";

const router = useRouter();
const message = useMessage();
const cartStore = useCartStore();
const authStore = useAuthStore();

const voucherCode = ref("");
const voucherError = ref<string | null>(null);
const checkoutPreview = computed(() => cartStore.checkoutPreview);

// Format giá tiền
const formatPrice = (price: number | undefined): string => {
  if (!price) return "0";
  return new Intl.NumberFormat("vi-VN").format(price);
};

// Load dữ liệu
onMounted(async () => {
  await cartStore.loadCart();
  if (cartStore.hasItems) {
    await cartStore.loadCheckoutPreview();
  }
});

// Watch cart changes để reload checkout preview
watch(
  () => cartStore.cart,
  async (newCart) => {
    if (newCart && newCart.items.length > 0) {
      await cartStore.loadCheckoutPreview();
    }
  },
  { deep: true }
);

// Cập nhật số lượng
const updateQuantity = async (itemId: number, quantity: number) => {
  if (quantity < 1) return;
  try {
    await cartStore.updateItemQuantity(itemId, quantity);
    message.success("Đã cập nhật số lượng");
  } catch (error: any) {
    message.error(error.message || "Không thể cập nhật số lượng");
  }
};

// Xóa sản phẩm
const removeItem = async (itemId: number) => {
  try {
    await cartStore.removeItem(itemId);
    message.success("Đã xóa sản phẩm");
  } catch (error: any) {
    message.error(error.message || "Không thể xóa sản phẩm");
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async () => {
  try {
    await cartStore.clearCart();
    message.success("Đã xóa toàn bộ giỏ hàng");
  } catch (error: any) {
    message.error(error.message || "Không thể xóa giỏ hàng");
  }
};

// Áp dụng voucher
const handleApplyVoucher = async () => {
  voucherError.value = null;
  if (!voucherCode.value.trim()) {
    voucherError.value = "Vui lòng nhập mã voucher";
    return;
  }

  try {
    await cartStore.applyVoucher(voucherCode.value.trim().toUpperCase());
    voucherCode.value = "";
    message.success("Đã áp dụng voucher thành công");
  } catch (error: any) {
    const backendMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Voucher không hợp lệ";
    voucherError.value = backendMsg;
    message.error(backendMsg);
  }
};

// Xóa voucher
const handleRemoveVoucher = async () => {
  try {
    await cartStore.removeVoucher();
    message.success("Đã xóa voucher");
  } catch (error: any) {
    message.error(error.message || "Không thể xóa voucher");
  }
};

// Điều hướng
const goToProducts = () => {
  router.push({ name: "Products" });
};

const showCheckoutModal = ref(false);
const showSignupSuggestionModal = ref(false);
const checkoutForm = ref({
  buyerEmail: "",
  receiverName: "",
  receiverPhone: "",
  shippingAddress: "",
  shippingWard: "",
  shippingDistrict: "",
  shippingCity: "",
  note: "",
});
const submittingCheckout = ref(false);

const openCheckoutModal = () => {
  // Reset form với thông tin từ user (nếu có)
  checkoutForm.value = {
    buyerEmail: authStore.user?.email || "",
    receiverName: authStore.user?.fullName || "",
    receiverPhone: authStore.user?.phone || "",
    shippingAddress: "",
    shippingWard: "",
    shippingDistrict: "",
    shippingCity: "",
    note: "",
  };
  showCheckoutModal.value = true;
};

const goToCheckout = () => {
  // Nếu là khách vãng lai, gợi ý đăng ký nhận voucher trước
  if (!authStore.isAuthenticated) {
    showSignupSuggestionModal.value = true;
    return;
  }
  openCheckoutModal();
};

const handleSignupLater = () => {
  showSignupSuggestionModal.value = false;
  openCheckoutModal();
};

const handleGoRegister = () => {
  showSignupSuggestionModal.value = false;
  router.push({ name: "Register", query: { redirect: router.currentRoute.value.fullPath } });
};

const closeCheckoutModal = () => {
  if (submittingCheckout.value) return;
  showCheckoutModal.value = false;
};

const handleCheckout = async () => {
  if (submittingCheckout.value) return;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Chấp nhận số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx hoặc 84xxxxxxxxx
    const phoneRegex = /^(0|\+84|84)[1-9][0-9]{8,9}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  // Validate form
  if (!checkoutForm.value.receiverName.trim()) {
    message.warning("Vui lòng nhập tên người nhận");
    return;
  }
  if (!checkoutForm.value.receiverPhone.trim()) {
    message.warning("Vui lòng nhập số điện thoại");
    return;
  }
  if (!validatePhone(checkoutForm.value.receiverPhone)) {
    message.warning("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0 hoặc +84).");
    return;
  }
  if (!checkoutForm.value.shippingAddress.trim()) {
    message.warning("Vui lòng nhập địa chỉ giao hàng");
    return;
  }
  if (!checkoutForm.value.shippingCity.trim()) {
    message.warning("Vui lòng nhập thành phố/tỉnh");
    return;
  }
  // Guest cần email
  if (!authStore.isAuthenticated) {
    if (!checkoutForm.value.buyerEmail.trim()) {
      message.warning("Vui lòng nhập email");
      return;
    }
    if (!validateEmail(checkoutForm.value.buyerEmail)) {
      message.warning("Email không hợp lệ. Vui lòng nhập đúng định dạng email.");
      return;
    }
  }

  submittingCheckout.value = true;
  try {
    const checkoutData = {
      buyerEmail: authStore.isAuthenticated
        ? undefined
        : checkoutForm.value.buyerEmail.trim(),
      receiverName: checkoutForm.value.receiverName.trim(),
      receiverPhone: checkoutForm.value.receiverPhone.trim(),
      shippingAddress: checkoutForm.value.shippingAddress.trim(),
      shippingWard: checkoutForm.value.shippingWard.trim() || undefined,
      shippingDistrict: checkoutForm.value.shippingDistrict.trim() || undefined,
      shippingCity: checkoutForm.value.shippingCity.trim(),
      paymentMethod: "COD" as const,
      expectedTotal: checkoutPreview.value?.total,
      note: checkoutForm.value.note.trim() || undefined,
    };

    const result = await CheckoutService.confirmCheckout(
      checkoutData,
      cartStore.cartToken || undefined
    );

    message.success(
      `Đặt hàng thành công! Mã đơn hàng: ${result.orderCode}`
    );
    
    // Reset cart store và reload để đảm bảo giỏ hàng được làm mới
    cartStore.reset();
    await cartStore.loadCart();
    showCheckoutModal.value = false;
    
    // Redirect to order success page or home
    router.push({ name: "Home" });
  } catch (error: any) {
    console.error("Error during checkout:", error);
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Không thể đặt hàng. Vui lòng thử lại sau.";
    message.error(errorMsg);
  } finally {
    submittingCheckout.value = false;
  }
};
</script>

<style scoped>
.cart-page {
  min-height: 60vh;
}

.cart-item {
  transition: background-color 0.2s;
}

.cart-item:hover {
  background-color: #f9fafb;
}
</style>

