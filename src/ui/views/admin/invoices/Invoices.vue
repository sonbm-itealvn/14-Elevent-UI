<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NDataTable,
  useMessage,
  NTag,
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
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý hóa đơn</h1>
    </div>

    <NDataTable
      :columns="columns"
      :data="orders"
      :loading="loading"
      :pagination="pagination"
      @update:page="(page) => { pagination.page = page; loadOrders(); }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadOrders(); }"
      striped
      bordered
    />
  </div>
</template>

<style scoped>
</style>

