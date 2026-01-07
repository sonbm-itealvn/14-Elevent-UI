<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { 
  NDataTable, 
  NButton, 
  NModal, 
  NForm, 
  NFormItem, 
  NSelect,
  useMessage,
  NIcon,
  NTag,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NDivider
} from 'naive-ui';
import { Eye, Pencil } from '@vicons/tabler';
import OrderService from '@/core/services/api/order.service';
import type { Order, OrderStatus, PaymentStatus, UpdateOrderStatusRequest, UpdatePaymentStatusRequest } from '@/domain/models/order.model';

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

const showModal = ref(false);
const selectedOrder = ref<Order | null>(null);

const orderStatusOptions = [
  { label: 'Chờ xử lý', value: 'PENDING' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đang xử lý', value: 'PROCESSING' },
  { label: 'Đã giao hàng', value: 'SHIPPED' },
  { label: 'Đã nhận hàng', value: 'DELIVERED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const paymentStatusOptions = [
  { label: 'Chờ thanh toán', value: 'PENDING' },
  { label: 'Đã thanh toán', value: 'PAID' },
  { label: 'Thanh toán thất bại', value: 'FAILED' },
  { label: 'Đã hoàn tiền', value: 'REFUNDED' },
];

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'default',
    CONFIRMED: 'info',
    PROCESSING: 'warning',
    SHIPPED: 'success',
    DELIVERED: 'success',
    CANCELLED: 'error',
    PAID: 'success',
    FAILED: 'error',
    REFUNDED: 'warning',
  };
  return statusMap[status] || 'default';
};

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Mã đơn hàng',
    key: 'orderNumber',
    width: 150,
  },
  {
    title: 'Khách hàng',
    key: 'user',
    width: 200,
    render: (row: Order) => row.user?.fullName || row.user?.email || '-',
  },
  {
    title: 'Tổng tiền',
    key: 'totalAmount',
    width: 150,
    render: (row: Order) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.totalAmount),
  },
  {
    title: 'Trạng thái',
    key: 'status',
    width: 150,
    render: (row: Order) => {
      return h(NTag, { type: getStatusTagType(row.status) }, { default: () => orderStatusOptions.find(o => o.value === row.status)?.label || row.status });
    },
  },
  {
    title: 'Thanh toán',
    key: 'paymentStatus',
    width: 150,
    render: (row: Order) => {
      return h(NTag, { type: getStatusTagType(row.paymentStatus) }, { default: () => paymentStatusOptions.find(o => o.value === row.paymentStatus)?.label || row.paymentStatus });
    },
  },
  {
    title: 'Ngày tạo',
    key: 'createdAt',
    width: 180,
    render: (row: Order) => row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-',
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 150,
    render: (row: Order) => {
      return h(NButton, {
        size: 'small',
        circle: true,
        tertiary: true,
        quaternary: true,
        onClick: () => handleView(row),
      }, { icon: () => h(NIcon, null, { default: () => h(Eye) }) });
    },
  },
];

// Mock data for UI preview
const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    userId: 1,
    user: { id: 1, email: 'user1@example.com', fullName: 'Trần Thị User' },
    totalAmount: 25000000,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    shippingAddress: {
      fullName: 'Trần Thị User',
      phone: '0987654321',
      address: '123 Đường ABC',
      city: 'Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Phường Bến Nghé',
    },
    items: [
      { id: 1, productId: 1, quantity: 1, price: 25000000, subtotal: 25000000, product: { id: 1, name: 'iPhone 15 Pro', slug: 'iphone-15-pro' } },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    userId: 2,
    user: { id: 2, email: 'user2@example.com', fullName: 'Lê Văn Test' },
    totalAmount: 200000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    shippingAddress: {
      fullName: 'Lê Văn Test',
      phone: '0912345678',
      address: '456 Đường XYZ',
      city: 'Hà Nội',
      district: 'Quận Hoàn Kiếm',
      ward: 'Phường Tràng Tiền',
    },
    items: [
      { id: 2, productId: 3, quantity: 1, price: 200000, subtotal: 200000, product: { id: 3, name: 'Áo thun nam', slug: 'ao-thun-nam' } },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const loadOrders = async () => {
  try {
    loading.value = true;
    
    // Real API call
    const response = await OrderService.getOrders({
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
    });
    orders.value = response.content;
    pagination.value.total = response.totalElements;
    loading.value = false;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
    loading.value = false;
  }
};

const handleView = async (order: Order) => {
  try {
    // Real API call
    const fullOrder = await OrderService.getOrderById(order.id);
    selectedOrder.value = fullOrder;
    showModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải thông tin đơn hàng');
  }
};

const handleUpdateStatus = async (status: OrderStatus) => {
  if (!selectedOrder.value) return;
  try {
    await OrderService.updateOrderStatus(selectedOrder.value.id, { status });
    message.success('Cập nhật trạng thái đơn hàng thành công');
    await handleView(selectedOrder.value);
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
  }
};

const handleUpdatePaymentStatus = async (paymentStatus: PaymentStatus) => {
  if (!selectedOrder.value) return;
  try {
    await OrderService.updatePaymentStatus(selectedOrder.value.id, { paymentStatus });
    message.success('Cập nhật trạng thái thanh toán thành công');
    await handleView(selectedOrder.value);
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thanh toán');
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý đơn hàng</h1>
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

    <NModal v-model:show="showModal" title="Chi tiết đơn hàng" preset="card" style="width: 900px">
      <div v-if="selectedOrder">
        <NDescriptions :column="2" bordered>
          <NDescriptionsItem label="Mã đơn hàng">{{ selectedOrder.orderNumber }}</NDescriptionsItem>
          <NDescriptionsItem label="Ngày tạo">{{ selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '-' }}</NDescriptionsItem>
          <NDescriptionsItem label="Khách hàng">{{ selectedOrder.user?.fullName || selectedOrder.user?.email || '-' }}</NDescriptionsItem>
          <NDescriptionsItem label="Email">{{ selectedOrder.user?.email || '-' }}</NDescriptionsItem>
          <NDescriptionsItem label="Tổng tiền">
            <span class="font-bold text-lg">{{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount) }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="Phương thức thanh toán">{{ selectedOrder.paymentMethod || '-' }}</NDescriptionsItem>
        </NDescriptions>

        <NDivider />

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Trạng thái đơn hàng</h3>
          <NSelect
            :value="selectedOrder.status"
            :options="orderStatusOptions"
            @update:value="handleUpdateStatus"
            placeholder="Chọn trạng thái"
          />
        </div>

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Trạng thái thanh toán</h3>
          <NSelect
            :value="selectedOrder.paymentStatus"
            :options="paymentStatusOptions"
            @update:value="handleUpdatePaymentStatus"
            placeholder="Chọn trạng thái thanh toán"
          />
        </div>

        <NDivider />

        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Địa chỉ giao hàng</h3>
          <NDescriptions :column="1" bordered>
            <NDescriptionsItem label="Họ tên">{{ selectedOrder.shippingAddress.fullName }}</NDescriptionsItem>
            <NDescriptionsItem label="Số điện thoại">{{ selectedOrder.shippingAddress.phone }}</NDescriptionsItem>
            <NDescriptionsItem label="Địa chỉ">{{ selectedOrder.shippingAddress.address }}</NDescriptionsItem>
            <NDescriptionsItem label="Phường/Xã">{{ selectedOrder.shippingAddress.ward }}</NDescriptionsItem>
            <NDescriptionsItem label="Quận/Huyện">{{ selectedOrder.shippingAddress.district }}</NDescriptionsItem>
            <NDescriptionsItem label="Tỉnh/Thành phố">{{ selectedOrder.shippingAddress.city }}</NDescriptionsItem>
            <NDescriptionsItem v-if="selectedOrder.shippingAddress.postalCode" label="Mã bưu điện">{{ selectedOrder.shippingAddress.postalCode }}</NDescriptionsItem>
          </NDescriptions>
        </div>

        <NDivider />

        <div>
          <h3 class="text-lg font-semibold mb-2">Sản phẩm</h3>
          <NDataTable
            :columns="[
              { title: 'Sản phẩm', key: 'product', render: (row) => row.product?.name || '-' },
              { title: 'Biến thể', key: 'variant', render: (row) => row.variant?.name || '-' },
              { title: 'Số lượng', key: 'quantity' },
              { title: 'Đơn giá', key: 'price', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price) },
              { title: 'Thành tiền', key: 'subtotal', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.subtotal) },
            ]"
            :data="selectedOrder.items"
            :bordered="true"
          />
        </div>

        <div v-if="selectedOrder.notes" class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Ghi chú</h3>
          <p>{{ selectedOrder.notes }}</p>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
</style>

