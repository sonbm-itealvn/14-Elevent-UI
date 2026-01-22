<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { NGrid, NGridItem, NStatistic, NCard, NDataTable } from 'naive-ui';

const stats = ref({
  totalUsers: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalRevenue: 0,
});

const recentOrders = ref<any[]>([]);
const loading = ref(false);

// Mock data for UI preview
const mockRecentOrders = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    user: { fullName: 'Trần Thị User', email: 'user1@example.com' },
    totalAmount: 25000000,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    user: { fullName: 'Lê Văn Test', email: 'user2@example.com' },
    totalAmount: 200000,
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const loadStats = async () => {
  try {
    loading.value = true;
    
    // Mock data for UI preview
    setTimeout(() => {
      stats.value = {
        totalUsers: 5,
        totalOrders: 2,
        totalProducts: 3,
        totalRevenue: 27720000,
      };
      recentOrders.value = mockRecentOrders;
      loading.value = false;
    }, 300);
    
    // Real API call - uncomment when ready
    // const usersResponse = await UserService.getUsers({ page: 0, size: 1 });
    // stats.value.totalUsers = usersResponse.pagination.total;
    // const ordersResponse = await OrderService.getOrders({ page: 0, size: 5 });
    // stats.value.totalOrders = ordersResponse.pagination.total;
    // recentOrders.value = ordersResponse.data;
    // const productsResponse = await ProductService.getProducts({ page: 0, size: 1 });
    // stats.value.totalProducts = productsResponse.pagination.total;
    // const endDate = new Date();
    // const startDate = new Date();
    // startDate.setMonth(startDate.getMonth() - 1);
    // const revenueReport = await InvoiceService.getRevenueReport({
    //   startDate: startDate.toISOString(),
    //   endDate: endDate.toISOString(),
    // });
    // stats.value.totalRevenue = revenueReport.totalRevenue;
  } catch (error: any) {
    console.error('Error loading stats:', error);
    loading.value = false;
  }
};

onMounted(() => {
  loadStats();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    
    <NGrid :cols="4" :x-gap="12" class="mb-6">
      <NGridItem>
        <NCard>
          <NStatistic label="Tổng người dùng" :value="stats.totalUsers" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard>
          <NStatistic label="Tổng đơn hàng" :value="stats.totalOrders" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard>
          <NStatistic label="Tổng sản phẩm" :value="stats.totalProducts" />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard>
          <NStatistic 
            label="Doanh thu (30 ngày)" 
            :value="new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)" 
          />
        </NCard>
      </NGridItem>
    </NGrid>

    <NCard title="Đơn hàng gần đây" class="mt-6">
      <NDataTable
        :columns="[
          { title: 'Mã đơn', key: 'orderNumber' },
          { title: 'Khách hàng', key: 'user', render: (row) => row.user?.fullName || row.user?.email || '-' },
          { title: 'Tổng tiền', key: 'totalAmount', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.totalAmount) },
          { title: 'Trạng thái', key: 'status' },
          { title: 'Ngày tạo', key: 'createdAt', render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-' },
        ]"
        :data="recentOrders"
        :loading="loading"
        :bordered="true"
      />
    </NCard>
  </div>
</template>

<style scoped>
</style>
