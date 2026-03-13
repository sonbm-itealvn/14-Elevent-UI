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
  NDatePicker,
  NPagination,
  NSpin,
  type SelectOption
} from 'naive-ui';
import { Eye, Check, X, Download } from '@vicons/tabler';
import OrderService from '@/core/services/api/order.service';
import type { Order, OrderStatus } from '@/domain/models/order.model';

const message = useMessage();

const loading = ref(false);
const exporting = ref(false);
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

// Shipping tracking modal
const showTrackingModal = ref(false);
const trackingUrl = ref('');
const trackingNote = ref('');
const trackingLoading = ref(false);
const pendingStatusUpdate = ref<{ order: Order; status: OrderStatus } | null>(null);

// Export filters
const exportStartDate = ref<number | null>(null);
const exportEndDate = ref<number | null>(null);

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
  const opt = orderStatusSelectOptions.find(o => o.value === status);
  return opt?.label ?? status;
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
    width: 180,
    render: (row: Order) => {
      return h(NSelect, {
        value: row.status,
        options: orderStatusSelectOptions.filter(opt => 
          ['PENDING', 'PAID', 'SHIPPING', 'COMPLETED', 'CANCELLED'].includes(opt.value)
        ),
        size: 'small',
        onUpdateValue: (value: OrderStatus) => handleUpdateStatusDirect(row, value),
        style: { minWidth: '150px' }
      });
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

const handleUpdateStatus = async (status: OrderStatus) => {
  if (!selectedOrder.value) return;
  
  // Nếu chuyển sang SHIPPING, hiển thị popup yêu cầu nhập trackingUrl
  if (status === 'SHIPPING') {
    pendingStatusUpdate.value = { order: selectedOrder.value, status };
    trackingUrl.value = '';
    trackingNote.value = '';
    showTrackingModal.value = true;
    return;
  }
  
  // Các trạng thái khác, cập nhật bình thường
  try {
    await OrderService.updateOrderStatus(selectedOrder.value.id, { status });
    message.success('Cập nhật trạng thái đơn hàng thành công');
    await handleView(selectedOrder.value);
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
  }
};

const handleUpdateStatusDirect = async (order: Order, newStatus: OrderStatus) => {
  // Nếu chuyển sang SHIPPING, hiển thị popup yêu cầu nhập trackingUrl
  if (newStatus === 'SHIPPING') {
    pendingStatusUpdate.value = { order, status: newStatus };
    trackingUrl.value = '';
    trackingNote.value = '';
    showTrackingModal.value = true;
    // Không return ngay, để modal xử lý
    return;
  }
  
  // Các trạng thái khác, cập nhật bình thường
  try {
    await OrderService.updateOrderStatus(order.id, { status: newStatus });
    message.success('Cập nhật trạng thái đơn hàng thành công');
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    // Reload để reset select về giá trị cũ
    await loadOrders();
  }
};

const handleCancelTracking = () => {
  showTrackingModal.value = false;
  pendingStatusUpdate.value = null;
  trackingUrl.value = '';
  trackingNote.value = '';
  // Reload để reset select về giá trị cũ
  loadOrders();
};

const handleConfirmTracking = async () => {
  if (!pendingStatusUpdate.value) return;
  
  // Validate trackingUrl khi chuyển sang SHIPPING
  if (pendingStatusUpdate.value.status === 'SHIPPING' && !trackingUrl.value.trim()) {
    message.warning('Vui lòng nhập URL theo dõi đơn hàng');
    return;
  }
  
  try {
    trackingLoading.value = true;
    const updateData: any = {
      status: pendingStatusUpdate.value.status,
    };
    
    // Chỉ thêm trackingUrl khi chuyển sang SHIPPING
    if (pendingStatusUpdate.value.status === 'SHIPPING') {
      updateData.trackingUrl = trackingUrl.value.trim();
    }
    
    // Thêm note nếu có
    if (trackingNote.value.trim()) {
      updateData.note = trackingNote.value.trim();
    }
    
    await OrderService.updateOrderStatus(pendingStatusUpdate.value.order.id, updateData);
    message.success('Cập nhật trạng thái đơn hàng thành công');
    
    // Nếu đang xem chi tiết, reload lại
    if (selectedOrder.value?.id === pendingStatusUpdate.value.order.id) {
      await handleView(pendingStatusUpdate.value.order);
    }
    
    showTrackingModal.value = false;
    pendingStatusUpdate.value = null;
    trackingUrl.value = '';
    trackingNote.value = '';
    await loadOrders();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    // Reload để reset select về giá trị cũ nếu có lỗi
    await loadOrders();
  } finally {
    trackingLoading.value = false;
  }
};

const handleStatusFilterChange = (value: OrderStatus | null) => {
  statusFilter.value = value;
  pagination.value.page = 1;
  loadOrders();
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

const handleExportOrders = async () => {
  try {
    exporting.value = true;
    const params: { status?: OrderStatus; startDate?: string; endDate?: string } = {};
    
    if (statusFilter.value) {
      params.status = statusFilter.value;
    }
    if (exportStartDate.value) {
      params.startDate = new Date(exportStartDate.value).toISOString().split('T')[0];
    }
    if (exportEndDate.value) {
      params.endDate = new Date(exportEndDate.value).toISOString().split('T')[0];
    }

    const blob = await OrderService.exportOrders(params);
    const statusStr = params.status || 'all';
    const dateStr = `${params.startDate || 'all'}-${params.endDate || 'all'}`;
    const filename = `don-hang-${statusStr}-${dateStr}.xlsx`;
    downloadFile(blob, filename);
    message.success('Xuất file đơn hàng thành công');
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi xuất file đơn hàng');
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="p-3 sm:p-6 min-w-0">
    <!-- Header: stack trên mobile, tránh cắt "Đến ngày" -->
    <div class="flex flex-col gap-4 mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-3xl font-bold text-gray-800">Quản lý đơn hàng</h1>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div class="grid grid-cols-2 gap-2 w-full sm:w-auto min-w-0">
          <NDatePicker
            v-model:value="exportStartDate"
            type="date"
            placeholder="Từ ngày"
            clearable
            class="w-full"
            style="min-width: 0"
          />
          <NDatePicker
            v-model:value="exportEndDate"
            type="date"
            placeholder="Đến ngày"
            clearable
            class="w-full"
            style="min-width: 0"
          />
        </div>
        <NButton type="primary" :loading="exporting" @click="handleExportOrders" class="w-full sm:w-auto flex-shrink-0">
          <template #icon>
            <NIcon><Download /></NIcon>
          </template>
          Xuất file đơn hàng
        </NButton>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
      <NSelect
        v-model:value="statusFilter"
        :options="orderStatusOptions"
        placeholder="Lọc theo trạng thái"
        clearable
        class="w-full sm:w-[250px] min-w-0"
        @update:value="handleStatusFilterChange"
      />
      <div class="text-sm text-gray-500">
        Tổng số đơn hàng: <span class="font-semibold text-gray-700">{{ pagination.total }}</span>
      </div>
    </div>

    <!-- Mobile: danh sách đơn dạng thẻ -->
    <div class="block md:hidden space-y-3">
      <div v-if="loading" class="flex justify-center py-8">
        <n-spin />
      </div>
      <template v-else>
        <div
          v-for="row in orders"
          :key="row.id"
          class="order-card-mobile bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div class="flex justify-between items-start gap-2 mb-2">
            <span class="font-semibold text-gray-800">{{ row.orderCode || `#${row.id}` }}</span>
            <NTag :type="getStatusTagType(row.status)" size="small">{{ getStatusLabel(row.status) }}</NTag>
          </div>
          <p class="text-sm text-gray-600 mb-1">{{ row.receiverName }}</p>
          <div class="flex justify-between items-center flex-wrap gap-2 mb-3">
            <span class="font-semibold text-red-600 text-sm">{{ formatCurrency(row.totalAmount) }}</span>
            <span class="text-xs text-gray-500">{{ row.createdAt ? new Date(row.createdAt).toLocaleString('vi-VN') : '-' }}</span>
          </div>
          <div class="flex flex-wrap gap-2 mb-3">
            <NTag size="small" :type="getStatusTagType(row.paymentStatus)">{{ getPaymentStatusLabel(row.paymentStatus) }}</NTag>
            <span class="text-xs text-gray-500">{{ paymentMethodLabels[row.paymentMethod] || row.paymentMethod }}</span>
          </div>
          <div class="flex gap-2 pt-2 border-t border-gray-100">
            <NButton size="tiny" quaternary @click="handleView(row)">
              <template #icon><NIcon><Eye /></NIcon></template>
              Xem
            </NButton>
            <NButton v-if="row.status === 'PENDING'" size="tiny" type="success" quaternary @click="handleApprove(row)">
              <template #icon><NIcon><Check /></NIcon></template>
              Duyệt
            </NButton>
            <NButton v-if="row.status !== 'COMPLETED' && row.status !== 'CANCELLED'" size="tiny" type="error" quaternary @click="openCancelModal(row)">
              <template #icon><NIcon><X /></NIcon></template>
              Hủy đơn
            </NButton>
          </div>
        </div>
        <p v-if="!loading && orders.length === 0" class="text-center text-gray-500 py-8">Chưa có đơn hàng</p>
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
        :row-class-name="() => 'hover:bg-gray-50'"
        class="orders-data-table"
      />
    </div>

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

    <!-- Shipping Tracking Modal -->
    <NModal v-model:show="showTrackingModal" title="Nhập thông tin theo dõi đơn hàng" preset="card" style="width: 600px">
      <NForm v-if="pendingStatusUpdate">
        <NFormItem label="URL theo dõi đơn hàng" required>
          <NInput
            v-model:value="trackingUrl"
            placeholder="Nhập URL theo dõi đơn hàng (bắt buộc)"
            type="text"
          />
          <template #feedback>
            <div class="text-xs text-gray-500 mt-1">
              Ví dụ: https://tracking.viettelpost.vn/...
            </div>
          </template>
        </NFormItem>
        <NFormItem label="Ghi chú (tùy chọn)">
          <NInput
            v-model:value="trackingNote"
            type="textarea"
            placeholder="Nhập ghi chú nếu có..."
            :rows="3"
          />
        </NFormItem>
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div class="text-sm text-blue-800">
            <strong>Đơn hàng:</strong> {{ pendingStatusUpdate.order.orderCode || `#${pendingStatusUpdate.order.id}` }}
          </div>
          <div class="text-sm text-blue-800 mt-1">
            <strong>Người nhận:</strong> {{ pendingStatusUpdate.order.receiverName }}
          </div>
        </div>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="handleCancelTracking">Hủy</NButton>
          <NButton type="primary" :loading="trackingLoading" @click="handleConfirmTracking">
            Xác nhận
          </NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
</style>
