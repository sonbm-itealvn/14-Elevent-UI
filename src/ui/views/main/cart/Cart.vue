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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { NSpin, NEmpty, NButton, NInput, useMessage } from "naive-ui";
import useCartStore from "@/ui/stores/cart.store";

const router = useRouter();
const message = useMessage();
const cartStore = useCartStore();

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

const goToCheckout = () => {
  // TODO: Navigate to checkout page when implemented
  message.info("Chức năng thanh toán đang được phát triển");
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

