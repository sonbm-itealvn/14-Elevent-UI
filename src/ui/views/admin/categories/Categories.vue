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
  NTreeSelect,
  NInputNumber
} from 'naive-ui';
import { Plus, Pencil, Trash } from '@vicons/tabler';
import CategoryService from '@/core/services/api/category.service';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/domain/models/category.model';

const message = useMessage();

const loading = ref(false);
const categories = ref<Category[]>([]);
const categoryTree = ref<any[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const showModal = ref(false);
const modalTitle = ref('Tạo danh mục mới');
const editingCategory = ref<Category | null>(null);
const formRef = ref();

const formData = ref<CreateCategoryRequest>({
  name: '',
  slug: '',
  description: '',
  parentId: undefined,
  active: true,
});

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Tên',
    key: 'name',
    width: 200,
  },
  {
    title: 'Slug',
    key: 'slug',
    width: 200,
  },
  {
    title: 'Mô tả',
    key: 'description',
    width: 300,
  },
  {
    title: 'Danh mục cha',
    key: 'parent',
    width: 150,
    render: (row: Category) => row.parent?.name || '-',
  },
  {
    title: 'Trạng thái',
    key: 'active',
    width: 120,
    render: (row: Category) => {
      return h(NSwitch, {
        value: row.active,
        disabled: true,
      });
    },
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 200,
    render: (row: Category) => {
      return [
        h(NButton, {
          size: 'small',
          type: 'primary',
          style: { marginRight: '8px' },
          onClick: () => handleEdit(row),
        }, { default: () => 'Sửa', icon: () => h(NIcon, null, { default: () => h(Pencil) }) }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row.id),
        }, {
          trigger: () => h(NButton, {
            size: 'small',
            type: 'error',
          }, { default: () => 'Xóa', icon: () => h(NIcon, null, { default: () => h(Trash) }) }),
          default: () => 'Bạn có chắc muốn xóa danh mục này?',
        }),
      ];
    },
  },
];

const buildTreeOptions = (categories: Category[]): any[] => {
  return categories.map(cat => ({
    label: cat.name,
    value: cat.id,
    key: cat.id,
    children: cat.children ? buildTreeOptions(cat.children) : undefined,
  }));
};

// Mock data for UI preview
const mockCategories: Category[] = [
  { id: 1, name: 'Điện tử', slug: 'dien-tu', description: 'Sản phẩm điện tử', active: true },
  { id: 2, name: 'Quần áo', slug: 'quan-ao', description: 'Thời trang quần áo', active: true },
  { id: 3, name: 'Đồ ăn', slug: 'do-an', description: 'Thực phẩm và đồ ăn', active: true },
  { id: 4, name: 'Điện thoại', slug: 'dien-thoai', description: 'Điện thoại di động', parentId: 1, active: true },
  { id: 5, name: 'Laptop', slug: 'laptop', description: 'Máy tính xách tay', parentId: 1, active: true },
];

const loadCategories = async () => {
  try {
    loading.value = true;
    
    // Real API call
    const tree = await CategoryService.getCategoryTree();
    categoryTree.value = buildTreeOptions(tree);
    const flatten = (cats: any[]): Category[] => {
      let result: Category[] = [];
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children) {
          result = result.concat(flatten(cat.children));
        }
      });
      return result;
    };
    categories.value = flatten(tree);
    pagination.value.total = categories.value.length;
    loading.value = false;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách danh mục');
    loading.value = false;
  }
};

const handleCreate = () => {
  editingCategory.value = null;
  formData.value = {
    name: '',
    slug: '',
    description: '',
    parentId: undefined,
    active: true,
  };
  modalTitle.value = 'Tạo danh mục mới';
  showModal.value = true;
};

const handleEdit = (category: Category) => {
  editingCategory.value = category;
  formData.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    parentId: category.parentId,
    active: category.active,
  };
  modalTitle.value = 'Chỉnh sửa danh mục';
  showModal.value = true;
};

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const handleNameChange = () => {
  if (!editingCategory.value && formData.value.name) {
    formData.value.slug = generateSlug(formData.value.name);
  }
};

const handleSave = async () => {
  try {
    await formRef.value?.validate();
    
    // Real API call
    if (formData.value.slug) {
      const slugCheck = await CategoryService.checkSlug(
        formData.value.slug,
        editingCategory.value?.id
      );
      if (!slugCheck.available) {
        message.error('Slug đã tồn tại, vui lòng chọn slug khác');
        return;
      }
    }
    if (editingCategory.value) {
      await CategoryService.updateCategory(editingCategory.value.id, formData.value as UpdateCategoryRequest);
      message.success('Cập nhật danh mục thành công');
    } else {
      await CategoryService.createCategory(formData.value);
      message.success('Tạo danh mục thành công');
    }
    showModal.value = false;
    await loadCategories();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lưu danh mục');
  }
};

const handleDelete = async (categoryId: number) => {
  try {
    // Real API call
    await CategoryService.deleteCategory(categoryId);
    message.success('Xóa danh mục thành công');
    await loadCategories();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi xóa danh mục');
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý danh mục</h1>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon><Plus /></NIcon>
        </template>
        Thêm danh mục
      </NButton>
    </div>

    <NDataTable
      :columns="columns"
      :data="categories"
      :loading="loading"
      :pagination="pagination"
      @update:page="(page) => { pagination.page = page; }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; }"
      striped
      bordered
    />

    <NModal v-model:show="showModal" :title="modalTitle" preset="dialog" style="width: 600px">
      <NForm ref="formRef" :model="formData" label-placement="left" label-width="120">
        <NFormItem label="Tên danh mục" path="name" :rule="{ required: true, message: 'Vui lòng nhập tên danh mục' }">
          <NInput v-model:value="formData.name" placeholder="Nhập tên danh mục" @update:value="handleNameChange" />
        </NFormItem>
        <NFormItem label="Slug" path="slug" :rule="{ required: true, message: 'Vui lòng nhập slug' }">
          <NInput v-model:value="formData.slug" placeholder="Nhập slug" />
        </NFormItem>
        <NFormItem label="Mô tả" path="description">
          <NInput v-model:value="formData.description" type="textarea" placeholder="Nhập mô tả" :rows="3" />
        </NFormItem>
        <NFormItem label="Danh mục cha" path="parentId">
          <NTreeSelect
            v-model:value="formData.parentId"
            :options="categoryTree"
            placeholder="Chọn danh mục cha (tùy chọn)"
            clearable
            :default-expand-all="true"
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
  </div>
</template>

<style scoped>
</style>

