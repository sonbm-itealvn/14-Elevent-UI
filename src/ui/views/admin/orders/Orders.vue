<script setup lang="ts">
import { ref, onMounted, h, type VNode } from 'vue';
import { 
  NDataTable, 
  NButton, 
  NModal, 
  NForm, 
  NFormItem, 
  NSelect,
  NInput,
  useMessage,
  NIcon,
  NTag,
  NDivider,
  NSpace,
  NImage,
  type SelectOption
} from 'naive-ui';
import { Eye, Check, X, Cash } from '@vicons/tabler';
import OrderService from '@/core/services/api/order.service';
import type { Order, OrderStatus } from '@/domain/models/order.model';

const message = useMessage();

const loading = ref(false);
const orders = ref<Order[]>([]);
const statusFilter = ref<OrderStatus | null>(null);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const showModal = ref(false);
const selectedOrder = ref<Order | null>(null);

// Cancel modal
const showCancelModal = ref(false);
const cancelReason = ref('');
const cancelLoading = ref(false);

// Status options theo API documentation
const orderStatusOptions = [
  { label: 'Tất cả', value: null as OrderStatus | null },
  { label: 'Chờ xử lý', value: 'PENDING' as OrderStatus },
  { label: 'Đã thanh toán', value: 'PAID' as OrderStatus },
  { label: 'Đã xác nhận', value: 'CONFIRMED' as OrderStatus },
  { label: 'Đang giao hàng', value: 'SHIPPING' as OrderStatus },
  { label: 'Hoàn thành', value: 'COMPLETED' as OrderStatus },
  { label: 'Đã hủy', value: 'CANCELLED' as OrderStatus },
] as SelectOption[];

const orderStatusSelectOptions = [
  { label: 'Chờ xử lý', value: 'PENDING' },
  { label: 'Đã thanh toán', value: 'PAID' },
  { label: 'Đã xác nhận', value: 'CONFIRMED' },
  { label: 'Đang giao hàng', value: 'SHIPPING' },
  { label: 'Hoàn thành', value: 'COMPLETED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const paymentStatusOptions = [
  { label: 'Chờ thanh toán', value: 'PENDING' },
  { label: 'Thành công', value: 'SUCCESS' },
  { label: 'Thất bại', value: 'FAILED' },
  { label: 'Đã hủy', value: 'CANCELLED' },
  { label: 'Hết hạn', value: 'EXPIRED' },
];

const paymentMethodLabels: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANKING: 'Chuyển khoản ngân hàng',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
};

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    PENDING: 'default',
    PAID: 'info',
    CONFIRMED: 'info',
    SHIPPING: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'error',
    SUCCESS: 'success',
    FAILED: 'error',
    EXPIRED: 'warning',
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: string) => {
  return orderStatusSelectOptions.find(o => o.value === status)?.label || status;
};

const getPaymentStatusLabel = (status: string) => {
  return paymentStatusOptions.find(o => o.value === status)?.label || status;
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
    title: 'Tổng tiền',
    key: 'totalAmount',
    width: 140,
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
    title: 'Thanh toán',
    key: 'paymentStatus',
    width: 110,
    render: (row: Order) => {
      return h(NTag, { type: getStatusTagType(row.paymentStatus), size: 'small' }, { default: () => getPaymentStatusLabel(row.paymentStatus) });
    },
  },
  {
    title: 'PT Thanh toán',
    key: 'paymentMethod',
    width: 100,
    render: (row: Order) => paymentMethodLabels[row.paymentMethod] || row.paymentMethod,
  },
  {
    title: 'Ngày tạo',
    key: 'createdAt',
    width: 150,
    render: (row: Order) => row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-',
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 200,
    render: (row: Order) => {
      const buttons: VNode[] = [];
      
      // View button
      buttons.push(
        h(NButton, {
          size: 'small',
          circle: true,
          tertiary: true,
          onClick: () => handleView(row),
          title: 'Xem chi tiết',
        }, { icon: () => h(NIcon, null, { default: () => h(Eye) }) })
      );

      // Approve button - only show when PENDING
      if (row.status === 'PENDING') {
        buttons.push(
          h(NButton, {
            size: 'small',
            circle: true,
            tertiary: true,
            type: 'success',
            onClick: () => handleApprove(row),
            title: 'Duyệt đơn hàng',
          }, { icon: () => h(NIcon, null, { default: () => h(Check) }) })
        );
      }

      // Confirm COD button - only show when COD and payment pending
      if (row.paymentMethod === 'COD' && row.paymentStatus === 'PENDING' && row.status !== 'CANCELLED') {
        buttons.push(
          h(NButton, {
            size: 'small',
            circle: true,
            tertiary: true,
            type: 'info',
            onClick: () => handleConfirmCod(row),
            title: 'Xác nhận thanh toán COD',
          }, { icon: () => h(NIcon, null, { default: () => h(Cash) }) })
        );
      }

      // Cancel button - show when not completed or cancelled
      if (row.status !== 'COMPLETED' && row.status !== 'CANCELLED') {
        buttons.push(
          h(NButton, {
            size: 'small',
            circle: true,
            tertiary: true,
            type: 'error',
            onClick: () => openCancelModal(row),
            title: 'Hủy đơn hàng',
          }, { icon: () => h(NIcon, null, { default: () => h(X) }) })
        );
      }

      return h(NSpace, { size: 'small' }, { default: () => buttons });
    },
  },
];

const loadOrders = async () => {
  try {
    loading.value = true;
    const response = await OrderService.getOrders({
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
      status: statusFilter.value || undefined,
    });
    // Xử lý trường hợp orders rỗng hoặc null - không phải lỗi, chỉ là chưa có đơn hàng
    orders.value = response?.orders || [];
    pagination.value.total = response?.totalElements || 0;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
  } finally {
    loading.value = false;
  }
};

const handleView = async (order: Order) => {
  try {
    loading.value = true;
    const fullOrder = await OrderService.getOrderById(order.id);
    selectedOrder.value = fullOrder;
    showModal.value = true;
  } catch (error: any) {
    console.error('Error loading order details:', error);
    message.error(error?.response?.data?.message || 'Lỗi khi tải thông tin đơn hàng');
  } finally {
    loading.value = false;
  }
};

const handleApprove = async (order: Order) => {
  try {
    await OrderService.approveOrder(order.id);
    message.success('Đã duyệt đơn hàng thành công');
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi duyệt đơn hàng');
  }
};

const openCancelModal = (order: Order) => {
  selectedOrder.value = order;
  cancelReason.value = '';
  showCancelModal.value = true;
};

const handleCancel = async () => {
  if (!selectedOrder.value) return;
  if (!cancelReason.value.trim()) {
    message.warning('Vui lòng nhập lý do hủy đơn hàng');
    return;
  }
  
  try {
    cancelLoading.value = true;
    await OrderService.cancelOrder(selectedOrder.value.id, { reason: cancelReason.value });
    message.success('Đã hủy đơn hàng thành công');
    showCancelModal.value = false;
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
  } finally {
    cancelLoading.value = false;
  }
};

const handleConfirmCod = async (order: Order) => {
  try {
    await OrderService.confirmCodPayment(order.id);
    message.success('Đã xác nhận thanh toán COD thành công');
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi xác nhận thanh toán COD');
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

const handleStatusFilterChange = (value: OrderStatus | null) => {
  statusFilter.value = value;
  pagination.value.page = 1;
  loadOrders();
};

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Quản lý đơn hàng</h1>
    </div>

    <!-- Filter -->
    <div class="mb-6 flex gap-4 items-center">
      <NSelect
        v-model:value="statusFilter"
        :options="orderStatusOptions"
        placeholder="Lọc theo trạng thái"
        clearable
        style="width: 250px"
        @update:value="handleStatusFilterChange"
      />
      <div class="text-sm text-gray-500">
        Tổng số đơn hàng: <span class="font-semibold text-gray-700">{{ pagination.total }}</span>
      </div>
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
      :row-class-name="() => 'hover:bg-gray-50'"
    />

    <!-- Order Detail Modal -->
    <NModal v-model:show="showModal" title="Chi tiết đơn hàng" preset="card" style="width: 1200px; max-width: 95vw">
      <div v-if="selectedOrder" class="space-y-6">
        <!-- Thông tin cơ bản - Layout ngang -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500 mb-1">Mã đơn hàng</div>
            <div class="text-lg font-semibold">{{ selectedOrder.orderCode || `#${selectedOrder.id}` }}</div>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="text-sm text-gray-500 mb-1">Ngày tạo</div>
            <div class="text-lg">{{ selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : '-' }}</div>
          </div>
        </div>

        <!-- Trạng thái và Thanh toán - Layout ngang -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Trạng thái đơn hàng</h3>
            <NSelect
              :value="selectedOrder.status"
              :options="orderStatusSelectOptions"
              @update:value="handleUpdateStatus"
              placeholder="Chọn trạng thái"
            />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Trạng thái thanh toán</h3>
            <NTag :type="getStatusTagType(selectedOrder.paymentStatus)" size="large">
              {{ getPaymentStatusLabel(selectedOrder.paymentStatus) }}
            </NTag>
          </div>
        </div>

        <!-- Chi tiết thanh toán và Địa chỉ giao hàng - Layout ngang 2 cột -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Cột trái: Chi tiết thanh toán -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Chi tiết thanh toán</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Tạm tính:</span>
                <span class="font-semibold">{{ formatCurrency(selectedOrder.subtotal || 0) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Phí vận chuyển:</span>
                <span class="font-semibold">{{ formatCurrency(selectedOrder.shippingFee || 0) }}</span>
              </div>
              <div class="flex justify-between text-green-600">
                <span>Giảm giá voucher:</span>
                <span class="font-semibold">-{{ formatCurrency(selectedOrder.voucherDiscount || 0) }}</span>
              </div>
              <div class="border-t border-gray-300 pt-3 mt-3">
                <div class="flex justify-between">
                  <span class="text-lg font-bold text-gray-800">Tổng cộng:</span>
                  <span class="text-xl font-bold text-red-600">{{ formatCurrency(selectedOrder.totalAmount) }}</span>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-300">
                <div class="text-sm text-gray-600">
                  <span class="font-semibold">Phương thức:</span> {{ paymentMethodLabels[selectedOrder.paymentMethod] || selectedOrder.paymentMethod }}
                </div>
                <div v-if="selectedOrder.buyerEmail" class="text-sm text-gray-600 mt-1">
                  <span class="font-semibold">Email:</span> {{ selectedOrder.buyerEmail }}
                </div>
              </div>
            </div>
          </div>

          <!-- Cột phải: Địa chỉ giao hàng -->
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Địa chỉ giao hàng</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Họ tên:</span>
                <span class="font-semibold text-gray-800">{{ selectedOrder.receiverName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Số điện thoại:</span>
                <span class="font-semibold text-gray-800">{{ selectedOrder.receiverPhone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Địa chỉ:</span>
                <span class="font-semibold text-gray-800 text-right max-w-[60%]">{{ selectedOrder.shippingAddress }}</span>
              </div>
              <div v-if="selectedOrder.shippingWard" class="flex justify-between">
                <span class="text-gray-600">Phường/Xã:</span>
                <span class="text-gray-800">{{ selectedOrder.shippingWard }}</span>
              </div>
              <div v-if="selectedOrder.shippingDistrict" class="flex justify-between">
                <span class="text-gray-600">Quận/Huyện:</span>
                <span class="text-gray-800">{{ selectedOrder.shippingDistrict }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tỉnh/Thành phố:</span>
                <span class="font-semibold text-gray-800">{{ selectedOrder.shippingCity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sản phẩm -->
        <div>
          <h3 class="text-lg font-semibold mb-3 text-gray-800">Danh sách sản phẩm</h3>
          <NDataTable
            v-if="selectedOrder.items && selectedOrder.items.length > 0"
            :columns="[
              { 
                title: 'Hình ảnh', 
                key: 'imageUrl', 
                width: 80,
                render: (row) => row.imageUrl ? h(NImage, { src: row.imageUrl, width: 50, height: 50, objectFit: 'cover' }) : '-'
              },
              { title: 'Sản phẩm', key: 'productName', ellipsis: { tooltip: true } },
              { title: 'SKU', key: 'sku', width: 120 },
              { 
                title: 'Thuộc tính', 
                key: 'attributes',
                width: 150,
                ellipsis: { tooltip: true },
                render: (row) => {
                  if (!row.attributes) return '-';
                  return Object.entries(row.attributes).map(([k, v]) => `${k}: ${v}`).join(', ');
                }
              },
              { title: 'Số lượng', key: 'quantity', width: 90, align: 'center' },
              { title: 'Đơn giá', key: 'unitPrice', render: (row) => formatCurrency(row.unitPrice), width: 130, align: 'right' },
              { title: 'Thành tiền', key: 'lineTotal', render: (row) => h('span', { class: 'font-semibold text-red-600' }, formatCurrency(row.lineTotal)), width: 130, align: 'right' },
            ]"
            :data="selectedOrder.items || []"
            :bordered="true"
            striped
          />
          <div v-else class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            Chưa có thông tin sản phẩm.
          </div>
        </div>

        <!-- Ghi chú -->
        <div v-if="selectedOrder.note" class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Ghi chú đơn hàng</h3>
          <p class="text-gray-800">{{ selectedOrder.note }}</p>
        </div>

        <!-- Action buttons -->
        <NDivider />
        <NSpace>
          <NButton 
            v-if="selectedOrder.status === 'PENDING'" 
            type="success" 
            @click="handleApprove(selectedOrder)"
          >
            Duyệt đơn hàng
          </NButton>
          <NButton 
            v-if="selectedOrder.paymentMethod === 'COD' && selectedOrder.paymentStatus === 'PENDING' && selectedOrder.status !== 'CANCELLED'" 
            type="info"
            @click="handleConfirmCod(selectedOrder)"
          >
            Xác nhận thanh toán COD
          </NButton>
          <NButton 
            v-if="selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED'" 
            type="error"
            @click="openCancelModal(selectedOrder)"
          >
            Hủy đơn hàng
          </NButton>
        </NSpace>
      </div>
    </NModal>

    <!-- Cancel Order Modal -->
    <NModal v-model:show="showCancelModal" title="Hủy đơn hàng" preset="card" style="width: 500px">
      <NForm>
        <NFormItem label="Lý do hủy đơn hàng" required>
          <NInput
            v-model:value="cancelReason"
            type="textarea"
            placeholder="Nhập lý do hủy đơn hàng..."
            :rows="3"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showCancelModal = false">Đóng</NButton>
          <NButton type="error" :loading="cancelLoading" @click="handleCancel">
            Xác nhận hủy
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
</style>
