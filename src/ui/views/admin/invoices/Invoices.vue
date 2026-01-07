<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { 
  NDataTable, 
  NButton, 
  NModal, 
  NForm, 
  NFormItem, 
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  useMessage,
  NIcon,
  NTag,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NStatistic,
  NGrid,
  NGridItem
} from 'naive-ui';
import { Plus, Pencil, Trash, TrendingUp } from '@vicons/tabler';
import InvoiceService from '@/core/services/api/invoice.service';
import OrderService from '@/core/services/api/order.service';
import type { Invoice, InvoiceStatus, CreateInvoiceRequest, UpdateInvoiceRequest, RevenueReport } from '@/domain/models/invoice.model';
import type { Order } from '@/domain/models/order.model';

const message = useMessage();

const loading = ref(false);
const invoices = ref<Invoice[]>([]);
const orders = ref<Order[]>([]);
const revenueReport = ref<RevenueReport | null>(null);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const showModal = ref(false);
const showRevenueModal = ref(false);
const modalTitle = ref('Tạo hóa đơn mới');
const editingInvoice = ref<Invoice | null>(null);
const formRef = ref();

const formData = ref<CreateInvoiceRequest>({
  orderId: 0,
  amount: 0,
  tax: 0,
  discount: 0,
  dueDate: undefined,
});

const invoiceStatusOptions = [
  { label: 'Nháp', value: 'DRAFT' },
  { label: 'Đã phát hành', value: 'ISSUED' },
  { label: 'Đã thanh toán', value: 'PAID' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

const getStatusTagType = (status: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: 'default',
    ISSUED: 'info',
    PAID: 'success',
    CANCELLED: 'error',
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
    title: 'Số hóa đơn',
    key: 'invoiceNumber',
    width: 150,
  },
  {
    title: 'Mã đơn hàng',
    key: 'order',
    width: 150,
    render: (row: Invoice) => row.order?.orderNumber || '-',
  },
  {
    title: 'Số tiền',
    key: 'amount',
    width: 150,
    render: (row: Invoice) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.amount),
  },
  {
    title: 'Tổng tiền',
    key: 'totalAmount',
    width: 150,
    render: (row: Invoice) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.totalAmount),
  },
  {
    title: 'Trạng thái',
    key: 'status',
    width: 150,
    render: (row: Invoice) => {
      return h(NTag, { type: getStatusTagType(row.status) }, { default: () => invoiceStatusOptions.find(o => o.value === row.status)?.label || row.status });
    },
  },
  {
    title: 'Ngày phát hành',
    key: 'issuedAt',
    width: 180,
    render: (row: Invoice) => row.issuedAt ? new Date(row.issuedAt).toLocaleString('vi-VN') : '-',
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 200,
    render: (row: Invoice) => {
      return [
        h(NButton, {
          size: 'small',
          type: 'primary',
          style: { marginRight: '8px' },
          onClick: () => handleEdit(row),
        }, { default: () => 'Sửa', icon: () => h(NIcon, null, { default: () => h(Pencil) }) }),
      ];
    },
  },
];

// Mock data for UI preview
const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-001',
    orderId: 1,
    order: { id: 1, orderNumber: 'ORD-001', totalAmount: 25000000 },
    amount: 25000000,
    tax: 2500000,
    discount: 0,
    totalAmount: 27500000,
    status: 'ISSUED',
    issuedAt: new Date().toISOString(),
  },
  {
    id: 2,
    invoiceNumber: 'INV-002',
    orderId: 2,
    order: { id: 2, orderNumber: 'ORD-002', totalAmount: 200000 },
    amount: 200000,
    tax: 20000,
    discount: 0,
    totalAmount: 220000,
    status: 'PAID',
    issuedAt: new Date(Date.now() - 86400000).toISOString(),
    paidAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const loadInvoices = async () => {
  try {
    loading.value = true;
    
    // Real API call
    const response = await InvoiceService.getInvoices({
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
    });
    invoices.value = response.content;
    pagination.value.total = response.totalElements;
    loading.value = false;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách hóa đơn');
    loading.value = false;
  }
};

// Mock orders for invoice creation
const mockOrdersForInvoice: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    userId: 1,
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
    items: [],
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    userId: 2,
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
    items: [],
  },
];

const loadOrders = async () => {
  try {
    // Mock data for UI preview
    orders.value = mockOrdersForInvoice;
    
    // Real API call - uncomment when ready
    // const response = await OrderService.getOrders({ page: 0, size: 100 });
    // orders.value = response.data;
  } catch (error: any) {
    message.error('Lỗi khi tải danh sách đơn hàng');
  }
};

const loadRevenueReport = async () => {
  try {
    // Mock data for UI preview
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    revenueReport.value = {
      totalRevenue: 27720000,
      totalOrders: 2,
      averageOrderValue: 13860000,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      dailyRevenue: [
        { date: new Date(Date.now() - 7 * 86400000).toISOString(), revenue: 10000000, orders: 1 },
        { date: new Date(Date.now() - 6 * 86400000).toISOString(), revenue: 15000000, orders: 2 },
        { date: new Date(Date.now() - 5 * 86400000).toISOString(), revenue: 8000000, orders: 1 },
        { date: new Date(Date.now() - 4 * 86400000).toISOString(), revenue: 12000000, orders: 1 },
        { date: new Date(Date.now() - 3 * 86400000).toISOString(), revenue: 20000000, orders: 3 },
        { date: new Date(Date.now() - 2 * 86400000).toISOString(), revenue: 220000, orders: 1 },
        { date: new Date(Date.now() - 1 * 86400000).toISOString(), revenue: 27500000, orders: 1 },
      ],
    };
    showRevenueModal.value = true;
    
    // Real API call - uncomment when ready
    // const report = await InvoiceService.getRevenueReport({
    //   startDate: startDate.toISOString(),
    //   endDate: endDate.toISOString(),
    // });
    // revenueReport.value = report;
    // showRevenueModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải báo cáo doanh thu');
  }
};

const handleCreate = () => {
  editingInvoice.value = null;
  formData.value = {
    orderId: 0,
    amount: 0,
    tax: 0,
    discount: 0,
    dueDate: undefined,
  };
  modalTitle.value = 'Tạo hóa đơn mới';
  showModal.value = true;
};

const handleEdit = async (invoice: Invoice) => {
  try {
    const fullInvoice = await InvoiceService.getInvoiceById(invoice.id);
    editingInvoice.value = fullInvoice;
    formData.value = {
      orderId: fullInvoice.orderId,
      amount: fullInvoice.amount,
      tax: fullInvoice.tax || 0,
      discount: fullInvoice.discount || 0,
      dueDate: fullInvoice.dueDate,
    };
    modalTitle.value = 'Chỉnh sửa hóa đơn';
    showModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải thông tin hóa đơn');
  }
};

const handleSave = async () => {
  try {
    await formRef.value?.validate();
    
    // Real API call
    if (editingInvoice.value) {
      await InvoiceService.updateInvoice(editingInvoice.value.id, formData.value as UpdateInvoiceRequest);
      message.success('Cập nhật hóa đơn thành công');
    } else {
      await InvoiceService.createInvoice(formData.value);
      message.success('Tạo hóa đơn thành công');
    }
    showModal.value = false;
    await loadInvoices();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lưu hóa đơn');
  }
};

const handleDelete = async (invoiceId: number) => {
  try {
    // Real API call
    await InvoiceService.deleteInvoice(invoiceId);
    message.success('Xóa hóa đơn thành công');
    await loadInvoices();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi xóa hóa đơn');
  }
};

const calculateTotal = () => {
  const amount = formData.value.amount || 0;
  const tax = formData.value.tax || 0;
  const discount = formData.value.discount || 0;
  return amount + tax - discount;
};

onMounted(() => {
  loadInvoices();
  loadOrders();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý hóa đơn & Doanh thu</h1>
      <div class="flex gap-2">
        <NButton type="info" @click="loadRevenueReport">
          <template #icon>
            <NIcon><TrendingUp /></NIcon>
          </template>
          Báo cáo doanh thu
        </NButton>
        <NButton type="primary" @click="handleCreate">
          <template #icon>
            <NIcon><Plus /></NIcon>
          </template>
          Thêm hóa đơn
        </NButton>
      </div>
    </div>

    <NDataTable
      :columns="columns"
      :data="invoices"
      :loading="loading"
      :pagination="pagination"
      @update:page="(page) => { pagination.page = page; loadInvoices(); }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadInvoices(); }"
      striped
      bordered
    />

    <NModal v-model:show="showModal" :title="modalTitle" preset="dialog" style="width: 600px">
      <NForm ref="formRef" :model="formData" label-placement="left" label-width="120">
        <NFormItem label="Đơn hàng" path="orderId" :rule="{ required: true, type: 'number', min: 1, message: 'Vui lòng chọn đơn hàng' }">
          <NSelect
            v-model:value="formData.orderId"
            :options="orders.map(o => ({ label: `${o.orderNumber} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}`, value: o.id }))"
            placeholder="Chọn đơn hàng"
            :disabled="!!editingInvoice"
          />
        </NFormItem>
        <NFormItem label="Số tiền" path="amount" :rule="{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập số tiền' }">
          <NInputNumber v-model:value="formData.amount" placeholder="Nhập số tiền" :min="0" :precision="0" style="width: 100%" />
        </NFormItem>
        <NFormItem label="Thuế" path="tax">
          <NInputNumber v-model:value="formData.tax" placeholder="Nhập thuế" :min="0" :precision="0" style="width: 100%" />
        </NFormItem>
        <NFormItem label="Giảm giá" path="discount">
          <NInputNumber v-model:value="formData.discount" placeholder="Nhập giảm giá" :min="0" :precision="0" style="width: 100%" />
        </NFormItem>
        <NFormItem label="Tổng tiền">
          <NInputNumber :value="calculateTotal()" disabled style="width: 100%" />
        </NFormItem>
        <NFormItem label="Hạn thanh toán" path="dueDate">
          <NDatePicker v-model:value="formData.dueDate" type="date" placeholder="Chọn ngày" style="width: 100%" />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showModal = false">Hủy</NButton>
        <NButton type="primary" @click="handleSave">Lưu</NButton>
      </template>
    </NModal>

    <NModal v-model:show="showRevenueModal" title="Báo cáo doanh thu" preset="card" style="width: 800px">
      <div v-if="revenueReport">
        <NGrid :cols="3" :x-gap="12">
          <NGridItem>
            <NStatistic label="Tổng doanh thu" :value="new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueReport.totalRevenue)" />
          </NGridItem>
          <NGridItem>
            <NStatistic label="Tổng đơn hàng" :value="revenueReport.totalOrders" />
          </NGridItem>
          <NGridItem>
            <NStatistic label="Giá trị đơn hàng trung bình" :value="new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueReport.averageOrderValue)" />
          </NGridItem>
        </NGrid>
        <NDivider />
        <div v-if="revenueReport.dailyRevenue && revenueReport.dailyRevenue.length > 0">
          <h3 class="text-lg font-semibold mb-2">Doanh thu theo ngày</h3>
          <NDataTable
            :columns="[
              { title: 'Ngày', key: 'date', render: (row) => new Date(row.date).toLocaleDateString('vi-VN') },
              { title: 'Doanh thu', key: 'revenue', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.revenue) },
              { title: 'Số đơn', key: 'orders' },
            ]"
            :data="revenueReport.dailyRevenue"
            :bordered="true"
          />
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
</style>

