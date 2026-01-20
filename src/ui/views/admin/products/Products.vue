<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue';
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
  weight: undefined,
  weightUnit: '',
  expiryInfo: '',
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
const productImageUrl = ref<string | null>(null);
const productImageFile = ref<File | null>(null);
const variantImageUrls = ref<Record<string, string>>({}); // Map variant SKU to image URL
const variantImageFiles = ref<Record<string, File>>({}); // Map variant SKU to image file
const pendingVariants = ref<Array<{
  sku: string;
  name?: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
  imageUrl?: string;
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
    weight: undefined,
    weightUnit: '',
    expiryInfo: '',
    active: true,
  };
  variantForm.value = { sku: '', name: '', price: 0, stock: 0 };
  variantAttributes.value = [{ key: '', value: '' }];
  pendingVariants.value = [];
  selectedImages.value = [];
  productImageUrl.value = null;
  productImageFile.value = null;
  variantImageUrls.value = {};
  variantImageFiles.value = {};
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
      weight: fullProduct.weight,
      weightUnit: fullProduct.weightUnit || '',
      expiryInfo: fullProduct.expiryInfo || '',
      active: fullProduct.status === 'ACTIVE',
    };
    variantAttributes.value = [{ key: '', value: '' }];
    pendingVariants.value = [];
    selectedImages.value = [];
    // Load existing product image
    productImageUrl.value = fullProduct.imageUrl || (fullProduct.images && fullProduct.images.length > 0 ? fullProduct.images[0].imageUrl : null) || null;
    productImageFile.value = null;
    // Load existing variant images
    variantImageUrls.value = {};
    variantImageFiles.value = {};
    if (fullProduct.variants) {
      fullProduct.variants.forEach(variant => {
        // Variants might have imageUrl in the response
        if ((variant as any).imageUrl) {
          variantImageUrls.value[variant.sku] = (variant as any).imageUrl;
        }
      });
    }
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

// Format number with comma separator
const formatPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined || value === 0 || isNaN(value)) return '';
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse formatted number back to number
const parsePrice = (value: string): string => {
  if (!value) return '';
  return value.replace(/,/g, '').trim();
};

// Handle price input change
const handlePriceInput = (value: string) => {
  const parsed = parsePrice(value);
  variantForm.value.price = parsed ? Number(parsed) : 0;
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
      // Create product first with imageUrl = null
      const productData = {
        ...formData.value,
        status: formData.value.active ? 'ACTIVE' : 'INACTIVE',
      };
      delete (productData as any).active;
      // Don't include imageUrl - create with null

      const created = await ProductService.createProduct(productData);
      productId = created.id;

      // Upload product image after creating product
      if (productImageFile.value && productId) {
        try {
          const uploadedUrl = await ProductService.uploadProductImage(productId, productImageFile.value);
          // Update product with imageUrl
          await ProductService.updateProduct(productId, { imageUrl: uploadedUrl });
          productImageUrl.value = uploadedUrl;
        } catch (error: any) {
          message.warning('Lỗi khi upload ảnh sản phẩm, nhưng sản phẩm đã được tạo');
        }
      }

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
          // Create variant with imageUrl = null
          const createdVariant = await ProductService.createVariant(productId, {
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            name: variant.name,
            attributes: variant.attributes,
            // Don't include imageUrl - create with null
          });

          // Upload variant image after creating variant
          const variantImageFile = variantImageFiles.value[variant.sku];
          if (variantImageFile && createdVariant.id) {
            try {
              const uploadedUrl = await ProductService.uploadVariantImage(
                productId,
                createdVariant.id,
                variantImageFile
              );
              variantImageUrls.value[variant.sku] = uploadedUrl;
            } catch (error: any) {
              message.warning(`Lỗi khi upload ảnh biến thể ${variant.sku}`);
            }
          }
        }
      }

      message.success('Tạo sản phẩm kèm biến thể và ảnh thành công');
    }
    showModal.value = false;
    saving.value = false;
    selectedImages.value = [];
    productImageUrl.value = null;
    productImageFile.value = null;
    variantImageUrls.value = {};
    variantImageFiles.value = {};
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
    const currentSku = variantForm.value.sku;
    const variantData = {
      ...variantForm.value,
      attributes: Object.keys(attrs).length ? attrs : undefined,
    };
    pendingVariants.value.push(variantData);
    message.success('Đã thêm biến thể vào danh sách chờ lưu');
    // Clear variant image for next variant before clearing form
    if (variantImageFiles.value[currentSku]) {
      delete variantImageFiles.value[currentSku];
    }
    if (variantImageUrls.value[currentSku]) {
      delete variantImageUrls.value[currentSku];
    }
    variantForm.value = { sku: '', name: '', price: 0, stock: 0 };
    variantAttributes.value = [{ key: '', value: '' }];
    return;
  }
  try {
    // Create variant with imageUrl = null
    const variantData = {
      ...variantForm.value,
      attributes: Object.keys(attrs).length ? attrs : undefined,
    };
    const createdVariant = await ProductService.createVariant(editingProduct.value.id, variantData);
    
    // Upload variant image after creating variant
    const variantImageFile = variantImageFiles.value[variantForm.value.sku];
    if (variantImageFile && createdVariant.id) {
      try {
        const uploadedUrl = await ProductService.uploadVariantImage(
          editingProduct.value.id,
          createdVariant.id,
          variantImageFile
        );
        variantImageUrls.value[variantForm.value.sku] = uploadedUrl;
      } catch (error: any) {
        message.warning('Lỗi khi upload ảnh biến thể');
      }
    }
    
    message.success('Thêm biến thể thành công');
    const currentSku = variantForm.value.sku;
    // Clear variant image before clearing form
    if (variantImageFiles.value[currentSku]) {
      delete variantImageFiles.value[currentSku];
    }
    if (variantImageUrls.value[currentSku]) {
      delete variantImageUrls.value[currentSku];
    }
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

const productImageFileList = computed<UploadFileInfo[]>(() => {
  if (productImageUrl.value) {
    return [{
      id: 'product-image',
      name: productImageFile.value?.name || 'product-image',
      status: 'finished',
      url: productImageUrl.value,
    }];
  }
  return [];
});

const handleProductImageChange = async ({ fileList }: { fileList: UploadFileInfo[] }) => {
  if (fileList.length === 0) {
    productImageFile.value = null;
    productImageUrl.value = null;
    return;
  }

  const file = fileList[fileList.length - 1].file;
  if (!file) return;

  productImageFile.value = file;

  // If editing existing product, upload immediately
  if (editingProduct.value) {
    try {
      const uploadedUrl = await ProductService.uploadProductImage(editingProduct.value.id, file);
      productImageUrl.value = uploadedUrl;
      // Update product with imageUrl
      await ProductService.updateProduct(editingProduct.value.id, { imageUrl: uploadedUrl });
      message.success('Upload ảnh sản phẩm thành công');
      await handleEdit(editingProduct.value);
    } catch (error: any) {
      message.error('Lỗi khi upload ảnh sản phẩm');
      productImageFile.value = null;
      productImageUrl.value = null;
    }
  } else {
    // For new product, just store the file - will upload after product is created
    // Create a preview URL for display
    productImageUrl.value = URL.createObjectURL(file);
  }
};

const getVariantImageFileList = (sku: string): UploadFileInfo[] => {
  const url = variantImageUrls.value[sku];
  if (url) {
    return [{
      id: `variant-image-${sku}`,
      name: variantImageFiles.value[sku]?.name || `variant-image-${sku}`,
      status: 'finished',
      url: url,
    }];
  }
  return [];
};

const handleVariantImageChange = async ({ fileList }: { fileList: UploadFileInfo[] }, sku: string) => {
  if (fileList.length === 0) {
    delete variantImageFiles.value[sku];
    delete variantImageUrls.value[sku];
    return;
  }

  const file = fileList[fileList.length - 1].file;
  if (!file) return;

  variantImageFiles.value[sku] = file;

  // If editing existing product and variant exists, upload immediately
  if (editingProduct.value) {
    const variant = editingProduct.value.variants?.find(v => v.sku === sku);
    if (variant) {
      try {
        const uploadedUrl = await ProductService.uploadVariantImage(
          editingProduct.value.id,
          variant.id,
          file
        );
        variantImageUrls.value[sku] = uploadedUrl;
        message.success('Upload ảnh biến thể thành công');
        await handleEdit(editingProduct.value);
      } catch (error: any) {
        message.error('Lỗi khi upload ảnh biến thể');
        delete variantImageFiles.value[sku];
        delete variantImageUrls.value[sku];
      }
    }
  } else {
    // For new variant, we'll upload after variant is created
    // For now, create a preview URL
    variantImageUrls.value[sku] = URL.createObjectURL(file);
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
            <NFormItem label="Khối lượng" path="weight">
              <NInputNumber v-model:value="formData.weight" placeholder="Nhập khối lượng" :min="0" :precision="2" style="width: 100%" />
            </NFormItem>
            <NFormItem label="Đơn vị đo lường" path="weightUnit">
              <NInput v-model:value="formData.weightUnit" placeholder="Nhập đơn vị (vd: g, kg, ml, l)" />
            </NFormItem>
            <NFormItem label="Thông tin hạn sử dụng" path="expiryInfo">
              <NInput v-model:value="formData.expiryInfo" placeholder="Nhập thông tin hạn sử dụng" />
            </NFormItem>
            <NFormItem label="Trạng thái" path="active">
              <NSwitch v-model:value="formData.active" />
            </NFormItem>
            <NFormItem label="Ảnh sản phẩm" path="imageUrl">
              <NUpload
                :max="1"
                :default-upload="false"
                :file-list="productImageFileList"
                :on-change="handleProductImageChange"
                accept="image/*"
                list-type="image-card"
              >
                <NButton>Chọn ảnh</NButton>
              </NUpload>
              <div v-if="!editingProduct && productImageFile" class="text-xs text-gray-500 mt-1">
                Ảnh sẽ được upload sau khi tạo sản phẩm
              </div>
            </NFormItem>
          </NForm>
        </NTabPane>
        <NTabPane name="variants" tab="Biến thể">
          <div class="space-y-6">
            <!-- Form thêm biến thể mới -->
            <NCard title="Thông tin biến thể" size="small">
              <div class="space-y-4">
                <!-- Thông tin cơ bản -->
                <div>
                  <h4 class="text-sm font-semibold text-neutral-700 mb-3">Thông tin cơ bản</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <NFormItem label="SKU" :required="true" label-placement="left" label-width="100">
                      <NInput v-model:value="variantForm.sku" placeholder="Nhập SKU (bắt buộc)" />
                    </NFormItem>
                    <NFormItem label="Tên biến thể" label-placement="left" label-width="100">
                      <NInput v-model:value="variantForm.name" placeholder="Nhập tên biến thể (tùy chọn)" />
                    </NFormItem>
                    <NFormItem label="Giá" :required="true" label-placement="left" label-width="100">
                      <div class="flex items-center gap-2" style="width: 100%">
                        <NInput
                          :value="variantForm.price ? formatPrice(variantForm.price) : ''"
                          @update:value="handlePriceInput"
                          placeholder="Nhập giá"
                          style="flex: 1"
                          type="text"
                        />
                        <span class="text-neutral-600 font-medium min-w-[30px]">₫</span>
                      </div>
                    </NFormItem>
                    <NFormItem label="Tồn kho" :required="true" label-placement="left" label-width="100">
                      <NInputNumber 
                        v-model:value="variantForm.stock" 
                        placeholder="Nhập số lượng" 
                        :min="0" 
                        :precision="0"
                        style="width: 100%"
                      />
                    </NFormItem>
                  </div>
                </div>

                <!-- Ảnh biến thể -->
                <div>
                  <h4 class="text-sm font-semibold text-neutral-700 mb-3">Ảnh biến thể</h4>
                  <NFormItem label="Ảnh" label-placement="left" label-width="100">
                    <NUpload
                      :max="1"
                      :default-upload="false"
                      :file-list="getVariantImageFileList(variantForm.sku)"
                      :on-change="(options) => handleVariantImageChange(options, variantForm.sku)"
                      accept="image/*"
                      list-type="image-card"
                    >
                      <NButton>Chọn ảnh</NButton>
                    </NUpload>
                    <div v-if="!editingProduct && variantImageFiles[variantForm.sku]" class="text-xs text-gray-500 mt-1">
                      Ảnh sẽ được upload sau khi tạo biến thể
                    </div>
                  </NFormItem>
                </div>

                <!-- Thuộc tính -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-semibold text-neutral-700">Thuộc tính (tùy chọn)</h4>
                    <NButton size="small" quaternary @click="addAttributeRow">
                      <template #icon>
                        <NIcon><Plus /></NIcon>
                      </template>
                      Thêm thuộc tính
                    </NButton>
                  </div>
                  <div v-if="variantAttributes.length > 0" class="space-y-2">
                    <div 
                      v-for="(attr, index) in variantAttributes" 
                      :key="index" 
                      class="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <div class="flex-1 grid grid-cols-2 gap-3">
                        <NInput 
                          v-model:value="attr.key" 
                          placeholder="Tên thuộc tính (vd: Màu sắc, Kích thước)" 
                        />
                        <NInput 
                          v-model:value="attr.value" 
                          placeholder="Giá trị (vd: Đỏ, L)" 
                        />
                      </div>
                      <NButton 
                        size="small" 
                        quaternary 
                        type="error" 
                        @click="removeAttributeRow(index)" 
                        :disabled="variantAttributes.length === 1"
                      >
                        <template #icon>
                          <NIcon><Trash /></NIcon>
                        </template>
                        Xóa
                      </NButton>
                    </div>
                  </div>
                  <div v-else class="text-sm text-neutral-500 italic text-center py-4">
                    Chưa có thuộc tính nào. Nhấn "Thêm thuộc tính" để thêm.
                  </div>
                </div>

                <!-- Nút thêm biến thể -->
                <div class="flex items-center gap-3 pt-2 border-t border-neutral-200">
                  <NButton type="primary" @click="handleAddVariant" :disabled="!variantForm.sku || !variantForm.price || variantForm.stock === undefined">
                    <template #icon>
                      <NIcon><Plus /></NIcon>
                    </template>
                    Thêm biến thể
                  </NButton>
                  <div v-if="!editingProduct" class="text-xs text-neutral-500 flex-1 flex items-center gap-1">
                    <NIcon size="14"><ImageIcon /></NIcon>
                    <span>Biến thể được lưu tạm và sẽ tạo sau khi bạn bấm "Lưu sản phẩm"</span>
                  </div>
                </div>
              </div>
            </NCard>

            <!-- Danh sách biến thể đã thêm (tạm thời) -->
            <NCard v-if="!editingProduct && pendingVariants.length > 0" title="Biến thể sẽ tạo mới" size="small">
              <NDataTable
                size="small"
                :columns="[
                  { title: 'SKU', key: 'sku', width: 150 },
                  { title: 'Tên', key: 'name', render: (row) => row.name || '-', width: 150 },
                  { title: 'Giá', key: 'price', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price), width: 120 },
                  { title: 'Tồn kho', key: 'stock', width: 100 },
                  { title: 'Thuộc tính', key: 'attributes', render: (row) => row.attributes ? Object.entries(row.attributes).map(([k, v]) => `${k}: ${v}`).join(', ') : '-', ellipsis: { tooltip: true } },
                  { 
                    title: 'Thao tác', 
                    key: 'actions', 
                    width: 100,
                    render: (_, index) => h(NButton, { 
                      size: 'small', 
                      type: 'error',
                      quaternary: true,
                      onClick: () => handleRemovePendingVariant(index) 
                    }, { 
                      default: () => 'Xóa',
                      icon: () => h(NIcon, null, { default: () => h(Trash) })
                    })
                  },
                ]"
                :data="pendingVariants"
                :bordered="true"
                :striped="true"
              />
            </NCard>

            <!-- Danh sách biến thể hiện có (khi chỉnh sửa) -->
            <NCard v-if="editingProduct?.variants && editingProduct.variants.length > 0" title="Biến thể hiện có" size="small">
              <NDataTable
                :columns="[
                  { title: 'SKU', key: 'sku', width: 150 },
                  { title: 'Tên', key: 'name', width: 150 },
                  { title: 'Giá', key: 'price', render: (row) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(row.price), width: 120 },
                  { title: 'Tồn kho', key: 'stock', width: 100 },
                  { 
                    title: 'Thao tác', 
                    key: 'actions', 
                    width: 100,
                    render: (row) => h(NPopconfirm, { 
                      onPositiveClick: () => handleDeleteVariant(row.id) 
                    }, { 
                      trigger: () => h(NButton, { 
                        size: 'small', 
                        type: 'error',
                        quaternary: true
                      }, { 
                        default: () => 'Xóa',
                        icon: () => h(NIcon, null, { default: () => h(Trash) })
                      }), 
                      default: () => 'Bạn có chắc muốn xóa biến thể này?' 
                    })
                  },
                ]"
                :data="editingProduct.variants"
                :bordered="true"
                :striped="true"
              />
            </NCard>

            <!-- Thông báo khi chưa có biến thể -->
            <div v-if="editingProduct && (!editingProduct.variants || editingProduct.variants.length === 0)" class="text-center py-8 text-neutral-500">
              <NIcon size="48" class="mb-2"><ImageIcon /></NIcon>
              <p>Chưa có biến thể nào. Hãy thêm biến thể mới ở trên.</p>
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

