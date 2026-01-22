<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NSelect,
  NDatePicker,
  useMessage,
  NIcon,
  NTag,
  NDivider,
  NStatistic,
  NGrid,
  NGridItem,
} from 'naive-ui';
import { Plus, Pencil, TrendingUp } from '@vicons/tabler';
import InvoiceService from '@/core/services/api/invoice.service';
import OrderService from '@/core/services/api/order.service';
import { InvoiceStatus } from '@/domain/models/invoice.model';
import type { Invoice, RevenueReport, CreateInvoiceRequest, UpdateInvoiceRequest } from '@/domain/models/invoice.model';
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

type InvoiceForm = {
  orderId: number;
  amount: number;
  tax?: number;
  discount?: number;
  dueDate: number | null;
};

const formData = ref<InvoiceForm>({
  orderId: 0,
  amount: 0,
  tax: 0,
  discount: 0,
  dueDate: null,
});

const invoiceStatusOptions: { label: string; value: InvoiceStatus }[] = [
  { label: 'Nháp', value: InvoiceStatus.DRAFT },
  { label: 'Đã phát hành', value: InvoiceStatus.ISSUED },
  { label: 'Đã thanh toán', value: InvoiceStatus.PAID },
  { label: 'Đã hủy', value: InvoiceStatus.CANCELLED },
];

const getStatusTagType = (
  status: InvoiceStatus
): 'default' | 'error' | 'success' | 'warning' | 'primary' | 'info' => {
  const statusMap: Record<InvoiceStatus, 'default' | 'error' | 'success' | 'warning' | 'primary' | 'info'> = {
    [InvoiceStatus.DRAFT]: 'default',
    [InvoiceStatus.ISSUED]: 'info',
    [InvoiceStatus.PAID]: 'success',
    [InvoiceStatus.CANCELLED]: 'error',
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
    render: (row: Invoice) => row.order?.orderNumber || row.orderId,
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
          circle: true,
          tertiary: true,
          quaternary: true,
          onClick: () => handleEdit(row),
        }, { icon: () => h(NIcon, null, { default: () => h(Pencil) }) }),
      ];
    },
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

const loadOrders = async () => {
  try {
    const response = await OrderService.getOrders({
      page: 0,
      size: 100,
    });
    orders.value = response.orders;
  } catch (error: any) {
    message.error('Lỗi khi tải danh sách đơn hàng');
  }
};

const loadRevenueReport = async () => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const report = await InvoiceService.getRevenueReport({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    revenueReport.value = report;
    showRevenueModal.value = true;
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
    dueDate: null,
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
      dueDate: fullInvoice.dueDate ? new Date(fullInvoice.dueDate).getTime() : null,
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
    
    const submitData: CreateInvoiceRequest | UpdateInvoiceRequest = {
      orderId: formData.value.orderId,
      amount: formData.value.amount,
      tax: formData.value.tax,
      discount: formData.value.discount,
      dueDate: formData.value.dueDate
        ? new Date(formData.value.dueDate).toISOString().slice(0, 19)
        : undefined,
    };

    if (editingInvoice.value) {
      await InvoiceService.updateInvoice(editingInvoice.value.id, submitData as UpdateInvoiceRequest);
      message.success('Cập nhật hóa đơn thành công');
    } else {
      await InvoiceService.createInvoice(submitData as CreateInvoiceRequest);
      message.success('Tạo hóa đơn thành công');
    }
    showModal.value = false;
    await loadInvoices();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lưu hóa đơn');
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
            :options="orders.map(o => ({ label: `${o.orderCode || `#${o.id}`} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}`, value: o.id }))"
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

