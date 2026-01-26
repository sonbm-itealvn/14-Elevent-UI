<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NTag,
  NDivider,
  NSpace,
  NImage,
  NSpin,
  useMessage,
  NCard,
} from 'naive-ui';
import { ArrowLeft, Package, MapPin, Phone, Mail, Calendar, CreditCard } from '@vicons/tabler';
import OrderService from '@/core/services/api/order.service';
import type { Order, OrderStatus } from '@/domain/models/order.model';

const route = useRoute();
const router = useRouter();
const message = useMessage();

const loading = ref(false);
const order = ref<Order | null>(null);

// Format functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'default',
    PAID: 'info',
    CONFIRMED: 'warning',
    SHIPPING: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };
  return colors[status] || 'default';
};

const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    PENDING: 'Chờ xử lý',
    PAID: 'Đã thanh toán',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return labels[status] || status;
};

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    COD: 'Thanh toán khi nhận hàng',
    BANKING: 'Chuyển khoản',
    VNPAY: 'VNPay',
    MOMO: 'MoMo',
  };
  return labels[method] || method;
};

const getPaymentStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Chờ thanh toán',
    SUCCESS: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
    CANCELLED: 'Đã hủy',
    EXPIRED: 'Hết hạn',
  };
  return labels[status] || status;
};

// Load order detail
const loadOrderDetail = async () => {
  const orderId = route.params.id;
  if (!orderId) {
    message.error('Không tìm thấy mã đơn hàng');
    router.push({ name: 'OrderHistory' });
    return;
  }

  try {
    loading.value = true;
    const orderData = await OrderService.getUserOrderById(Number(orderId));
    order.value = orderData;
  } catch (error: any) {
    console.error('Error loading order detail:', error);
    message.error('Lỗi khi tải chi tiết đơn hàng');
    router.push({ name: 'OrderHistory' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrderDetail();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f7]">
    <!-- Header -->
    <section class="bg-black text-white py-12">
      <div class="max-w-6xl mx-auto px-6 md:px-10 lg:px-14">
        <button
          @click="router.push({ name: 'OrderHistory' })"
          class="mb-6 flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
        >
          <ArrowLeft class="h-5 w-5" />
          <span>Quay lại lịch sử</span>
        </button>
        <h1 class="text-3xl md:text-4xl font-bold">Chi tiết đơn hàng</h1>
      </div>
    </section>

    <!-- Content -->
    <section class="max-w-6xl mx-auto px-6 md:px-10 lg:px-14 py-8">
      <n-spin :show="loading">
        <div v-if="order" class="space-y-6">
          <!-- Order Info Card -->
          <n-card class="shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 class="text-2xl font-bold mb-2">
                  Đơn hàng {{ order.orderCode || `#${order.id}` }}
                </h2>
                <p class="text-neutral-500 text-sm">
                  Đặt ngày: {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div class="flex flex-wrap gap-3">
                <n-tag :type="getStatusColor(order.status)" size="large">
                  {{ getStatusLabel(order.status) }}
                </n-tag>
                <n-tag
                  :type="order.paymentStatus === 'SUCCESS' ? 'success' : 'warning'"
                  size="large"
                >
                  {{ getPaymentStatusLabel(order.paymentStatus) }}
                </n-tag>
              </div>
            </div>

            <n-divider />

            <!-- Order Items -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package class="h-5 w-5" />
                Sản phẩm
              </h3>
              <div class="space-y-4">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="flex gap-4 p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div class="w-24 h-24 flex-shrink-0">
                    <n-image
                      v-if="item.imageUrl"
                      :src="item.imageUrl"
                      :alt="item.productName"
                      class="w-full h-full object-cover rounded"
                      preview-disabled
                    />
                    <div
                      v-else
                      class="w-full h-full bg-neutral-100 rounded flex items-center justify-center"
                    >
                      <Package class="h-8 w-8 text-neutral-400" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-lg mb-1">{{ item.productName }}</h4>
                    <p class="text-sm text-neutral-500 mb-2">SKU: {{ item.sku }}</p>
                    <div v-if="item.attributes" class="text-sm text-neutral-600 mb-2">
                      <span
                        v-for="(value, key) in item.attributes"
                        :key="key"
                        class="mr-3"
                      >
                        {{ key }}: {{ value }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-neutral-600">
                        Số lượng: <strong>{{ item.quantity }}</strong>
                      </span>
                      <span class="text-lg font-semibold text-red-600">
                        {{ formatPrice(item.lineTotal) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <n-divider />

            <!-- Shipping Info -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin class="h-5 w-5" />
                Thông tin giao hàng
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-neutral-500 mb-1">Người nhận</p>
                  <p class="font-semibold">{{ order.receiverName }}</p>
                </div>
                <div>
                  <p class="text-sm text-neutral-500 mb-1 flex items-center gap-1">
                    <Phone class="h-4 w-4" />
                    Số điện thoại
                  </p>
                  <p class="font-semibold">{{ order.receiverPhone }}</p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-sm text-neutral-500 mb-1">Địa chỉ</p>
                  <p class="font-semibold">
                    {{ order.shippingAddress }}{{ order.shippingWard ? `, ${order.shippingWard}` : '' }}{{ order.shippingDistrict ? `, ${order.shippingDistrict}` : '' }}, {{ order.shippingCity }}
                  </p>
                </div>
                <div v-if="order.trackingUrl" class="md:col-span-2">
                  <p class="text-sm text-neutral-500 mb-1">Mã vận đơn</p>
                  <a
                    :href="order.trackingUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline font-semibold"
                  >
                    {{ order.trackingUrl }}
                  </a>
                </div>
              </div>
            </div>

            <n-divider />

            <!-- Payment Info -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard class="h-5 w-5" />
                Thông tin thanh toán
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-neutral-500 mb-1">Phương thức</p>
                  <p class="font-semibold">{{ getPaymentMethodLabel(order.paymentMethod) }}</p>
                </div>
                <div>
                  <p class="text-sm text-neutral-500 mb-1">Trạng thái</p>
                  <n-tag
                    :type="order.paymentStatus === 'SUCCESS' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ getPaymentStatusLabel(order.paymentStatus) }}
                  </n-tag>
                </div>
                <div v-if="order.paymentTxnRef">
                  <p class="text-sm text-neutral-500 mb-1">Mã giao dịch</p>
                  <p class="font-semibold">{{ order.paymentTxnRef }}</p>
                </div>
                <div v-if="order.paymentPaidAt">
                  <p class="text-sm text-neutral-500 mb-1 flex items-center gap-1">
                    <Calendar class="h-4 w-4" />
                    Ngày thanh toán
                  </p>
                  <p class="font-semibold">{{ formatDate(order.paymentPaidAt) }}</p>
                </div>
              </div>
            </div>

            <n-divider />

            <!-- Order Summary -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-neutral-600">Tạm tính:</span>
                  <span class="font-semibold">{{ formatPrice(order.subtotal || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-600">Phí vận chuyển:</span>
                  <span class="font-semibold">{{ formatPrice(order.shippingFee || 0) }}</span>
                </div>
                <div v-if="order.voucherDiscount && order.voucherDiscount > 0" class="flex justify-between">
                  <span class="text-neutral-600">Giảm giá:</span>
                  <span class="font-semibold text-green-600">
                    -{{ formatPrice(order.voucherDiscount) }}
                  </span>
                </div>
                <n-divider />
                <div class="flex justify-between text-lg">
                  <span class="font-bold">Tổng cộng:</span>
                  <span class="font-bold text-red-600 text-xl">
                    {{ formatPrice(order.totalAmount) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Note -->
            <div v-if="order.note" class="mt-6 p-4 bg-neutral-50 rounded-lg">
              <p class="text-sm text-neutral-500 mb-1">Ghi chú:</p>
              <p class="text-neutral-700">{{ order.note }}</p>
            </div>
          </n-card>
        </div>
      </n-spin>
    </section>
  </div>
</template>

<style scoped>
:deep(.n-card) {
  border-radius: 8px;
}
</style>

