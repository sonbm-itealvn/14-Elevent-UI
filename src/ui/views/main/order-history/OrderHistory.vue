<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  NDataTable,
  NButton,
  NSelect,
  NTag,
  NPagination,
  useMessage,
  type SelectOption,
  NEmpty,
  NSpin,
} from 'naive-ui';
import { ArrowLeft, Eye } from '@vicons/tabler';
import OrderService from '@/core/services/api/order.service';
import type { Order, OrderStatus, OrderPageResponse } from '@/domain/models/order.model';

const router = useRouter();
const message = useMessage();

const loading = ref(false);
const orders = ref<Order[]>([]);
const statusFilter = ref<OrderStatus | null>(null);
const pagination = ref({
  page: 0,
  size: 10,
  total: 0,
  totalPages: 0,
});

// Computed property for 1-based page (UI) from 0-based page (API)
const currentPage = computed({
  get: () => pagination.value.page + 1,
  set: (value: number) => {
    pagination.value.page = value - 1;
  },
});

// Status options
const statusOptions: SelectOption[] = [
  { label: 'Tất cả', value: undefined },
  { label: 'Chờ xử lý', value: 'PENDING' },
  { label: 'Đã thanh toán', value: 'PAID' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đang giao hàng', value: 'SHIPPING' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

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

// Load orders
const loadOrders = async () => {
  try {
    loading.value = true;
    const params: any = {
      page: pagination.value.page,
      size: pagination.value.size,
    };
    
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    
    const response: OrderPageResponse = await OrderService.getUserOrders(params);
    orders.value = response.content || [];
    pagination.value.total = response.totalElements || 0;
    pagination.value.totalPages = response.totalPages || 0;
  } catch (error: any) {
    console.error('Error loading orders:', error);
    message.error('Lỗi khi tải lịch sử đơn hàng');
  } finally {
    loading.value = false;
  }
};

// Handle filter change
const handleStatusChange = () => {
  pagination.value.page = 0;
  loadOrders();
};

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadOrders();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Handle view detail
const handleViewDetail = (order: Order) => {
  router.push({ name: 'OrderDetail', params: { id: order.id } });
};

// Table columns
const columns = [
  {
    title: 'Mã đơn hàng',
    key: 'orderCode',
    width: 150,
    render: (row: Order) => {
      return row.orderCode || `#${row.id}`;
    },
  },
  {
    title: 'Ngày đặt',
    key: 'createdAt',
    width: 180,
    render: (row: Order) => formatDate(row.createdAt),
  },
  {
    title: 'Trạng thái',
    key: 'status',
    width: 140,
    render: (row: Order) => {
      return h(NTag, {
        type: getStatusColor(row.status) as any,
        size: 'small',
      }, { default: () => getStatusLabel(row.status) });
    },
  },
  {
    title: 'Phương thức thanh toán',
    key: 'paymentMethod',
    width: 180,
    render: (row: Order) => getPaymentMethodLabel(row.paymentMethod),
  },
  {
    title: 'Tổng tiền',
    key: 'totalAmount',
    width: 150,
    render: (row: Order) => {
      return h('span', { class: 'font-semibold text-red-600' }, formatPrice(row.totalAmount));
    },
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 120,
    render: (row: Order) => {
      return h(NButton, {
        size: 'small',
        type: 'primary',
        quaternary: true,
        onClick: () => handleViewDetail(row),
      }, {
        icon: () => h('i', { class: 'h-4 w-4' }, [h(Eye)]),
        default: () => 'Chi tiết',
      });
    },
  },
];

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f7]">
    <!-- Header -->
    <section class="bg-black text-white py-8 sm:py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14">
        <button
          @click="router.push({ name: 'Home' })"
          class="mb-6 flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
        >
          <ArrowLeft class="h-5 w-5" />
          <span>Quay lại</span>
        </button>
        <h1 class="text-3xl md:text-4xl font-bold">Lịch sử mua hàng</h1>
        <p class="text-neutral-300 mt-2">Xem lại các đơn hàng đã đặt</p>
      </div>
    </section>

    <!-- Content -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8">
      <!-- Filter Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <label class="block text-sm font-semibold text-neutral-700 mb-2">
          Lọc theo trạng thái
        </label>
        <n-select
          v-model:value="statusFilter"
          :options="statusOptions"
          placeholder="Chọn trạng thái"
          clearable
          @update:value="handleStatusChange"
          class="order-status-select w-full min-w-0"
        />
      </div>

      <!-- Mobile: Order cards -->
      <div class="block md:hidden space-y-4">
        <n-spin :show="loading">
          <template v-if="!loading && orders.length === 0">
            <div class="bg-white rounded-lg shadow-sm py-16">
              <n-empty description="Chưa có đơn hàng nào">
                <template #extra>
                  <n-button type="primary" @click="router.push({ name: 'Products' })">
                    Mua sắm ngay
                  </n-button>
                </template>
              </n-empty>
            </div>
          </template>
          <template v-else>
            <div
              v-for="order in orders"
              :key="order.id"
              class="order-card bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 active:bg-neutral-50"
              @click="handleViewDetail(order)"
            >
              <div class="p-4 flex flex-col gap-3">
                <div class="flex justify-between items-start gap-2">
                  <span class="font-semibold text-neutral-900 truncate">
                    {{ order.orderCode || `#${order.id}` }}
                  </span>
                  <n-tag :type="getStatusColor(order.status) as any" size="small" class="flex-shrink-0">
                    {{ getStatusLabel(order.status) }}
                  </n-tag>
                </div>
                <p class="text-sm text-neutral-500">
                  {{ formatDate(order.createdAt) }}
                </p>
                <div class="flex justify-between items-center pt-2 border-t border-neutral-100">
                  <span class="text-sm text-neutral-600">Tổng tiền</span>
                  <span class="font-bold text-red-600">{{ formatPrice(order.totalAmount) }}</span>
                </div>
                <n-button
                  type="primary"
                  size="small"
                  block
                  quaternary
                  @click.stop="handleViewDetail(order)"
                >
                  <template #icon>
                    <Eye class="h-4 w-4" />
                  </template>
                  Xem chi tiết
                </n-button>
              </div>
            </div>
          </template>
        </n-spin>

        <div v-if="!loading && orders.length > 0" class="flex justify-center py-4">
          <n-pagination
            v-model:page="currentPage"
            :page-count="pagination.totalPages"
            :page-size="pagination.size"
            :item-count="pagination.total"
            show-size-picker
            :page-sizes="[10, 20, 50]"
            @update:page="handlePageChange"
            @update:page-size="(size) => { pagination.size = size; pagination.page = 0; loadOrders(); }"
            class="order-pagination-mobile"
          />
        </div>
      </div>

      <!-- Desktop: Orders Table -->
      <div class="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
        <n-spin :show="loading">
          <n-data-table
            :columns="columns"
            :data="orders"
            :loading="loading"
            :bordered="false"
            :single-line="false"
            class="order-history-table"
          />

          <div v-if="!loading && orders.length === 0" class="py-16">
            <n-empty description="Chưa có đơn hàng nào">
              <template #extra>
                <n-button type="primary" @click="router.push({ name: 'Products' })">
                  Mua sắm ngay
                </n-button>
              </template>
            </n-empty>
          </div>
        </n-spin>

        <div v-if="!loading && orders.length > 0" class="p-6 border-t border-neutral-200 flex justify-center">
          <n-pagination
            v-model:page="currentPage"
            :page-count="pagination.totalPages"
            :page-size="pagination.size"
            :item-count="pagination.total"
            show-size-picker
            :page-sizes="[10, 20, 50]"
            @update:page="handlePageChange"
            @update:page-size="(size) => { pagination.size = size; pagination.page = 0; loadOrders(); }"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Desktop table */
:deep(.order-history-table .n-data-table-th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
}

:deep(.order-history-table .n-data-table-td) {
  padding: 16px;
}

:deep(.order-history-table .n-data-table-tr:hover) {
  background-color: #f9fafb;
}

/* Mobile: filter select full width, không cắt chữ */
.order-status-select {
  min-width: 0;
}
:deep(.order-status-select .n-base-selection-label) {
  white-space: normal;
  word-break: break-word;
}

/* Mobile: card có thể bấm */
.order-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.order-card:active {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Mobile: pagination gọn */
@media (max-width: 768px) {
  :deep(.order-pagination-mobile .n-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  :deep(.order-pagination-mobile .n-pagination-item),
  :deep(.order-pagination-mobile .n-pagination-prefix),
  :deep(.order-pagination-mobile .n-pagination-suffix) {
    margin: 0;
  }
}
</style>

