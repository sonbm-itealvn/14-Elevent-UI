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
  NCard,
  NTabs,
  NTabPane,
  NUpload,
  NImage,
  NTag
} from 'naive-ui';
import { Plus, Pencil, Trash, Photo as ImageIcon } from '@vicons/tabler';
import ProductService from '@/core/services/api/product.service';
import CategoryService from '@/core/services/api/category.service';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductVariant, ProductImage } from '@/domain/models/product.model';
import type { Category } from '@/domain/models/category.model';

const message = useMessage();

const loading = ref(false);
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

const showModal = ref(false);
const modalTitle = ref('Tạo sản phẩm mới');
const editingProduct = ref<Product | null>(null);
const formRef = ref();

const formData = ref<CreateProductRequest>({
  name: '',
  slug: '',
  description: '',
  categoryId: 0,
  brand: '',
  origin: '',
  price: 0,
  active: true,
});

const variantForm = ref({
  sku: '',
  name: '',
  price: 0,
  stock: 0,
});

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
  },
  {
    title: 'Tên sản phẩm',
    key: 'name',
    width: 200,
  },
  {
    title: 'Slug',
    key: 'slug',
    width: 150,
  },
  {
    title: 'Danh mục',
    key: 'category',
    width: 150,
    render: (row: Product) => row.category?.name || '-',
  },
  {
    title: 'Giá',
    key: 'price',
    width: 120,
    render: (row: Product) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price),
  },
  {
    title: 'Trạng thái',
    key: 'status',
    width: 120,
    render: (row: Product) => {
      return h(NSwitch, {
        value: row.status === 'ACTIVE',
        onUpdateValue: (value: boolean) => handleToggleStatus(row.id, value ? 'ACTIVE' : 'INACTIVE'),
      });
    },
  },
  {
    title: 'Thao tác',
    key: 'actions',
    width: 200,
    render: (row: Product) => {
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
          default: () => 'Bạn có chắc muốn xóa sản phẩm này?',
        }),
      ];
    },
  },
];

// Mock data for UI preview
const mockProducts: Product[] = [
  { id: 1, name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: 'Điện thoại thông minh cao cấp', categoryId: 1, price: 25000000, brand: 'Apple', origin: 'Trung Quốc', active: true, category: { id: 1, name: 'Điện thoại', slug: 'dien-thoai' } },
  { id: 2, name: 'MacBook Pro M3', slug: 'macbook-pro-m3', description: 'Laptop chuyên nghiệp', categoryId: 1, price: 45000000, brand: 'Apple', origin: 'Trung Quốc', active: true, category: { id: 1, name: 'Laptop', slug: 'laptop' } },
  { id: 3, name: 'Áo thun nam', slug: 'ao-thun-nam', description: 'Áo thun chất lượng cao', categoryId: 2, price: 200000, brand: 'Uniqlo', origin: 'Việt Nam', active: true, category: { id: 2, name: 'Quần áo', slug: 'quan-ao' } },
];

const mockCategories: Category[] = [
  { id: 1, name: 'Điện tử', slug: 'dien-tu', description: 'Sản phẩm điện tử', active: true },
  { id: 2, name: 'Quần áo', slug: 'quan-ao', description: 'Thời trang quần áo', active: true },
];

const loadProducts = async () => {
  try {
    loading.value = true;
    
    // Real API call
    const response = await ProductService.getProducts({
      page: pagination.value.page - 1,
      size: pagination.value.pageSize,
    });
    products.value = response.content;
    pagination.value.total = response.totalElements;
    loading.value = false;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm');
    loading.value = false;
  }
};

const loadCategories = async () => {
  try {
    // Real API call
    const tree = await CategoryService.getCategoryTree();
    // const flatten = (cats: any[]): Category[] => {
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
  } catch (error: any) {
    message.error('Lỗi khi tải danh mục');
  }
};

const handleCreate = () => {
  editingProduct.value = null;
  formData.value = {
    name: '',
    slug: '',
    description: '',
    categoryId: 0,
    brand: '',
    origin: '',
    price: 0,
    active: true,
  };
  modalTitle.value = 'Tạo sản phẩm mới';
  showModal.value = true;
};

const handleEdit = async (product: Product) => {
  try {
    // Mock data for UI preview
    const fullProduct = { ...product, variants: [], images: [] };
    editingProduct.value = fullProduct;
    
    // Real API call - uncomment when ready
    // const fullProduct = await ProductService.getProductById(product.id);
    // editingProduct.value = fullProduct;
    formData.value = {
      name: fullProduct.name,
      slug: fullProduct.slug,
      description: fullProduct.description || '',
      categoryId: fullProduct.categoryId,
      brand: fullProduct.brand || '',
      origin: fullProduct.origin || '',
      price: fullProduct.price,
      active: fullProduct.active,
    };
    modalTitle.value = 'Chỉnh sửa sản phẩm';
    showModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải thông tin sản phẩm');
  }
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
  if (!editingProduct.value && formData.value.name) {
    formData.value.slug = generateSlug(formData.value.name);
  }
};

const handleSave = async () => {
  try {
    await formRef.value?.validate();
    
    // Real API call
    if (editingProduct.value) {
      await ProductService.updateProduct(editingProduct.value.id, formData.value as UpdateProductRequest);
      message.success('Cập nhật sản phẩm thành công');
    } else {
      await ProductService.createProduct(formData.value);
      message.success('Tạo sản phẩm thành công');
    }
    showModal.value = false;
    await loadProducts();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lưu sản phẩm');
  }
};

const handleDelete = async (productId: number) => {
  try {
    // Real API call
    await ProductService.toggleStatus(productId, { status: 'INACTIVE' });
    message.success('Vô hiệu hóa sản phẩm thành công');
    await loadProducts();
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi vô hiệu hóa sản phẩm');
  }
};

const handleToggleStatus = async (productId: number, status: 'ACTIVE' | 'INACTIVE') => {
  try {
    await ProductService.toggleStatus(productId, { status });
    message.success(status === 'ACTIVE' ? 'Kích hoạt sản phẩm thành công' : 'Vô hiệu hóa sản phẩm thành công');
    await loadProducts();
  } catch (error: any) {
    message.error('Lỗi khi cập nhật trạng thái');
  }
};

const handleAddVariant = async () => {
  if (!editingProduct.value) return;
  try {
    await ProductService.createVariant(editingProduct.value.id, variantForm.value);
    message.success('Thêm biến thể thành công');
    variantForm.value = { sku: '', name: '', price: 0, stock: 0 };
    await handleEdit(editingProduct.value);
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi thêm biến thể');
  }
};

const handleDeleteVariant = async (variantId: number) => {
  if (!editingProduct.value) return;
  try {
    await ProductService.deleteVariant(editingProduct.value.id, variantId);
    message.success('Xóa biến thể thành công');
    await handleEdit(editingProduct.value);
  } catch (error: any) {
    message.error('Lỗi khi xóa biến thể');
  }
};

const handleUploadImages = async (fileList: any[]) => {
  if (!editingProduct.value) return;
  try {
    const files = fileList.map(f => f.file);
    await ProductService.uploadImages(editingProduct.value.id, files);
    message.success('Upload hình ảnh thành công');
    await handleEdit(editingProduct.value);
  } catch (error: any) {
    message.error('Lỗi khi upload hình ảnh');
  }
};

const handleDeleteImage = async (imageId: number) => {
  if (!editingProduct.value) return;
  try {
    await ProductService.deleteImage(editingProduct.value.id, imageId);
    message.success('Xóa hình ảnh thành công');
    await handleEdit(editingProduct.value);
  } catch (error: any) {
    message.error('Lỗi khi xóa hình ảnh');
  }
};

onMounted(() => {
  loadProducts();
  loadCategories();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Quản lý sản phẩm</h1>
      <NButton type="primary" @click="handleCreate">
        <template #icon>
          <NIcon><Plus /></NIcon>
        </template>
        Thêm sản phẩm
      </NButton>
    </div>

    <NDataTable
      :columns="columns"
      :data="products"
      :loading="loading"
      :pagination="pagination"
      :row-class-name="(row: Product) => row.status === 'INACTIVE' ? 'inactive-row' : ''"
      @update:page="(page) => { pagination.page = page; loadProducts(); }"
      @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadProducts(); }"
      striped
      bordered
    />

    <NModal v-model:show="showModal" :title="modalTitle" preset="dialog" style="width: 900px">
      <NTabs type="line" animated>
        <NTabPane name="basic" tab="Thông tin cơ bản">
          <NForm ref="formRef" :model="formData" label-placement="left" label-width="120">
            <NFormItem label="Tên sản phẩm" path="name" :rule="{ required: true, message: 'Vui lòng nhập tên sản phẩm' }">
              <NInput v-model:value="formData.name" placeholder="Nhập tên sản phẩm" @update:value="handleNameChange" />
            </NFormItem>
            <NFormItem label="Slug" path="slug" :rule="{ required: true, message: 'Vui lòng nhập slug' }">
              <NInput v-model:value="formData.slug" placeholder="Nhập slug" />
            </NFormItem>
            <NFormItem label="Mô tả" path="description">
              <NInput v-model:value="formData.description" type="textarea" placeholder="Nhập mô tả" :rows="4" />
            </NFormItem>
            <NFormItem label="Danh mục" path="categoryId" :rule="{ required: true, type: 'number', min: 1, message: 'Vui lòng chọn danh mục' }">
              <NSelect
                v-model:value="formData.categoryId"
                :options="categories.map(c => ({ label: c.name, value: c.id }))"
                placeholder="Chọn danh mục"
              />
            </NFormItem>
            <NFormItem label="Thương hiệu" path="brand">
              <NInput v-model:value="formData.brand" placeholder="Nhập thương hiệu" />
            </NFormItem>
            <NFormItem label="Xuất xứ" path="origin">
              <NInput v-model:value="formData.origin" placeholder="Nhập xuất xứ" />
            </NFormItem>
            <NFormItem label="Giá" path="price" :rule="{ required: true, type: 'number', min: 0, message: 'Vui lòng nhập giá' }">
              <NInputNumber v-model:value="formData.price" placeholder="Nhập giá" :min="0" :precision="0" style="width: 100%" />
            </NFormItem>
            <NFormItem label="Trạng thái" path="active">
              <NSwitch v-model:value="formData.active" />
            </NFormItem>
          </NForm>
        </NTabPane>
        <NTabPane v-if="editingProduct" name="variants" tab="Biến thể">
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">Thêm biến thể mới</h3>
            <div class="grid grid-cols-4 gap-4">
              <NInput v-model:value="variantForm.sku" placeholder="SKU" />
              <NInput v-model:value="variantForm.name" placeholder="Tên biến thể" />
              <NInputNumber v-model:value="variantForm.price" placeholder="Giá" :min="0" />
              <NInputNumber v-model:value="variantForm.stock" placeholder="Tồn kho" :min="0" />
            </div>
            <NButton type="primary" @click="handleAddVariant" class="mt-2">Thêm biến thể</NButton>
          </div>
          <div v-if="editingProduct?.variants && editingProduct.variants.length > 0">
            <NDataTable
              :columns="[
                { title: 'SKU', key: 'sku' },
                { title: 'Tên', key: 'name' },
                { title: 'Giá', key: 'price', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price) },
                { title: 'Tồn kho', key: 'stock' },
                { title: 'Thao tác', key: 'actions', render: (row) => h(NPopconfirm, { onPositiveClick: () => handleDeleteVariant(row.id) }, { trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => 'Xóa' }), default: () => 'Xóa biến thể?' }) },
              ]"
              :data="editingProduct.variants"
            />
          </div>
        </NTabPane>
        <NTabPane v-if="editingProduct" name="images" tab="Hình ảnh">
          <div class="mb-4">
            <NUpload
              multiple
              :max="10"
              :on-finish="handleUploadImages"
              accept="image/*"
            >
              <NButton>Upload hình ảnh</NButton>
            </NUpload>
          </div>
          <div v-if="editingProduct?.images && editingProduct.images.length > 0" class="grid grid-cols-4 gap-4">
            <div v-for="image in editingProduct.images" :key="image.id" class="relative">
              <NImage :src="image.url" width="100%" height="150" object-fit="cover" />
              <NTag v-if="image.thumbnail" type="success" class="absolute top-2 left-2">Ảnh đại diện</NTag>
              <NButton
                size="small"
                type="error"
                class="absolute top-2 right-2"
                @click="handleDeleteImage(image.id)"
              >
                Xóa
              </NButton>
            </div>
          </div>
        </NTabPane>
      </NTabs>
      <template #action>
        <NButton @click="showModal = false">Hủy</NButton>
        <NButton type="primary" @click="handleSave">Lưu</NButton>
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

