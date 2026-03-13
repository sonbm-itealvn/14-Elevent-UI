<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { NStatistic, NCard, NDataTable, NTag, useMessage, NSpin } from 'naive-ui';
import OrderService from '@/core/services/api/order.service';
import type { DashboardStatsResponse } from '@/domain/models/order.model';

const message = useMessage();
const loading = ref(false);
const stats = ref<DashboardStatsResponse | null>(null);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

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

const loadStats = async () => {
  try {
    loading.value = true;
    const response = await OrderService.getDashboardStats();
    stats.value = response;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải thống kê');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="p-3 sm:p-6">
    <h1 class="text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-gray-800">
      Dashboard
    </h1>

    <NSpin :show="loading">
      <div v-if="stats">
        <!-- Thẻ thống kê: mobile 2 cột, ít giãn cách -->
        <div class="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4 mb-4 sm:mb-6">
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Tổng doanh thu" :value="formatCurrency(stats.overall.totalRevenue)" />
          </NCard>
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Tổng đơn hàng" :value="stats.overall.totalOrders" />
          </NCard>
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Đơn hoàn thành" :value="stats.overall.completedOrders" />
          </NCard>
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Giá trị TB đơn" :value="formatCurrency(stats.overall.averageOrderValue)" />
          </NCard>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4 mb-4 sm:mb-6">
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Doanh thu hôm nay" :value="formatCurrency(stats.revenue.todayRevenue)" />
          </NCard>
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Doanh thu tuần" :value="formatCurrency(stats.revenue.thisWeekRevenue)" />
          </NCard>
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Doanh thu tháng" :value="formatCurrency(stats.revenue.thisMonthRevenue)" />
          </NCard>
          <NCard class="dashboard-stat-card" content-class="dashboard-stat-content">
            <NStatistic label="Đơn hôm nay" :value="stats.orderCounts.todayOrders" />
          </NCard>
        </div>

        <!-- Đơn hàng gần đây: mobile dạng thẻ, desktop bảng -->
        <NCard title="Đơn hàng gần đây" class="mt-4 sm:mt-6">
          <!-- Mobile: list cards -->
          <div class="block md:hidden space-y-3">
            <div
              v-for="order in (stats.recentOrders || [])"
              :key="order.orderId"
              class="p-3 border border-gray-200 rounded-lg text-sm"
            >
              <div class="flex justify-between items-start gap-2 mb-1">
                <span class="font-semibold text-gray-800">#{{ order.orderId }}</span>
                <NTag :type="getStatusTagType(order.status)" size="small">{{ getStatusLabel(order.status) }}</NTag>
              </div>
              <p class="text-gray-600 truncate mb-1">{{ order.buyerEmail }}</p>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">{{ formatDate(order.createdAt) }}</span>
                <span class="font-semibold text-red-600">{{ formatCurrency(order.totalAmount) }}</span>
              </div>
            </div>
            <p v-if="!stats.recentOrders?.length && !loading" class="text-gray-500 text-center py-4">Chưa có đơn hàng</p>
          </div>
          <!-- Desktop: table -->
          <div class="hidden md:block">
            <NDataTable
              :columns="[
                { title: 'ID đơn hàng', key: 'orderId', width: 120 },
                { title: 'Email khách hàng', key: 'buyerEmail', width: 250 },
                {
                  title: 'Tổng tiền',
                  key: 'totalAmount',
                  width: 150,
                  align: 'right',
                  render: (row) => h('span', { class: 'font-semibold text-red-600' }, formatCurrency(row.totalAmount)),
                },
                {
                  title: 'Trạng thái',
                  key: 'status',
                  width: 120,
                  render: (row) => h(NTag, { type: getStatusTagType(row.status), size: 'small' }, { default: () => getStatusLabel(row.status) }),
                },
                { title: 'Ngày tạo', key: 'createdAt', width: 180, render: (row) => formatDate(row.createdAt) },
              ]"
              :data="stats.recentOrders || []"
              :loading="loading"
              :bordered="true"
              striped
            />
          </div>
        </NCard>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.dashboard-stat-card {
  min-width: 0;
}
:deep(.dashboard-stat-content) {
  padding: 12px 16px;
}
@media (max-width: 640px) {
  :deep(.dashboard-stat-content) {
    padding: 10px 12px;
  }
  :deep(.dashboard-stat-card .n-statistic__label) {
    font-size: 0.75rem;
  }
  :deep(.dashboard-stat-card .n-statistic-value) {
    font-size: 1rem;
  }
}
</style>
