<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue';
import {
  NCard,
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
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

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

// Chart options computed
const dailyRevenueChartOption = computed(() => {
  if (!stats.value?.revenue?.dailyRevenueLast7Days) return {};
  
  const data = stats.value.revenue.dailyRevenueLast7Days;
  const dates = data.map(item => formatDate(item.date));
  const revenues = data.map(item => item.revenue);
  const orders = data.map(item => item.orderCount);
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((param: any) => {
          const value = param.seriesName === 'Doanh thu' 
            ? formatCurrency(param.value) 
            : `${param.value} đơn`;
          result += `${param.marker} ${param.seriesName}: ${value}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Doanh thu', 'Số đơn'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { rotate: 30 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Doanh thu (VND)',
        position: 'left',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value.toString();
          }
        }
      },
      {
        type: 'value',
        name: 'Số đơn',
        position: 'right',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Doanh thu',
        type: 'bar',
        data: revenues,
        itemStyle: { color: '#b3000f' },
        yAxisIndex: 0
      },
      {
        name: 'Số đơn',
        type: 'line',
        data: orders,
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        yAxisIndex: 1
      }
    ]
  };
});

const monthlyRevenueChartOption = computed(() => {
  if (!stats.value?.revenue?.monthlyRevenueLast12Months) return {};
  
  const data = stats.value.revenue.monthlyRevenueLast12Months;
  const months = data.map(item => `${getMonthName(item.month)}/${item.year}`);
  const revenues = data.map(item => item.revenue);
  const orders = data.map(item => item.orderCount);
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        let result = `<strong>${params[0].axisValue}</strong><br/>`;
        params.forEach((param: any) => {
          const value = param.seriesName === 'Doanh thu' 
            ? formatCurrency(param.value) 
            : `${param.value} đơn`;
          result += `${param.marker} ${param.seriesName}: ${value}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Doanh thu', 'Số đơn'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { rotate: 45 }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Doanh thu (VND)',
        position: 'left',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value.toString();
          }
        }
      },
      {
        type: 'value',
        name: 'Số đơn',
        position: 'right',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Doanh thu',
        type: 'bar',
        data: revenues,
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#ef4444' },
              { offset: 1, color: '#b3000f' }
            ]
          }
        },
        yAxisIndex: 0
      },
      {
        name: 'Số đơn',
        type: 'line',
        data: orders,
        smooth: true,
        itemStyle: { color: '#10b981' },
        areaStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0)' }
            ]
          }
        },
        yAxisIndex: 1
      }
    ]
  };
});

const orderStatusChartOption = computed(() => {
  if (!stats.value?.overall) return {};
  
  const overall = stats.value.overall;
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: 'Trạng thái đơn hàng',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: { show: false },
        data: [
          { value: overall.pendingOrders, name: 'Chờ xử lý', itemStyle: { color: '#6b7280' } },
          { value: overall.completedOrders, name: 'Hoàn thành', itemStyle: { color: '#10b981' } },
          { value: overall.cancelledOrders, name: 'Đã hủy', itemStyle: { color: '#ef4444' } },
        ].filter(item => item.value > 0)
      }
    ]
  };
});

const topProductsChartOption = computed(() => {
  if (!stats.value?.topProducts) return {};
  
  const data = stats.value.topProducts.slice(0, 5);
  const names = data.map(item => item.productName.length > 20 ? item.productName.slice(0, 20) + '...' : item.productName);
  const revenues = data.map(item => item.totalRevenue);
  const sold = data.map(item => item.totalSold);
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const idx = params[0].dataIndex;
        const fullName = stats.value?.topProducts[idx]?.productName || '';
        let result = `<strong>${fullName}</strong><br/>`;
        params.forEach((param: any) => {
          const value = param.seriesName === 'Doanh thu' 
            ? formatCurrency(param.value) 
            : `${param.value} sản phẩm`;
          result += `${param.marker} ${param.seriesName}: ${value}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['Doanh thu', 'Số lượng bán'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { 
        rotate: 20,
        interval: 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Doanh thu',
        position: 'left',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
            return value.toString();
          }
        }
      },
      {
        type: 'value',
        name: 'Số lượng',
        position: 'right',
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Doanh thu',
        type: 'bar',
        data: revenues,
        itemStyle: { color: '#f59e0b' },
        yAxisIndex: 0
      },
      {
        name: 'Số lượng bán',
        type: 'bar',
        data: sold,
        itemStyle: { color: '#8b5cf6' },
        yAxisIndex: 1
      }
    ]
  };
});

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
  <div class="p-3 sm:p-6 min-w-0">
    <!-- Header: stack trên mobile -->
    <div class="mb-4 sm:mb-6 flex flex-col gap-4">
      <div>
        <h1 class="text-xl sm:text-3xl font-bold text-gray-800">Báo cáo doanh thu</h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Thống kê và phân tích doanh thu hệ thống</p>
      </div>
      <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
        <div class="grid grid-cols-2 gap-2 w-full sm:w-auto min-w-0">
          <NDatePicker
            v-model:value="startDate"
            type="date"
            placeholder="Từ ngày"
            clearable
            class="w-full"
            style="min-width: 0"
          />
          <NDatePicker
            v-model:value="endDate"
            type="date"
            placeholder="Đến ngày"
            clearable
            class="w-full"
            style="min-width: 0"
          />
        </div>
        <NButton type="primary" :loading="exporting" @click="handleExportRevenue" class="w-full sm:w-auto flex-shrink-0">
          <template #icon>
            <NIcon><Download /></NIcon>
          </template>
          Xuất file doanh thu
        </NButton>
      </div>
    </div>

    <NSpin :show="loading">
      <div v-if="stats" class="space-y-4 sm:space-y-6">
        <!-- Tổng quan: 2 cột mobile, 4 cột desktop; chart full width trên mobile -->
        <NCard title="Tổng quan" class="revenue-overview-card">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="revenue-stat-item min-w-0">
              <NStatistic
                label="Tổng doanh thu"
                :value="formatCurrency(stats.overall.totalRevenue)"
              />
            </div>
            <div class="revenue-stat-item min-w-0">
              <NStatistic
                label="Tổng đơn hàng"
                :value="stats.overall.totalOrders"
              />
            </div>
            <div class="revenue-stat-item min-w-0 col-span-2 lg:col-span-1">
              <NStatistic
                label="Giá trị đơn TB"
                :value="formatCurrency(stats.overall.averageOrderValue)"
              />
            </div>
            <div class="revenue-chart-wrap col-span-2 lg:col-span-1 min-w-0">
              <div class="text-center">
                <div class="text-sm text-gray-500 mb-2">Trạng thái đơn hàng</div>
                <v-chart
                  :option="orderStatusChartOption"
                  class="revenue-pie-chart"
                  autoresize
                />
              </div>
            </div>
          </div>
        </NCard>

        <!-- Doanh thu theo thời gian: 2 cột mobile, 4 cột desktop -->
        <NCard title="Doanh thu theo thời gian" class="mb-4 sm:mb-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="min-w-0">
              <NStatistic
                label="Doanh thu hôm nay"
                :value="formatCurrency(stats.revenue.todayRevenue)"
              />
            </div>
            <div class="min-w-0">
              <NStatistic
                label="Doanh thu tuần này"
                :value="formatCurrency(stats.revenue.thisWeekRevenue)"
              />
            </div>
            <div class="min-w-0">
              <NStatistic
                label="Doanh thu tháng này"
                :value="formatCurrency(stats.revenue.thisMonthRevenue)"
              />
            </div>
            <div class="min-w-0">
              <NStatistic
                label="Doanh thu năm này"
                :value="formatCurrency(stats.revenue.thisYearRevenue)"
              />
            </div>
          </div>
        </NCard>

        <!-- Chart: Doanh thu 7 ngày gần đây -->
        <NCard title="📊 Biểu đồ doanh thu 7 ngày gần đây" class="mb-4 sm:mb-6 min-w-0 overflow-hidden">
          <v-chart
            :option="dailyRevenueChartOption"
            class="revenue-chart"
            autoresize
          />
        </NCard>

        <!-- Chart: Doanh thu 12 tháng gần đây -->
        <NCard title="📈 Biểu đồ doanh thu 12 tháng gần đây" class="mb-4 sm:mb-6 min-w-0 overflow-hidden">
          <v-chart
            :option="monthlyRevenueChartOption"
            class="revenue-chart-tall"
            autoresize
          />
        </NCard>

        <!-- Chart: Sản phẩm bán chạy -->
        <NCard title="🏆 Top 5 sản phẩm bán chạy" class="mb-4 sm:mb-6 min-w-0 overflow-hidden">
          <v-chart
            :option="topProductsChartOption"
            class="revenue-chart"
            autoresize
          />
        </NCard>

        <!-- Bảng dữ liệu chi tiết: 1 cột mobile, 2 cột desktop -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Doanh thu 7 ngày gần đây - Table -->
          <NCard title="Chi tiết doanh thu 7 ngày" class="h-full overflow-hidden">
            <div class="overflow-x-auto min-w-0">
              <NDataTable
                :columns="[
                  {
                    title: 'Ngày',
                    key: 'date',
                    width: 120,
                    render: (row) => formatDate(row.date),
                  },
                  {
                    title: 'Doanh thu',
                    key: 'revenue',
                    width: 150,
                    align: 'right',
                    render: (row) => h('span', { class: 'font-semibold text-green-600' }, formatCurrency(row.revenue)),
                  },
                  {
                    title: 'Số đơn',
                    key: 'orderCount',
                    width: 80,
                    align: 'center',
                  },
                ]"
                :data="stats.revenue.dailyRevenueLast7Days"
                :bordered="true"
                size="small"
                striped
              />
            </div>
          </NCard>

          <!-- Sản phẩm bán chạy - Table -->
          <NCard title="Bảng sản phẩm bán chạy" class="h-full overflow-hidden">
            <div class="overflow-x-auto min-w-0">
              <NDataTable
                :columns="[
                  {
                    title: 'Sản phẩm',
                    key: 'productName',
                    ellipsis: { tooltip: true },
                  },
                  {
                    title: 'Đã bán',
                    key: 'totalSold',
                    width: 80,
                    align: 'center',
                  },
                  {
                    title: 'Doanh thu',
                    key: 'totalRevenue',
                    width: 130,
                    align: 'right',
                    render: (row) => h('span', { class: 'font-semibold text-green-600' }, formatCurrency(row.totalRevenue)),
                  },
                ]"
                :data="stats.topProducts"
                :bordered="true"
                size="small"
                striped
              />
            </div>
          </NCard>
        </div>

        <!-- Đơn hàng gần đây -->
        <NCard title="Đơn hàng gần đây" class="mb-6 mt-6 overflow-hidden">
          <div class="overflow-x-auto min-w-0">
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
          </div>
        </NCard>
      </div>
    </NSpin>
  </div>
</template>

<style scoped>
.revenue-overview-card :deep(.n-card__content) {
  min-width: 0;
}
.revenue-stat-item :deep(.n-statistic__value) {
  word-break: break-word;
}
.revenue-pie-chart {
  height: 160px;
  width: 100%;
  min-width: 0;
}
.revenue-chart-wrap {
  contain: layout;
}
.revenue-chart {
  height: 300px;
  width: 100%;
  min-width: 0;
}
@media (min-width: 640px) {
  .revenue-chart {
    height: 350px;
  }
}
.revenue-chart-tall {
  height: 300px;
  width: 100%;
  min-width: 0;
}
@media (min-width: 640px) {
  .revenue-chart-tall {
    height: 400px;
  }
}
</style>
