<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { NGrid, NGridItem, NStatistic, NCard, NDataTable, NTag, useMessage, NSpin } from 'naive-ui';
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
  <div class="p-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>
    
    <NSpin :show="loading">
      <div v-if="stats">
        <NGrid :cols="4" :x-gap="12" :y-gap="12" class="mb-6">
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Tổng doanh thu" 
                :value="formatCurrency(stats.overall.totalRevenue)" 
              />
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Tổng đơn hàng" 
                :value="stats.overall.totalOrders" 
              />
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Đơn hàng hoàn thành" 
                :value="stats.overall.completedOrders" 
              />
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Giá trị đơn hàng trung bình" 
                :value="formatCurrency(stats.overall.averageOrderValue)" 
              />
            </NCard>
          </NGridItem>
        </NGrid>

        <NGrid :cols="4" :x-gap="12" :y-gap="12" class="mb-6">
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Doanh thu hôm nay" 
                :value="formatCurrency(stats.revenue.todayRevenue)" 
              />
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Doanh thu tuần này" 
                :value="formatCurrency(stats.revenue.thisWeekRevenue)" 
              />
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Doanh thu tháng này" 
                :value="formatCurrency(stats.revenue.thisMonthRevenue)" 
              />
            </NCard>
          </NGridItem>
          <NGridItem>
            <NCard>
              <NStatistic 
                label="Đơn hàng hôm nay" 
                :value="stats.orderCounts.todayOrders" 
              />
            </NCard>
          </NGridItem>
        </NGrid>

        <NCard title="Đơn hàng gần đây" class="mt-6">
          <NDataTable
            :columns="[
              { 
                title: 'ID đơn hàng', 
                key: 'orderId',
                width: 120,
              },
              { 
                title: 'Email khách hàng', 
                key: 'buyerEmail',
                width: 250,
              },
              { 
                title: 'Tổng tiền', 
                key: 'totalAmount', 
                width: 150,
                align: 'right',
                render: (row) => h('span', { class: 'font-semibold text-red-600' }, formatCurrency(row.totalAmount))
              },
              { 
                title: 'Trạng thái', 
                key: 'status',
                width: 120,
                render: (row) => {
                  return h(NTag, { type: getStatusTagType(row.status), size: 'small' }, { default: () => getStatusLabel(row.status) });
                }
              },
              { 
                title: 'Ngày tạo', 
                key: 'createdAt',
                width: 180,
                render: (row) => formatDate(row.createdAt)
              },
            ]"
            :data="stats.recentOrders"
            :loading="loading"
            :bordered="true"
            striped
          />
        </NCard>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
</style>
