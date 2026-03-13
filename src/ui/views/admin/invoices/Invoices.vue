<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NDataTable,
  useMessage,
  NTag,
  NPagination,
  NSpin,
} from 'naive-ui';
import OrderService from '@/core/services/api/order.service';
import type { Order, OrderStatus } from '@/domain/models/order.model';

const message = useMessage();

const loading = ref(false);
const orders = ref<Order[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    PENDING: 'default',
    PAID: 'info',
    CONFIRMED: 'info',
    SHIPPING: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PAID: 'Đã thanh toán',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };
  return statusMap[status] || status;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Mã đơn hàng',
    key: 'orderCode',
    width: 150,
    render: (row: Order) => row.orderCode || `#${row.id}`,
  },
  {
    title: 'Người nhận',
    key: 'receiverName',
    width: 150,
  },
  {
    title: 'Email',
    key: 'buyerEmail',
    width: 200,
    render: (row: Order) => row.buyerEmail || '-',
  },
  {
    title: 'Tổng tiền',
    key: 'totalAmount',
    width: 150,
    render: (row: Order) => h('span', { class: 'font-semibold text-red-600' }, formatCurrency(row.totalAmount)),
  },
  {
    title: 'Trạng thái',
    key: 'status',
    width: 120,
    render: (row: Order) => {
      return h(NTag, { type: getStatusTagType(row.status), size: 'small' }, { default: () => getStatusLabel(row.status) });
    },
  },
  {
    title: 'Ngày tạo',
    key: 'createdAt',
    width: 180,
    render: (row: Order) => row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-',
  },
];

const loadOrders = async () => {
  try {
    loading.value = true;
    // Chỉ lấy đơn hàng có status COMPLETED
    const response = await OrderService.getOrders({
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
      status: 'COMPLETED' as OrderStatus,
    });
    orders.value = response?.orders || [];
    pagination.value.total = response?.totalElements || 0;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách hóa đơn');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="min-w-0">
    <div class="mb-4">
      <h1 class="text-xl sm:text-2xl font-bold">Quản lý hóa đơn</h1>
    </div>

    <!-- Mobile: danh sách dạng thẻ -->
    <div class="block md:hidden space-y-3">
      <div v-if="loading" class="flex justify-center py-8">
        <n-spin />
      </div>
      <template v-else>
        <div
          v-for="row in orders"
          :key="row.id"
          class="invoice-card-mobile bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div class="flex justify-between items-start gap-2 mb-2">
            <span class="font-semibold text-gray-800">{{ row.orderCode || `#${row.id}` }}</span>
            <NTag :type="getStatusTagType(row.status)" size="small">{{ getStatusLabel(row.status) }}</NTag>
          </div>
          <p class="text-sm text-gray-600 mb-1">{{ row.receiverName }}</p>
          <p class="text-xs text-gray-500 truncate mb-1" :title="row.buyerEmail">{{ row.buyerEmail || '—' }}</p>
          <div class="flex justify-between items-center pt-2 border-t border-gray-100">
            <span class="font-semibold text-red-600 text-sm">{{ formatCurrency(row.totalAmount) }}</span>
            <span class="text-xs text-gray-500">{{ row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '—' }}</span>
          </div>
        </div>
        <p v-if="!loading && orders.length === 0" class="text-center text-gray-500 py-8">Chưa có hóa đơn</p>
      </template>

      <div v-if="!loading && pagination.total > 0" class="flex justify-center pt-4 flex-wrap">
        <NPagination
          v-model:page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.total"
          :page-sizes="pagination.pageSizes"
          show-size-picker
          @update:page="(page) => { pagination.page = page; loadOrders(); }"
          @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadOrders(); }"
        />
      </div>
    </div>

    <!-- Desktop: bảng -->
    <div class="hidden md:block overflow-x-auto">
      <NDataTable
        :columns="columns"
        :data="orders"
        :loading="loading"
        :pagination="pagination"
        @update:page="(page) => { pagination.page = page; loadOrders(); }"
        @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadOrders(); }"
        striped
        bordered
        class="invoices-data-table"
      />
    </div>
  </div>
</template>

<style scoped>
.invoices-data-table {
  min-width: 0;
}
</style>

