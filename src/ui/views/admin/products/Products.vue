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
  NTag,
  type UploadFileInfo
} from 'naive-ui';
import { Plus, Pencil, Trash, Photo as ImageIcon, Eye } from '@vicons/tabler';
import ProductService from '@/core/services/api/product.service';
import CategoryService from '@/core/services/api/category.service';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/domain/models/product.model';
import type { Category } from '@/domain/models/category.model';

const message = useMessage();

const loading = ref(false);
const saving = ref(false);
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
const showViewModal = ref(false);
const modalTitle = ref('Tạo sản phẩm mới');
const editingProduct = ref<Product | null>(null);
const viewingProduct = ref<Product | null>(null);
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

const variantAttributes = ref<{ key: string; value: string }[]>([
  { key: '', value: '' },
]);

const selectedImages = ref<UploadFileInfo[]>([]);
const pendingVariants = ref<Array<{
  sku: string;
  name?: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
}>>([]);

const addAttributeRow = () => {
  variantAttributes.value.push({ key: '', value: '' });
};

const removeAttributeRow = (index: number) => {
  if (variantAttributes.value.length === 1) {
    variantAttributes.value[0] = { key: '', value: '' };
    return;
  }
  variantAttributes.value.splice(index, 1);
};

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
    render: (row: Product) => row.categoryName || row.category?.name || '-',
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
          circle: true,
          tertiary: true,
          quaternary: true,
          style: { marginRight: '6px' },
          onClick: () => handleView(row),
        }, { icon: () => h(NIcon, null, { default: () => h(Eye) }) }),
        h(NButton, {
          size: 'small',
          circle: true,
          type: 'primary',
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
  variantForm.value = { sku: '', name: '', price: 0, stock: 0 };
  variantAttributes.value = [{ key: '', value: '' }];
  pendingVariants.value = [];
  selectedImages.value = [];
  modalTitle.value = 'Tạo sản phẩm mới';
  showModal.value = true;
};

const handleEdit = async (product: Product) => {
  try {
    const fullProduct = await ProductService.getProductById(product.id);
    editingProduct.value = fullProduct;
    formData.value = {
      name: fullProduct.name,
      slug: fullProduct.slug,
      description: fullProduct.description || '',
      categoryId: fullProduct.category?.id || (fullProduct as any).categoryId || 0,
      brand: fullProduct.brand || '',
      origin: fullProduct.origin || '',
      price: fullProduct.price,
      active: fullProduct.status === 'ACTIVE',
    };
    variantAttributes.value = [{ key: '', value: '' }];
    pendingVariants.value = [];
    selectedImages.value = [];
    modalTitle.value = 'Chỉnh sửa sản phẩm';
    showModal.value = true;
  } catch (error: any) {
    message.error('Lỗi khi tải thông tin sản phẩm');
  }
};

const handleView = (product: Product) => {
  // Mở modal xem chi tiết trong admin
  ProductService.getProductById(product.id)
    .then((data) => {
      viewingProduct.value = data;
      showViewModal.value = true;
    })
    .catch((error: any) => {
      message.error(error?.response?.data?.message || 'Không thể tải chi tiết sản phẩm');
    });
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
    saving.value = true;
    let productId = editingProduct.value?.id;

    const buildVariantAttributes = () => {
      const attrs: Record<string, string> = {};
      variantAttributes.value.forEach(({ key, value }) => {
        if (key?.trim() && value !== undefined && value !== '') {
          attrs[key.trim()] = value;
        }
      });
      return Object.keys(attrs).length ? attrs : undefined;
    };

    // Real API call
    if (editingProduct.value) {
      await ProductService.updateProduct(editingProduct.value.id, formData.value as UpdateProductRequest);
      message.success('Cập nhật sản phẩm thành công');
    } else {
      const created = await ProductService.createProduct(formData.value);
      productId = created.id;

      const variantsToCreate = [...pendingVariants.value];
      const hasVariantPayload = !!variantForm.value.sku;
      if (hasVariantPayload) {
        variantsToCreate.push({
          sku: variantForm.value.sku,
          price: variantForm.value.price,
          stock: variantForm.value.stock,
          name: variantForm.value.name,
          attributes: buildVariantAttributes(),
        });
      }

      if (variantsToCreate.length && productId) {
        for (const variant of variantsToCreate) {
          await ProductService.createVariant(productId, variant);
        }
      }

      const files = selectedImages.value
        .map((file) => file.file)
        .filter((file): file is File => !!file);
      if (files.length && productId) {
        await ProductService.uploadImages(productId, files);
      }

      message.success('Tạo sản phẩm kèm biến thể và ảnh thành công');
    }
    showModal.value = false;
    saving.value = false;
    selectedImages.value = [];
    await loadProducts();
  } catch (error: any) {
    saving.value = false;
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
  const attrs: Record<string, string> = {};
  variantAttributes.value.forEach(({ key, value }) => {
    if (key?.trim() && value !== undefined && value !== '') {
      attrs[key.trim()] = value;
    }
  });
  if (!editingProduct.value) {
    pendingVariants.value.push({
      ...variantForm.value,
      attributes: Object.keys(attrs).length ? attrs : undefined,
    });
    message.success('Đã thêm biến thể vào danh sách chờ lưu');
    variantForm.value = { sku: '', name: '', price: 0, stock: 0 };
    variantAttributes.value = [{ key: '', value: '' }];
    return;
  }
  try {
    await ProductService.createVariant(editingProduct.value.id, {
      ...variantForm.value,
      attributes: Object.keys(attrs).length ? attrs : undefined,
    });
    message.success('Thêm biến thể thành công');
    variantForm.value = { sku: '', name: '', price: 0, stock: 0 };
    variantAttributes.value = [{ key: '', value: '' }];
    await handleEdit(editingProduct.value);
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi thêm biến thể');
  }
};

const handleRemovePendingVariant = (index: number) => {
  pendingVariants.value.splice(index, 1);
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

const handleImageChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  selectedImages.value = fileList;

  if (editingProduct.value && fileList.length) {
    try {
      const files = fileList
        .map((f) => f.file)
        .filter((file): file is File => !!file);
      if (!files.length) return;
      await ProductService.uploadImages(editingProduct.value.id, files);
      message.success('Upload hình ảnh thành công');
      selectedImages.value = [];
      await handleEdit(editingProduct.value);
    } catch (error: any) {
      message.error('Lỗi khi upload hình ảnh');
    }
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

    <!-- View Detail Modal -->
    <NModal v-model:show="showViewModal" :title="viewingProduct?.name || 'Chi tiết sản phẩm'" preset="dialog" style="width: 900px">
      <NTabs v-if="viewingProduct" type="line" animated>
        <NTabPane name="view-basic" tab="Thông tin cơ bản">
          <NCard size="small">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div><strong>Tên:</strong> {{ viewingProduct.name }}</div>
              <div><strong>Slug:</strong> {{ viewingProduct.slug }}</div>
              <div><strong>Danh mục:</strong> {{ viewingProduct.category?.name || '-' }}</div>
              <div><strong>Thương hiệu:</strong> {{ viewingProduct.brand || '-' }}</div>
              <div><strong>Xuất xứ:</strong> {{ viewingProduct.origin || '-' }}</div>
              <div><strong>Giá tối thiểu:</strong> {{ viewingProduct.minPrice ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(viewingProduct.minPrice) : '-' }}</div>
              <div><strong>Trạng thái:</strong> {{ viewingProduct.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng' }}</div>
              <div class="col-span-2"><strong>Mô tả:</strong> {{ viewingProduct.description || '-' }}</div>
            </div>
          </NCard>
        </NTabPane>

        <NTabPane v-if="viewingProduct?.variants?.length" name="view-variants" tab="Biến thể">
          <NDataTable
            :columns="[
              { title: 'SKU', key: 'sku' },
              { title: 'Giá', key: 'price', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price) },
              { title: 'Tồn kho', key: 'stock' },
              { title: 'Thuộc tính', key: 'attributes', render: (row) => row.attributes ? Object.values(row.attributes).join(' · ') : '-' },
            ]"
            :data="viewingProduct.variants"
            size="small"
            :bordered="true"
          />
        </NTabPane>

        <NTabPane v-if="viewingProduct?.images?.length" name="view-images" tab="Hình ảnh">
          <div class="grid grid-cols-4 gap-3">
            <div v-for="img in viewingProduct.images" :key="img.id" class="relative border border-neutral-200 rounded">
              <NImage :src="img.imageUrl" width="100%" height="140" object-fit="cover" />
              <NTag v-if="img.thumbnail" type="success" size="small" class="absolute top-1 left-1">Đại diện</NTag>
            </div>
          </div>
        </NTabPane>
      </NTabs>
      <template #action>
        <NButton @click="showViewModal = false">Đóng</NButton>
      </template>
    </NModal>
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
        <NTabPane name="variants" tab="Biến thể">
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">Thêm biến thể mới</h3>
            <div class="grid grid-cols-4 gap-4">
              <NInput v-model:value="variantForm.sku" placeholder="SKU" />
              <NInput v-model:value="variantForm.name" placeholder="Tên biến thể" />
              <NInputNumber v-model:value="variantForm.price" placeholder="Giá" :min="0" />
              <NInputNumber v-model:value="variantForm.stock" placeholder="Tồn kho" :min="0" />
            </div>
            <div class="mt-3">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium">Thuộc tính (tùy chọn)</h4>
                <NButton size="tiny" quaternary @click="addAttributeRow">Thêm thuộc tính</NButton>
              </div>
              <div v-for="(attr, index) in variantAttributes" :key="index" class="grid grid-cols-2 gap-3 mb-2">
                <NInput v-model:value="attr.key" placeholder="Tên thuộc tính (vd: color, size)" />
                <div class="flex gap-2">
                  <NInput v-model:value="attr.value" placeholder="Giá trị (vd: đỏ, M)" />
                  <NButton size="small" quaternary type="error" @click="removeAttributeRow(index)" :disabled="variantAttributes.length === 1">Xóa</NButton>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-2">
              <NButton type="primary" @click="handleAddVariant">Thêm biến thể</NButton>
              <div v-if="!editingProduct" class="text-xs text-gray-500">Biến thể được lưu tạm và sẽ tạo sau khi bạn bấm Lưu sản phẩm.</div>
            </div>
          </div>
          <div v-if="!editingProduct && pendingVariants.length" class="mb-4">
            <h4 class="font-medium mb-2">Biến thể sẽ tạo mới</h4>
            <NDataTable
              size="small"
              :columns="[
                { title: 'SKU', key: 'sku' },
                { title: 'Tên', key: 'name', render: (row) => row.name || '-' },
                { title: 'Giá', key: 'price', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price) },
                { title: 'Tồn kho', key: 'stock' },
                { title: 'Thuộc tính', key: 'attributes', render: (row) => row.attributes ? Object.values(row.attributes).join(' · ') : '-' },
                { title: 'Thao tác', key: 'actions', render: (_, index) => h(NButton, { size: 'small', type: 'error', onClick: () => handleRemovePendingVariant(index) }, { default: () => 'Xóa' }) },
              ]"
              :data="pendingVariants"
              :bordered="true"
            />
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
        <NTabPane name="images" tab="Hình ảnh">
          <div class="mb-4">
            <NUpload
              multiple
              :max="10"
              :default-upload="false"
              :file-list="selectedImages"
              :on-change="handleImageChange"
              accept="image/*"
            >
              <NButton>Chọn hình ảnh</NButton>
            </NUpload>
            <div v-if="!editingProduct" class="text-xs text-gray-500 mt-1">Ảnh sẽ được tải lên ngay sau khi sản phẩm được tạo.</div>
          </div>
          <div v-if="editingProduct?.images && editingProduct.images.length > 0" class="grid grid-cols-4 gap-4">
            <div v-for="image in editingProduct.images" :key="image.id" class="relative">
              <NImage :src="image.imageUrl" width="100%" height="150" object-fit="cover" />
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
        <NButton type="primary" :loading="saving" @click="handleSave">Lưu</NButton>
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

