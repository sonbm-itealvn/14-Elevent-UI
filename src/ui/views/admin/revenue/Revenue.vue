<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NCard,
  NGrid,
  NGridItem,
  NStatistic,
  NDataTable,
  NTag,
  useMessage,
  NSpin,
  NButton,
  NIcon,
  NDatePicker,
} from 'naive-ui';
import { Download } from '@vicons/tabler';
import OrderService from '@/core/services/api/order.service';
import type { DashboardStatsResponse } from '@/domain/models/order.model';

const message = useMessage();
const loading = ref(false);
const exporting = ref(false);
const stats = ref<DashboardStatsResponse | null>(null);
const startDate = ref<number | null>(null);
const endDate = ref<number | null>(null);

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

const getMonthName = (month: number) => {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return months[month - 1] || `Tháng ${month}`;
};

const loadStats = async () => {
  try {
    loading.value = true;
    const response = await OrderService.getDashboardStats();
    stats.value = response;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải báo cáo doanh thu');
  } finally {
    loading.value = false;
  }
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const handleExportRevenue = async () => {
  try {
    exporting.value = true;
    const params: { startDate?: string; endDate?: string } = {};
    
    if (startDate.value) {
      params.startDate = new Date(startDate.value).toISOString().split('T')[0];
    }
    if (endDate.value) {
      params.endDate = new Date(endDate.value).toISOString().split('T')[0];
    }

    const blob = await OrderService.exportRevenue(params);
    const filename = `doanh-thu-${params.startDate || 'all'}-${params.endDate || 'all'}.xlsx`;
    downloadFile(blob, filename);
    message.success('Xuất file doanh thu thành công');
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi xuất file doanh thu');
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Báo cáo doanh thu</h1>
        <p class="text-gray-600 mt-2">Thống kê và phân tích doanh thu hệ thống</p>
      </div>
      <div class="flex gap-2 items-end">
        <div class="flex gap-2">
          <NDatePicker
            v-model:value="startDate"
            type="date"
            placeholder="Từ ngày"
            clearable
            style="width: 150px"
          />
          <NDatePicker
            v-model:value="endDate"
            type="date"
            placeholder="Đến ngày"
            clearable
            style="width: 150px"
          />
        </div>
        <NButton type="primary" :loading="exporting" @click="handleExportRevenue">
          <template #icon>
            <NIcon><Download /></NIcon>
          </template>
          Xuất file doanh thu
        </NButton>
      </div>
    </div>

    <NSpin :show="loading">
      <div v-if="stats" class="space-y-6">
        <!-- Tổng quan -->
        <NCard title="Tổng quan" class="mb-6">
          <NGrid :cols="3" :x-gap="12" :y-gap="12">
            <NGridItem>
              <NStatistic
                label="Tổng doanh thu"
                :value="formatCurrency(stats.overall.totalRevenue)"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Tổng đơn hàng"
                :value="stats.overall.totalOrders"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Giá trị đơn hàng trung bình"
                :value="formatCurrency(stats.overall.averageOrderValue)"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Đơn hàng đang chờ"
                :value="stats.overall.pendingOrders"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Đơn hàng hoàn thành"
                :value="stats.overall.completedOrders"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Đơn hàng đã hủy"
                :value="stats.overall.cancelledOrders"
              />
            </NGridItem>
          </NGrid>
        </NCard>

        <!-- Doanh thu theo thời gian -->
        <NCard title="Doanh thu theo thời gian" class="mb-6">
          <NGrid :cols="4" :x-gap="12" :y-gap="12">
            <NGridItem>
              <NStatistic
                label="Doanh thu hôm nay"
                :value="formatCurrency(stats.revenue.todayRevenue)"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Doanh thu tuần này"
                :value="formatCurrency(stats.revenue.thisWeekRevenue)"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Doanh thu tháng này"
                :value="formatCurrency(stats.revenue.thisMonthRevenue)"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Doanh thu năm này"
                :value="formatCurrency(stats.revenue.thisYearRevenue)"
              />
            </NGridItem>
          </NGrid>
        </NCard>

        <!-- Số lượng đơn hàng theo thời gian -->
        <NCard title="Số lượng đơn hàng theo thời gian" class="mb-6">
          <NGrid :cols="4" :x-gap="12" :y-gap="12">
            <NGridItem>
              <NStatistic
                label="Đơn hàng hôm nay"
                :value="stats.orderCounts.todayOrders"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Đơn hàng tuần này"
                :value="stats.orderCounts.thisWeekOrders"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Đơn hàng tháng này"
                :value="stats.orderCounts.thisMonthOrders"
              />
            </NGridItem>
            <NGridItem>
              <NStatistic
                label="Đơn hàng năm này"
                :value="stats.orderCounts.thisYearOrders"
              />
            </NGridItem>
          </NGrid>
        </NCard>

        <!-- Doanh thu 7 ngày gần đây -->
        <NCard title="Doanh thu 7 ngày gần đây" class="mb-6">
          <NDataTable
            :columns="[
              {
                title: 'Ngày',
                key: 'date',
                width: 150,
                render: (row) => formatDate(row.date),
              },
              {
                title: 'Doanh thu',
                key: 'revenue',
                width: 200,
                align: 'right',
                render: (row) => h('span', { class: 'font-semibold text-green-600' }, formatCurrency(row.revenue)),
              },
              {
                title: 'Số đơn hàng',
                key: 'orderCount',
                width: 150,
                align: 'center',
              },
            ]"
            :data="stats.revenue.dailyRevenueLast7Days"
            :bordered="true"
            striped
          />
        </NCard>

        <!-- Doanh thu 12 tháng gần đây -->
        <NCard title="Doanh thu 12 tháng gần đây" class="mb-6">
          <NDataTable
            :columns="[
              {
                title: 'Tháng',
                key: 'month',
                width: 150,
                render: (row) => `${getMonthName(row.month)}/${row.year}`,
              },
              {
                title: 'Doanh thu',
                key: 'revenue',
                width: 200,
                align: 'right',
                render: (row) => h('span', { class: 'font-semibold text-green-600' }, formatCurrency(row.revenue)),
              },
              {
                title: 'Số đơn hàng',
                key: 'orderCount',
                width: 150,
                align: 'center',
              },
            ]"
            :data="stats.revenue.monthlyRevenueLast12Months"
            :bordered="true"
            striped
          />
        </NCard>

        <!-- Đơn hàng gần đây -->
        <NCard title="Đơn hàng gần đây" class="mb-6">
          <NDataTable
            :columns="[
              {
                title: 'ID đơn hàng',
                key: 'orderId',
                width: 100,
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
                render: (row) => h('span', { class: 'font-semibold text-red-600' }, formatCurrency(row.totalAmount)),
              },
              {
                title: 'Trạng thái',
                key: 'status',
                width: 120,
                render: (row) => {
                  return h(NTag, { type: getStatusTagType(row.status), size: 'small' }, { default: () => getStatusLabel(row.status) });
                },
              },
              {
                title: 'Ngày tạo',
                key: 'createdAt',
                width: 180,
                render: (row) => formatDate(row.createdAt),
              },
            ]"
            :data="stats.recentOrders"
            :bordered="true"
            striped
          />
        </NCard>

        <!-- Sản phẩm bán chạy -->
        <NCard title="Sản phẩm bán chạy" class="mb-6">
          <NDataTable
            :columns="[
              {
                title: 'ID sản phẩm',
                key: 'productId',
                width: 120,
              },
              {
                title: 'Tên sản phẩm',
                key: 'productName',
                ellipsis: { tooltip: true },
              },
              {
                title: 'Số lượng đã bán',
                key: 'totalSold',
                width: 150,
                align: 'center',
              },
              {
                title: 'Doanh thu',
                key: 'totalRevenue',
                width: 200,
                align: 'right',
                render: (row) => h('span', { class: 'font-semibold text-green-600' }, formatCurrency(row.totalRevenue)),
              },
            ]"
            :data="stats.topProducts"
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

