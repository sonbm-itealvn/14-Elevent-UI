<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
  NTag,
  NPopconfirm,
  useMessage,
  NIcon,
} from 'naive-ui';
import { Plus, Pencil, Trash } from '@vicons/tabler';
import UserService from '@/core/services/api/user.service';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/domain/models/user.model';

const message = useMessage();

const loading = ref(false);
const users = ref<User[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const showModal = ref(false);
const modalTitle = ref('Tạo người dùng mới');
const editingUser = ref<User | null>(null);
const formRef = ref();

const formData = ref<CreateUserRequest>({
  email: '',
  password: '',
  fullName: '',
  phone: '',
  role: 'CUSTOMER',
  active: true,
});

const roleOptions = [
  { label: 'Customer', value: 'CUSTOMER' },
  { label: 'Admin', value: 'ADMIN' },
];

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Email',
    key: 'email',
    width: 200,
  },
  {
    title: 'Họ tên',
    key: 'fullName',
    width: 200,
  },
  {
    title: 'Số điện thoại',
    key: 'phone',
    width: 150,
  },
  {
    title: 'Vai trò',
    key: 'role',
    width: 150,
    render: (row: User) => {
      return h(NTag, { type: row.role === 'ADMIN' ? 'error' : 'info' }, { default: () => row.role });
    },
  },
  {
    title: 'Trạng thái',
    key: 'active',
    width: 120,
    render: (row: User) => {
      return h(NSwitch, {
        value: row.active,
        onUpdateValue: (value: boolean) => handleToggleActive(row.id, value),
      });
    },
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 200,
    render: (row: User) => {
      return [
        h(NButton, {
          size: 'small',
          circle: true,
          tertiary: true,
          quaternary: true,
          style: { marginRight: '6px' },
          onClick: () => handleEdit(row),
        }, { icon: () => h(NIcon, null, { default: () => h(Pencil) }) }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row.id),
        }, {
          trigger: () => h(NButton, {
            size: 'small',
            circle: true,
            type: 'error',
            quaternary: true,
          }, { icon: () => h(NIcon, null, { default: () => h(Trash) }) }),
          default: () => 'Bạn có chắc muốn xóa người dùng này?',
        }),
      ];
    },
  },
];

const loadUsers = async () => {
  try {
    loading.value = true;
    
    // Real API call
    const response = await UserService.getUsers({
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
    });
    users.value = response.content;
    pagination.value.total = response.totalElements;
    loading.value = false;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách người dùng');
    loading.value = false;
  }
};

const handleCreate = () => {
  editingUser.value = null;
  formData.value = {
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'CUSTOMER',
    active: true,
  };
  modalTitle.value = 'Tạo người dùng mới';
  showModal.value = true;
};

const handleEdit = (user: User) => {
  editingUser.value = user;
  formData.value = {
    email: user.email,
    password: '',
    fullName: user.fullName,
    phone: user.phone || '',
    role: user.role,
    active: user.active,
  };
  modalTitle.value = 'Chỉnh sửa người dùng';
  showModal.value = true;
};

const handleSave = async () => {
  try {
    await formRef.value?.validate();
    
    // Real API call
    if (editingUser.value) {
      const { password, email, ...updateData } = formData.value;
      await UserService.updateUser(editingUser.value.id, updateData as UpdateUserRequest);
      message.success('Cập nhật người dùng thành công');
    } else {
      await UserService.createUser(formData.value);
      message.success('Tạo người dùng thành công');
    }
    showModal.value = false;
    await loadUsers();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lưu người dùng');
  }
};

const handleDelete = async (userId: number) => {
  try {
    // Real API call
    await UserService.toggleActive(userId, { active: false });
    message.success('Vô hiệu hóa người dùng thành công');
    await loadUsers();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi vô hiệu hóa người dùng');
  }
};

const handleToggleActive = async (userId: number, active: boolean) => {
  try {
    // Real API call
    await UserService.toggleActive(userId, { active });
    message.success(active ? 'Kích hoạt người dùng thành công' : 'Vô hiệu hóa người dùng thành công');
    await loadUsers();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý người dùng</h1>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon><Plus /></NIcon>
        </template>
        Thêm người dùng
      </NButton>
    </div>

    <NDataTable
      :columns="columns"
      :data="users"
      :loading="loading"
      :pagination="pagination"
      @update:page="(page) => { pagination.page = page; loadUsers(); }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadUsers(); }"
      striped
      bordered
    />

    <NModal v-model:show="showModal" :title="modalTitle" preset="dialog" style="width: 600px">
      <NForm ref="formRef" :model="formData" label-placement="left" label-width="120">
        <NFormItem label="Email" path="email" :rule="{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }">
          <NInput v-model:value="formData.email" placeholder="Nhập email" />
        </NFormItem>
        <NFormItem v-if="!editingUser" label="Mật khẩu" path="password" :rule="{ required: true, message: 'Vui lòng nhập mật khẩu' }">
          <NInput v-model:value="formData.password" type="password" placeholder="Nhập mật khẩu" />
        </NFormItem>
        <NFormItem label="Họ tên" path="fullName" :rule="{ required: true, message: 'Vui lòng nhập họ tên' }">
          <NInput v-model:value="formData.fullName" placeholder="Nhập họ tên" />
        </NFormItem>
        <NFormItem label="Số điện thoại" path="phone">
          <NInput v-model:value="formData.phone" placeholder="Nhập số điện thoại" />
        </NFormItem>
        <NFormItem label="Vai trò" path="role">
          <NSelect v-model:value="formData.role" :options="roleOptions" placeholder="Chọn vai trò" />
        </NFormItem>
      </NForm>
      <template #action>
        <NButton @click="showModal = false">Hủy</NButton>
        <NButton type="primary" @click="handleSave">Lưu</NButton>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
</style>

