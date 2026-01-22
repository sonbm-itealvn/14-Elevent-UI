<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSwitch,
  NPopconfirm,
  useMessage,
  NIcon,
  NSelect,
  NInputNumber,
  NDatePicker,
  NTag,
  NCard,
  NStatistic,
  NDivider,
} from 'naive-ui';
import { Plus, Pencil, Trash, Eye, Calendar } from '@vicons/tabler';
import VoucherService from '@/core/services/api/voucher.service';
import type {
  Voucher,
  DiscountType,
  VoucherUsageStatsResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
} from '@/domain/models/voucher.model';

const message = useMessage();

const loading = ref(false);
const vouchers = ref<Voucher[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// Filters
const filters = ref<{
  code: string;
  active?: boolean;
  startDateFrom: number | null;
  startDateTo: number | null;
}>({
  code: '',
  active: undefined,
  startDateFrom: null,
  startDateTo: null,
});

const showModal = ref(false);
const showDetailModal = ref(false);
const showUsageModal = ref(false);
const modalTitle = ref('Tạo voucher mới');
const editingVoucher = ref<Voucher | null>(null);
const viewingVoucher = ref<Voucher | null>(null);
const usageStats = ref<VoucherUsageStatsResponse | null>(null);
const formRef = ref();

type VoucherForm = {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: number | null;
  endDate: number | null;
  quantity: number;
  usageLimitPerUser?: number;
  active: boolean;
};

const formData = ref<VoucherForm>({
  code: '',
  discountType: 'PERCENT',
  discountValue: 0,
  minOrder: undefined,
  maxDiscount: undefined,
  startDate: null,
  endDate: null,
  quantity: 0,
  usageLimitPerUser: undefined,
  active: true,
});

const discountTypeOptions = [
  { label: 'Phần trăm (%)', value: 'PERCENT' },
  { label: 'Số tiền cố định', value: 'AMOUNT' },
];

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Mã voucher',
    key: 'code',
    width: 150,
    render: (row: Voucher) => {
      return h('div', { class: 'font-mono font-semibold' }, row.code);
    },
  },
  {
    title: 'Loại giảm giá',
    key: 'discountType',
    width: 120,
    render: (row: Voucher) => {
      return row.discountType === 'PERCENT'
        ? h(NTag, { type: 'info' }, { default: () => `${row.discountValue}%` })
        : h(
            NTag,
            { type: 'success' },
            {
              default: () =>
                new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(row.discountValue),
            }
          );
    },
  },
  {
    title: 'Đơn hàng tối thiểu',
    key: 'minOrder',
    width: 150,
    render: (row: Voucher) =>
      row.minOrder
        ? new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(row.minOrder)
        : '-',
  },
  {
    title: 'Số lượng',
    key: 'quantity',
    width: 120,
    render: (row: Voucher) => {
      const remaining = row.remainingQuantity ?? row.quantity;
      return h('div', [
        h('span', { class: remaining === 0 ? 'text-red-500' : '' }, remaining),
        h('span', { class: 'text-gray-400 ml-1' }, `/ ${row.quantity}`),
      ]);
    },
  },
  {
    title: 'Thời gian hiệu lực',
    key: 'dateRange',
    width: 200,
    render: (row: Voucher) => {
      const start = new Date(row.startDate).toLocaleDateString('vi-VN');
      const end = new Date(row.endDate).toLocaleDateString('vi-VN');
      return h('div', { class: 'text-sm' }, `${start} - ${end}`);
    },
  },
  {
    title: 'Trạng thái',
    key: 'active',
    width: 120,
    render: (row: Voucher) => {
      return h(NSwitch, {
        value: row.active,
        onUpdateValue: (value: boolean) => handleToggleActive(row.id, value),
      });
    },
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 250,
    render: (row: Voucher) => {
      return [
        h(
          NButton,
          {
            size: 'small',
            circle: true,
            tertiary: true,
            quaternary: true,
            style: { marginRight: '6px' },
            onClick: () => handleViewDetail(row),
          },
          {
            icon: () => h(NIcon, null, { default: () => h(Eye) }),
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            circle: true,
            tertiary: true,
            quaternary: true,
            style: { marginRight: '6px' },
            onClick: () => handleEdit(row),
          },
          {
            icon: () => h(NIcon, null, { default: () => h(Pencil) }),
          }
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id),
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  circle: true,
                  type: 'error',
                  quaternary: true,
                },
                {
                  icon: () => h(NIcon, null, { default: () => h(Trash) }),
                }
              ),
            default: () => 'Bạn có chắc muốn xóa voucher này?',
          }
        ),
      ];
    },
  },
];

const loadVouchers = async () => {
  try {
    loading.value = true;
    const params: any = {
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
    };

    if (filters.value.code) {
      params.code = filters.value.code;
    }
    if (filters.value.active !== undefined) {
      params.active = filters.value.active;
    }
    if (filters.value.startDateFrom) {
      params.startDateFrom = new Date(filters.value.startDateFrom).toISOString().slice(0, 19);
    }
    if (filters.value.startDateTo) {
      params.startDateTo = new Date(filters.value.startDateTo).toISOString().slice(0, 19);
    }

    const response = await VoucherService.getVouchers(params);
    vouchers.value = response.content;
    pagination.value.total = response.totalElements;
    loading.value = false;
  } catch (error: any) {
    message.error(
      error.response?.data?.message || 'Lỗi khi tải danh sách voucher'
    );
    loading.value = false;
  }
};

const handleCreate = () => {
  editingVoucher.value = null;
  formData.value = {
    code: '',
    discountType: 'PERCENT',
    discountValue: 0,
    minOrder: undefined,
    maxDiscount: undefined,
    startDate: null,
    endDate: null,
    quantity: 0,
    usageLimitPerUser: undefined,
    active: true,
  };
  modalTitle.value = 'Tạo voucher mới';
  showModal.value = true;
};

const handleEdit = async (voucher: Voucher) => {
  try {
    const fullVoucher = await VoucherService.getVoucherById(voucher.id);
    editingVoucher.value = fullVoucher;
    formData.value = {
      code: fullVoucher.code,
      discountType: fullVoucher.discountType,
      discountValue: fullVoucher.discountValue,
      minOrder: fullVoucher.minOrder,
      maxDiscount: fullVoucher.maxDiscount,
      startDate: new Date(fullVoucher.startDate).getTime(),
      endDate: new Date(fullVoucher.endDate).getTime(),
      quantity: fullVoucher.quantity,
      usageLimitPerUser: fullVoucher.usageLimitPerUser,
      active: fullVoucher.active,
    };
    modalTitle.value = 'Chỉnh sửa voucher';
    showModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải thông tin voucher');
  }
};

const handleViewDetail = async (voucher: Voucher) => {
  try {
    const fullVoucher = await VoucherService.getVoucherById(voucher.id);
    viewingVoucher.value = fullVoucher;
    showDetailModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải thông tin voucher');
  }
};

const handleViewUsage = async (voucher: Voucher) => {
  try {
    const stats = await VoucherService.getUsageStats(voucher.id, {
      page: 0,
      size: 20,
    });
    usageStats.value = stats;
    viewingVoucher.value = voucher;
    showUsageModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải thống kê sử dụng');
  }
};

const handleSave = async () => {
  try {
    await formRef.value?.validate();

    if (!formData.value.startDate || !formData.value.endDate) {
      message.error('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    const submitData: CreateVoucherRequest | UpdateVoucherRequest = {
      code: formData.value.code,
      discountType: formData.value.discountType,
      discountValue: formData.value.discountValue,
      minOrder: formData.value.minOrder,
      maxDiscount: formData.value.maxDiscount,
      startDate: new Date(formData.value.startDate).toISOString().slice(0, 19),
      endDate: new Date(formData.value.endDate).toISOString().slice(0, 19),
      quantity: formData.value.quantity,
      usageLimitPerUser: formData.value.usageLimitPerUser,
      active: formData.value.active,
    };

    if (editingVoucher.value) {
      await VoucherService.updateVoucher(editingVoucher.value.id, submitData as UpdateVoucherRequest);
      message.success('Cập nhật voucher thành công');
    } else {
      await VoucherService.createVoucher(submitData as CreateVoucherRequest);
      message.success('Tạo voucher thành công');
    }
    showModal.value = false;
    await loadVouchers();
  } catch (error: any) {
    message.error(
      error.response?.data?.message || 'Lỗi khi lưu voucher'
    );
  }
};

const handleDelete = async (voucherId: number) => {
  try {
    await VoucherService.deleteVoucher(voucherId);
    message.success('Xóa voucher thành công');
    await loadVouchers();
  } catch (error: any) {
    message.error(
      error.response?.data?.message || 'Lỗi khi xóa voucher'
    );
  }
};

const handleToggleActive = async (voucherId: number, active: boolean) => {
  try {
    await VoucherService.toggleActive(voucherId, { active });
    message.success(
      active ? 'Kích hoạt voucher thành công' : 'Vô hiệu hóa voucher thành công'
    );
    await loadVouchers();
  } catch (error: any) {
    message.error('Lỗi khi cập nhật trạng thái');
  }
};

const handleFilter = () => {
  pagination.value.page = 1;
  loadVouchers();
};

const handleResetFilter = () => {
  filters.value = {
    code: '',
    active: undefined,
    startDateFrom: null,
    startDateTo: null,
  };
  pagination.value.page = 1;
  loadVouchers();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN');
};

// Format number with thousand separator
const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value) || value === 0) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
};

// Parse formatted number back to number
const parseNumber = (value: string): string => {
  if (!value) return '';
  return value.replace(/\s?₫/g, '').replace(/\./g, '').replace(/,/g, '').trim();
};

// Handle input change for currency fields
const handleCurrencyInput = (field: 'minOrder' | 'maxDiscount' | 'discountValue', value: string) => {
  const parsed = parseNumber(value);
  const numValue = parsed ? Number(parsed) : (field === 'minOrder' ? 0 : undefined);
  if (field === 'minOrder') {
    formData.value.minOrder = numValue as number;
  } else if (field === 'maxDiscount') {
    formData.value.maxDiscount = numValue;
  } else if (field === 'discountValue' && formData.value.discountType === 'AMOUNT') {
    formData.value.discountValue = numValue as number;
  }
};

onMounted(() => {
  loadVouchers();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý voucher</h1>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon><Plus /></NIcon>
        </template>
        Thêm voucher
      </NButton>
    </div>

    <!-- Filters -->
    <NCard class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NInput
          v-model:value="filters.code"
          placeholder="Tìm kiếm mã voucher"
          clearable
          @keyup.enter="handleFilter"
        />
        <NSelect
          v-model:value="(filters.active as any)"
          placeholder="Trạng thái"
          clearable
          :options="[
            { label: 'Đang hoạt động', value: true },
            { label: 'Đã tắt', value: false },
          ] as any"
        />
        <NDatePicker
          v-model:value="filters.startDateFrom"
          type="datetime"
          placeholder="Ngày bắt đầu từ"
          clearable
        />
        <NDatePicker
          v-model:value="filters.startDateTo"
          type="datetime"
          placeholder="Ngày bắt đầu đến"
          clearable
        />
      </div>
      <div class="flex gap-2 mt-4">
        <NButton type="primary" @click="handleFilter">Lọc</NButton>
        <NButton @click="handleResetFilter">Đặt lại</NButton>
      </div>
    </NCard>

    <NDataTable
      :columns="columns"
      :data="vouchers"
      :loading="loading"
      :pagination="pagination"
      :row-class-name="(row: Voucher) => !row.active ? 'inactive-row' : ''"
      @update:page="(page) => { pagination.page = page; loadVouchers(); }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadVouchers(); }"
      striped
      bordered
    />

    <!-- Create/Edit Modal -->
    <NModal
      v-model:show="showModal"
      :title="modalTitle"
      preset="dialog"
      style="width: 800px"
    >
      <NForm
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="180"
      >
        <NFormItem
          label="Mã voucher"
          path="code"
          :rule="{
            required: true,
            message: 'Vui lòng nhập mã voucher',
            trigger: 'blur',
          }"
        >
          <NInput
            v-model:value="formData.code"
            placeholder="Nhập mã voucher (3-50 ký tự)"
            :disabled="!!editingVoucher"
          />
        </NFormItem>
        <NFormItem
          label="Loại giảm giá"
          path="discountType"
          :rule="{
            required: true,
            message: 'Vui lòng chọn loại giảm giá',
          }"
        >
          <NSelect
            v-model:value="formData.discountType"
            :options="discountTypeOptions"
          />
        </NFormItem>
        <NFormItem
          label="Giá trị giảm giá"
          path="discountValue"
          :rule="{
            required: true,
            type: 'number',
            min: 0.01,
            message: 'Vui lòng nhập giá trị giảm giá',
          }"
        >
          <div class="flex items-center gap-2" style="width: 100%">
            <NInputNumber
              v-if="formData.discountType === 'PERCENT'"
              v-model:value="formData.discountValue"
              :min="0.01"
              :max="100"
              :precision="2"
              :show-button="false"
              style="flex: 1"
              placeholder="Nhập % (1-100)"
            />
            <NInput
              v-else
              :value="formData.discountValue ? formatNumber(formData.discountValue) : ''"
              @update:value="(val) => handleCurrencyInput('discountValue', val)"
              placeholder="Nhập số tiền"
              style="flex: 1"
              type="text"
            />
            <span v-if="formData.discountType === 'PERCENT'" class="text-gray-600 font-medium min-w-[30px]">%</span>
            <span v-else class="text-gray-600 font-medium min-w-[30px]">₫</span>
          </div>
        </NFormItem>
        <NFormItem
          v-if="formData.discountType === 'PERCENT'"
          label="Giảm giá tối đa"
          path="maxDiscount"
          :rule="{
            type: 'number',
            min: 0.01,
            message: 'Vui lòng nhập giảm giá tối đa',
          }"
        >
          <div class="flex items-center gap-2" style="width: 100%">
            <NInput
              :value="formData.maxDiscount ? formatNumber(formData.maxDiscount) : ''"
              @update:value="(val) => handleCurrencyInput('maxDiscount', val)"
              placeholder="Nhập số tiền tối đa được giảm"
              style="flex: 1"
              type="text"
            />
            <span class="text-gray-600 font-medium min-w-[30px]">₫</span>
          </div>
        </NFormItem>
        <NFormItem label="Đơn hàng tối thiểu" path="minOrder">
          <div class="flex items-center gap-2" style="width: 100%">
            <NInputNumber
              v-model:value="formData.minOrder"
              :min="0"
              :precision="0"
              :show-button="false"
              style="flex: 1"
              placeholder="Nhập đơn hàng tối thiểu (0 = không giới hạn)"
              :formatter="(value: string) => formatNumber(Number(value))"
              :parser="(value: string) => parseNumber(value)"
            />
            <span class="text-gray-600 font-medium min-w-[30px]">₫</span>
          </div>
        </NFormItem>
        <NFormItem
          label="Ngày bắt đầu"
          path="startDate"
          :rule="{
            required: true,
            message: 'Vui lòng chọn ngày bắt đầu',
          }"
        >
          <NDatePicker
            v-model:value="formData.startDate"
            type="datetime"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem
          label="Ngày kết thúc"
          path="endDate"
          :rule="{
            required: true,
            message: 'Vui lòng chọn ngày kết thúc',
          }"
        >
          <NDatePicker
            v-model:value="formData.endDate"
            type="datetime"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem
          label="Số lượng"
          path="quantity"
          :rule="{
            required: true,
            type: 'number',
            min: 0,
            message: 'Vui lòng nhập số lượng',
          }"
        >
          <NInputNumber
            v-model:value="formData.quantity"
            :min="0"
            :precision="0"
            :show-button="false"
            style="width: 100%"
            placeholder="Nhập số lượng voucher"
          />
        </NFormItem>
        <NFormItem label="Giới hạn sử dụng/user" path="usageLimitPerUser">
          <NInputNumber
            v-model:value="formData.usageLimitPerUser"
            :min="1"
            :precision="0"
            :show-button="false"
            style="width: 100%"
            placeholder="Nhập giới hạn (để trống = không giới hạn)"
          />
        </NFormItem>
        <NFormItem label="Trạng thái" path="active">
          <NSwitch v-model:value="formData.active" />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showModal = false">Hủy</NButton>
        <NButton type="primary" @click="handleSave">Lưu</NButton>
      </template>
    </NModal>

    <!-- Detail Modal -->
    <NModal
      v-model:show="showDetailModal"
      title="Chi tiết voucher"
      preset="dialog"
      style="width: 700px"
    >
      <div v-if="viewingVoucher" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <NStatistic label="Mã voucher" :value="viewingVoucher.code" />
          <NStatistic
            label="Loại giảm giá"
            :value="viewingVoucher.discountType === 'PERCENT' ? 'Phần trăm' : 'Số tiền'"
          />
        </div>
        <NDivider />
        <div class="grid grid-cols-2 gap-4">
          <div>
            <strong>Giá trị giảm giá:</strong>
            <span v-if="viewingVoucher.discountType === 'PERCENT'">
              {{ viewingVoucher.discountValue }}%
            </span>
            <span v-else>
              {{
                new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(viewingVoucher.discountValue)
              }}
            </span>
          </div>
          <div v-if="viewingVoucher.maxDiscount">
            <strong>Giảm giá tối đa:</strong>
            {{
              new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(viewingVoucher.maxDiscount)
            }}
          </div>
          <div v-if="viewingVoucher.minOrder">
            <strong>Đơn hàng tối thiểu:</strong>
            {{
              new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(viewingVoucher.minOrder)
            }}
          </div>
          <div>
            <strong>Giới hạn/user:</strong>
            {{ viewingVoucher.usageLimitPerUser ?? 'Không giới hạn' }}
          </div>
        </div>
        <NDivider />
        <div>
          <strong>Thời gian hiệu lực:</strong>
          <div class="mt-2">
            <div>Từ: {{ formatDate(viewingVoucher.startDate) }}</div>
            <div>Đến: {{ formatDate(viewingVoucher.endDate) }}</div>
          </div>
        </div>
        <NDivider />
        <div class="grid grid-cols-3 gap-4">
          <NStatistic
            label="Tổng số lượng"
            :value="viewingVoucher.quantity"
          />
          <NStatistic
            label="Đã sử dụng"
            :value="viewingVoucher.totalUsage ?? 0"
          />
          <NStatistic
            label="Còn lại"
            :value="viewingVoucher.remainingQuantity ?? viewingVoucher.quantity"
          />
        </div>
        <div class="flex gap-2">
          <NButton type="info" @click="handleViewUsage(viewingVoucher)">
            <template #icon>
              <NIcon><Calendar /></NIcon>
            </template>
            Xem thống kê sử dụng
          </NButton>
        </div>
      </div>
      <template #action>
        <NButton @click="showDetailModal = false">Đóng</NButton>
      </template>
    </NModal>

    <!-- Usage Stats Modal -->
    <NModal
      v-model:show="showUsageModal"
      title="Thống kê sử dụng voucher"
      preset="dialog"
      style="width: 900px"
    >
      <div v-if="usageStats && viewingVoucher">
        <div class="mb-4">
          <NStatistic
            label="Tổng số lần sử dụng"
            :value="usageStats.totalUsage"
          />
        </div>
        <NDivider />
        <NDataTable
          :columns="[
            { title: 'Email', key: 'userEmail', width: 200 },
            { title: 'User ID', key: 'userId', width: 100 },
            { title: 'Order ID', key: 'orderId', width: 100 },
            {
              title: 'Số tiền giảm',
              key: 'discountAmount',
              width: 150,
              render: (row) =>
                new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(row.discountAmount),
            },
            {
              title: 'Thời gian',
              key: 'usedAt',
              width: 180,
              render: (row) => formatDate(row.usedAt),
            },
          ]"
          :data="usageStats.recentUsage"
          :pagination="false"
        />
      </div>
      <template #action>
        <NButton @click="showUsageModal = false">Đóng</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
:deep(.inactive-row) {
  background-color: rgba(0, 0, 0, 0.02) !important;
  opacity: 0.7;
}

:deep(.inactive-row:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
  opacity: 0.8;
}
</style>

