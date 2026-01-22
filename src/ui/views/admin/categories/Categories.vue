<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue';
import {
  NDataTable,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NPopconfirm,
  useMessage,
  NIcon,
  NSelect,
  NTreeSelect,
  NTree,
} from 'naive-ui';
import { Plus, Pencil, Trash } from '@vicons/tabler';
import CategoryService from '@/core/services/api/category.service';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/domain/models/category.model';

const message = useMessage();

const loading = ref(false);
const categories = ref<Category[]>([]);
const categoryTree = ref<any[]>([]);
const parentFilterOptions = ref<{ label: string; value: number | null }[]>([]);
const selectedParentFilter = ref<number | null>(null);
const searchKeyword = ref('');
const selectedTreeKey = ref<number[]>([]);
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
  parentId: undefined,
});

const columns = [
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
    title: 'Thao tác',
    key: 'actions',
    width: 200,
    render: (row: Category) => {
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
          default: () => 'Bạn có chắc muốn xóa danh mục này?',
        }),
      ];
    },
  },
];

const buildTreeOptions = (categories: Category[]): any[] => {
  return categories.map(cat => ({
    label: cat.children?.length ? `${cat.name} (${cat.children.length})` : cat.name,
    value: cat.id,
    key: cat.id,
    children: cat.children ? buildTreeOptions(cat.children) : undefined,
  }));
};

const buildParentPath = (cat: Category, map: Map<number, Category>): string => {
  const path: string[] = [];
  let current: Category | undefined = cat;
  while (current?.parentId) {
    const parent = map.get(current.parentId);
    if (!parent) break;
    path.unshift(parent.name);
    current = parent;
  }
  return path.join(' / ');
};

const loadCategories = async () => {
  try {
    loading.value = true;
    
    // Real API call
    const tree = await CategoryService.getCategoryTree();
    categoryTree.value = buildTreeOptions(tree);
    const flatten = (cats: any[], parentMap: Map<number, Category>): Category[] => {
      let result: Category[] = [];
      cats.forEach((cat: Category) => {
        parentMap.set(cat.id, cat);
        result.push(cat);
        if ((cat as any).children) {
          result = result.concat(flatten((cat as any).children, parentMap));
        }
      });
      return result;
    };
    const parentMap = new Map<number, Category>();
    const flat = flatten(tree, parentMap);
    categories.value = flat.map(cat => ({
      ...cat,
      parentPath: buildParentPath(cat, parentMap),
    })) as any;

    // Parent filter options
    parentFilterOptions.value = [
      { label: 'Tất cả', value: null },
      ...tree.map((cat: Category) => ({ label: cat.name, value: cat.id })),
    ];
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
    parentId: undefined,
  };
  modalTitle.value = 'Tạo danh mục mới';
  showModal.value = true;
};

const handleEdit = (category: Category) => {
  editingCategory.value = category;
  formData.value = {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
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

const filteredCategories = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  return categories.value.filter(cat => {
    const matchKeyword =
      !keyword ||
      cat.name.toLowerCase().includes(keyword) ||
      cat.slug.toLowerCase().includes(keyword);
    const matchParent =
      selectedParentFilter.value === null ||
      cat.parentId === selectedParentFilter.value ||
      cat.id === selectedParentFilter.value;
    return matchKeyword && matchParent;
  });
});

const handleTreeSelect = (keys: (string | number)[]) => {
  selectedTreeKey.value = keys as number[];
  selectedParentFilter.value = keys.length ? (keys[0] as number) : null;
};
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <div>
        <h1 class="text-2xl font-bold">Quản lý danh mục</h1>
        <p class="text-sm text-neutral-500">Chọn danh mục cha bên trái để lọc danh sách con</p>
      </div>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon><Plus /></NIcon>
        </template>
        Thêm danh mục
      </NButton>
    </div>

    <div class="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <!-- Tree view -->
      <div class="border border-neutral-200 bg-white p-3 rounded-md">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold">Cây danh mục</span>
          <span class="text-xs text-neutral-500">{{ categoryTree.length }} gốc</span>
        </div>
        <NTree
          block-line
          :data="categoryTree"
          selectable
          :selected-keys="selectedTreeKey"
          :default-expand-all="true"
          @update:selected-keys="handleTreeSelect"
        />
      </div>

      <div>
        <!-- Bộ lọc nhanh -->
        <div class="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <NInput
            v-model:value="searchKeyword"
            placeholder="Tìm theo tên hoặc slug..."
            clearable
            class="md:w-1/3"
          />
          <NSelect
            v-model:value="selectedParentFilter"
            :options="parentFilterOptions as any"
            placeholder="Lọc theo danh mục cha"
            class="md:w-1/3"
            clearable
          />
          <div class="text-sm text-neutral-500">
            Tổng: {{ filteredCategories.length }} danh mục
          </div>
        </div>

        <NDataTable
          :columns="columns"
          :data="filteredCategories"
          :loading="loading"
          :pagination="pagination"
          @update:page="(page) => { pagination.page = page; }"
          @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; }"
          striped
          bordered
        />
      </div>
    </div>

    <NModal v-model:show="showModal" :title="modalTitle" preset="dialog" style="width: 600px">
      <NForm ref="formRef" :model="formData" label-placement="left" label-width="120">
        <NFormItem label="Tên danh mục" path="name" :rule="{ required: true, message: 'Vui lòng nhập tên danh mục' }">
          <NInput v-model:value="formData.name" placeholder="Nhập tên danh mục" @update:value="handleNameChange" />
        </NFormItem>
        <NFormItem label="Slug" path="slug" :rule="{ required: true, message: 'Vui lòng nhập slug' }">
          <NInput v-model:value="formData.slug" placeholder="Nhập slug" />
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

