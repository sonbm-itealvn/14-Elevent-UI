<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, useMessage, NBreadcrumb, NBreadcrumbItem } from 'naive-ui';
import PublicProductService, { type ProductDetail, type PublicProduct } from '@/core/services/api/public-product.service';
import useCartStore from '@/ui/stores/cart.store';
import { ShoppingCart } from '@vicons/tabler';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const cartStore = useCartStore();

const loading = ref(false);
const product = ref<ProductDetail | null>(null);
const selectedVariantId = ref<number | null>(null);
const quantity = ref(1);
const mainImage = ref<string | null>(null);
const selectedImageSource = ref<'product' | 'variant' | null>(null); // Track which image source is selected
const relatedProducts = ref<PublicProduct[]>([]);
const loadingRelated = ref(false);

type VariantType = NonNullable<ProductDetail['variants']>[number];

const getVariantName = (variant?: VariantType) => {
  if (!variant) return '';
  const attrName = variant.attributes?.name;
  if (typeof attrName === 'string' && attrName.trim()) {
    return attrName.trim();
  }
  return variant.sku || '';
};

const priceRange = computed(() => {
  if (!product.value?.variants || product.value.variants.length === 0) return null;
  const prices = product.value.variants.map(v => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max };
});

const selectedVariant = computed(() =>
  product.value?.variants?.find(v => v.id === selectedVariantId.value)
);

const displayedPrice = computed(() => {
  if (selectedVariant.value) return selectedVariant.value.price;
  if (priceRange.value) return priceRange.value.min === priceRange.value.max ? priceRange.value.min : null;
  return null;
});

const setMainImage = (url?: string, source: 'product' | 'variant' | null = null) => {
  if (url) {
    mainImage.value = url;
    selectedImageSource.value = source;
  }
};

const loadProduct = async (slug: string) => {
  try {
    loading.value = true;
    const data = await PublicProductService.getProductBySlug(slug);
    product.value = data;
    // Mặc định hiển thị ảnh của sản phẩm
    if (data.imageUrl) {
      setMainImage(data.imageUrl, 'product');
    } else {
      const thumb = data.images?.find(img => img.thumbnail)?.imageUrl;
      setMainImage(thumb || data.images?.[0]?.imageUrl, 'product');
    }
    // Default variant: pick first in stock, else first
    if (data.variants?.length) {
      const inStock = data.variants.find(v => v.stock > 0);
      selectedVariantId.value = (inStock || data.variants[0]).id;
      // Update main image if variant has image
      const selectedVariant = inStock || data.variants[0];
      if (selectedVariant.imageUrl) {
        setMainImage(selectedVariant.imageUrl, 'variant');
      }
    }
    // Load related products after product is loaded
    if (data.id) {
      loadRelatedProducts(data.id);
    }
  } catch (error: any) {
    console.error('Error loading product detail', error);
    message.error(error?.response?.data?.message || 'Không thể tải thông tin sản phẩm');
    router.push({ name: 'Products' });
  } finally {
    loading.value = false;
  }
};

const loadRelatedProducts = async (productId: number) => {
  try {
    loadingRelated.value = true;
    const products = await PublicProductService.getRelatedProducts(productId);
    relatedProducts.value = products;
  } catch (error: any) {
    console.error('Error loading related products', error);
    // Không hiển thị error message vì đây là phần phụ
  } finally {
    loadingRelated.value = false;
  }
};

const formatPrice = (price?: number) => {
  if (!price) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const calculateOriginalPrice = (salePrice: number, salePercentage: number): number => {
  // Giá gốc = Giá sale / (1 - salePercentage/100)
  const originalPrice = salePrice / (1 - salePercentage / 100);
  // Làm tròn đến hàng nghìn
  return Math.round(originalPrice / 1000) * 1000;
};

const handleSelectVariant = (id: number) => {
  selectedVariantId.value = id;
  // Update main image when variant is selected
  const variant = product.value?.variants?.find(v => v.id === id);
  if (variant?.imageUrl) {
    setMainImage(variant.imageUrl, 'variant');
  } else if (product.value?.imageUrl) {
    // Fallback to product image if variant doesn't have image
    setMainImage(product.value.imageUrl, 'product');
  }
};

const handleSelectProductImage = () => {
  if (product.value?.imageUrl) {
    setMainImage(product.value.imageUrl, 'product');
  }
};

const handleAddToCart = async () => {
  if (!selectedVariantId.value) {
    message.warning('Vui lòng chọn biến thể');
    return;
  }
  try {
    loading.value = true;
    await cartStore.addItem(selectedVariantId.value, quantity.value);
    message.success('Đã thêm vào giỏ hàng');
  } catch (error: any) {
    message.error(error?.response?.data?.message || error?.message || 'Không thể thêm vào giỏ');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const slug = route.params.slug as string;
  if (!slug) {
    router.push({ name: 'Products' });
    return;
  }
  loadProduct(slug);
});

watch(
  () => route.params.slug,
  (slug) => {
    if (typeof slug === 'string') {
      loadProduct(slug);
    }
  }
);
</script>

<template>
  <section class="bg-white py-10 px-4 md:px-8 lg:px-12 overflow-x-hidden" v-if="product">
    <div class="max-w-6xl mx-auto w-full">
      <div class="mb-3">
        <n-breadcrumb separator=">">
          <n-breadcrumb-item class="cursor-pointer" @click="router.push({ name: 'Home' })">Trang chủ</n-breadcrumb-item>
          <n-breadcrumb-item class="cursor-pointer" @click="router.push({ name: 'Products' })">Sản phẩm</n-breadcrumb-item>
          <n-breadcrumb-item>{{ product.name }}</n-breadcrumb-item>
        </n-breadcrumb>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Gallery - Left Column -->
        <div class="gallery-container space-y-4 w-full min-w-0">
          <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-2 min-h-[400px] flex items-center justify-center">
            <img
              v-if="mainImage"
              :src="mainImage"
              class="max-h-[460px] w-full object-contain"
              alt="Product image"
            />
            <div v-else class="text-neutral-400 text-sm">Không có hình ảnh</div>
          </div>
          <!-- Thumbnail images: product image + variant images -->
          <div class="thumbnail-strip flex gap-3 overflow-x-auto pb-2 w-full">
            <!-- Product main image - luôn hiển thị và có thể chọn -->
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              class="w-20 h-20 rounded border object-cover cursor-pointer transition-all flex-shrink-0"
              :class="[
                selectedImageSource === 'product' && mainImage === product.imageUrl
                  ? 'border-[#b3000f] ring-2 ring-[#b3000f] scale-105'
                  : 'border-neutral-200 hover:border-[#b3000f] hover:scale-105'
              ]"
              @click="handleSelectProductImage"
              alt="Product thumbnail"
              title="Chọn ảnh sản phẩm gốc"
            />
            <!-- Variant images - có thể chọn từng variant -->
            <template v-for="variant in product.variants || []" :key="`variant-${variant.id}`">
              <img
                v-if="variant.imageUrl"
                :src="variant.imageUrl"
                class="w-20 h-20 rounded border object-cover cursor-pointer transition-all flex-shrink-0"
                :class="[
                  selectedImageSource === 'variant' && selectedVariantId === variant.id && mainImage === variant.imageUrl
                    ? 'border-[#b3000f] ring-2 ring-[#b3000f] scale-105'
                    : 'border-neutral-200 hover:border-[#b3000f] hover:scale-105'
                ]"
                @click="handleSelectVariant(variant.id)"
                :alt="`Variant ${variant.sku} thumbnail`"
                :title="`Chọn biến thể ${variant.sku}`"
              />
            </template>
            <!-- Fallback to images array if no imageUrl -->
            <template v-if="!product.imageUrl && (!product.variants || product.variants.every(v => !v.imageUrl))">
              <img
                v-for="img in product.images || []"
                :key="img.id"
                :src="img.imageUrl"
                class="w-20 h-20 rounded border object-cover cursor-pointer transition-all flex-shrink-0"
                :class="[
                  mainImage === img.imageUrl
                    ? 'border-[#b3000f] ring-2 ring-[#b3000f] scale-105'
                    : 'border-neutral-200 hover:border-[#b3000f] hover:scale-105'
                ]"
                @click="setMainImage(img.imageUrl, 'product')"
                alt="Product image thumbnail"
              />
            </template>
          </div>
        </div>

        <!-- Info (Shopee-like layout) -->
        <div class="space-y-4 min-w-0">
          <!-- Title + basic info -->
          <div class="space-y-2 min-w-0">
            <div class="flex items-center gap-2 text-xs text-[#ee4d2d] font-semibold uppercase">
              <span class="px-2 py-0.5 bg-[#fff0e9] rounded-sm">Yêu thích+</span>
            </div>
            <h1 class="product-name text-2xl md:text-3xl font-semibold text-neutral-900 leading-snug break-words">
              {{ product.name }}
            </h1>
            <div class="flex items-center gap-4 text-sm text-neutral-500">
              <div class="flex items-center gap-1">
                <span class="text-[#ee4d2d] font-semibold">5.0</span>
                <span class="text-amber-400">★ ★ ★ ★ ★</span>
              </div>
              <span class="h-4 w-px bg-neutral-300"></span>
              <div class="flex items-center gap-1">
                <span class="font-semibold">Đã bán</span>
                <span>1,2k+</span>
              </div>
            </div>
          </div>

          <!-- Price block -->
          <div class="bg-[#fff5f1] border border-[#ffe0d2] rounded-md px-4 py-3 flex items-end gap-4">
            <div class="flex flex-col gap-1">
              <!-- Giá gạch ngang (giá gốc) khi có sale -->
              <div 
                v-if="product.isOnSale && product.salePercentage && displayedPrice !== null"
                class="text-sm text-neutral-400 line-through"
              >
                {{ calculateOriginalPrice(displayedPrice, product.salePercentage).toLocaleString('vi-VN') }}₫
              </div>
              <div 
                v-else-if="product.isOnSale && product.salePercentage && priceRange"
                class="text-sm text-neutral-400 line-through"
              >
                {{ calculateOriginalPrice(priceRange.max, product.salePercentage).toLocaleString('vi-VN') }}₫
              </div>
              <div class="text-3xl font-semibold text-[#ee4d2d]">
                <template v-if="displayedPrice !== null">
                  {{ displayedPrice.toLocaleString('vi-VN') }}₫
                </template>
                <template v-else-if="priceRange">
                  {{ priceRange.min.toLocaleString('vi-VN') }}₫ - {{ priceRange.max.toLocaleString('vi-VN') }}₫
                </template>
                <template v-else>
                  Liên hệ
                </template>
              </div>
            </div>
            <div v-if="selectedVariant" class="text-xs text-neutral-600 mb-1">
              <!-- <span>Biến thể:</span>
              <span class="font-semibold ml-1">{{ getVariantName(selectedVariant) }}</span> -->
              <span v-if="selectedVariant.stock > 0" class="ml-2 text-green-600">
                (Còn {{ selectedVariant.stock }} sản phẩm)
              </span>
              <span v-else class="ml-2 text-red-600">(Hết hàng)</span>
            </div>
          </div>

          <!-- Options & quantity (Shopee-style rows) -->
          <div class="space-y-5 text-sm">
            <!-- Variants row - bigger cards -->
            <div
              v-if="product.variants?.length"
              class="flex items-start gap-4"
            >
              <div class="w-24 text-neutral-500 pt-2">Vị</div>
              <div class="flex-1 flex flex-wrap gap-3 max-h-40 overflow-y-auto py-1">
                <button
                  v-for="variant in product.variants"
                  :key="variant.id"
                  type="button"
                  @click="handleSelectVariant(variant.id)"
                  :disabled="variant.stock === 0"
                  class="variant-option inline-flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all bg-white min-w-[190px]"
                  :class="[
                    selectedVariantId === variant.id
                      ? 'border-[#ee4d2d] text-[#ee4d2d] shadow-sm bg-[#fff5f1]'
                      : 'border-neutral-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d]',
                    variant.stock === 0 && selectedVariantId !== variant.id
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  ]"
                >
                  <img
                    v-if="variant.imageUrl"
                    :src="variant.imageUrl"
                    class="w-10 h-10 rounded object-cover flex-shrink-0"
                    :alt="`Variant ${variant.sku} image`"
                  />
                  <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span class="text-xs font-semibold line-clamp-1">
                      {{ getVariantName(variant) }}
                    </span>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <!-- Giá gạch ngang (giá gốc) khi có sale -->
                      <span 
                        v-if="product.isOnSale && product.salePercentage"
                        class="text-[10px] text-neutral-400 line-through"
                      >
                        {{ calculateOriginalPrice(variant.price, product.salePercentage).toLocaleString('vi-VN') }}₫
                      </span>
                      <!-- Giá sale -->
                      <span class="text-[11px] text-neutral-500 line-clamp-1">
                        {{ variant.price.toLocaleString('vi-VN') }}₫
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Quantity row -->
            <div class="flex items-center gap-4">
              <div class="w-24 text-neutral-500">Số lượng</div>
              <div class="flex items-center gap-3 flex-wrap">
                <div class="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    class="w-8 h-8 md:w-9 md:h-9 hover:bg-neutral-100"
                    @click="quantity = Math.max(1, quantity - 1)"
                  >-</button>
                  <div class="w-10 md:w-12 text-center font-semibold">{{ quantity }}</div>
                  <button
                    class="w-8 h-8 md:w-9 md:h-9 hover:bg-neutral-100"
                    @click="quantity = quantity + 1"
                  >+</button>
                </div>
                <div v-if="selectedVariant" class="text-xs text-neutral-500">
                  {{ selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Hết hàng' }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3 pt-2">
              <n-button
                type="error"
                strong
                size="large"
                class="!px-6 flex-1 sm:flex-none"
                @click="handleAddToCart"
                :loading="loading"
                :disabled="!selectedVariant || selectedVariant.stock === 0"
              >
                <template #icon>
                  <ShoppingCart />
                </template>
                {{ selectedVariant && selectedVariant.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng' }}
              </n-button>
              <n-button
                type="primary"
                strong
                size="large"
                class="!px-6 flex-1 sm:flex-none"
                ghost
                :disabled="!selectedVariant || selectedVariant.stock === 0"
                @click="handleAddToCart().then(() => router.push({ name: 'Cart' }))"
              >
                Mua ngay
              </n-button>
            </div>
          </div>

          <!-- Specs -->
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-neutral-700">
            <div><strong>Danh mục:</strong> {{ product.category?.name || 'N/A' }}</div>
            <div><strong>Thương hiệu:</strong> {{ product.brand || 'N/A' }}</div>
            <div><strong>Xuất xứ:</strong> {{ product.origin || 'N/A' }}</div>
            <div><strong>Khối lượng:</strong> {{ product.weight ? `${product.weight}${product.weightUnit || ''}` : 'N/A' }}</div>
            <div><strong>Hạn sử dụng:</strong> {{ product.expiryInfo || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Description section below (full width) -->
  <section v-if="product?.description" class="bg-white border-t border-neutral-200 py-8 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-lg font-semibold text-neutral-900 mb-3">Mô tả sản phẩm</h2>
      <p class="text-neutral-700 leading-relaxed whitespace-pre-line">
        {{ product.description }}
      </p>
    </div>
  </section>

  <section v-else class="py-12 text-center text-neutral-500">
    Đang tải thông tin sản phẩm...
  </section>

  <!-- Related Products Section -->
  <section v-if="relatedProducts.length > 0 || loadingRelated" class="bg-[#f7f7f7] py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-10">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Sản phẩm liên quan</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <p class="text-neutral-500 text-sm">関連商品</p>
      </div>

      <div v-if="loadingRelated" class="text-center py-10">
        <p class="text-neutral-500">Đang tải...</p>
      </div>
      <div v-else-if="relatedProducts.length > 0" class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <router-link
          v-for="item in relatedProducts"
          :key="item.id"
          :to="{ name: 'ProductDetail', params: { slug: item.slug } }"
          class="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-neutral-200 flex flex-col rounded-md overflow-hidden group"
        >
          <div class="relative bg-neutral-50 flex items-center justify-center" style="height: 200px;">
            <img
              :src="item.thumbnail || 'https://via.placeholder.com/400'"
              :alt="item.name"
              class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div v-if="item.isOnSale && item.salePercentage" class="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 text-xs font-semibold rounded">
              -{{ item.salePercentage }}%
            </div>
          </div>

          <div class="p-5 flex flex-col gap-3 flex-1">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 uppercase tracking-wide line-clamp-2 group-hover:text-red-600 transition-colors">
                {{ item.name }}
              </h3>
              <div class="flex items-center gap-2 mt-1">
                <p v-if="item.brand" class="text-sm text-neutral-500">{{ item.brand }}</p>
                <span v-if="item.brand && item.origin" class="text-neutral-400">•</span>
                <p v-if="item.origin" class="text-sm text-neutral-500">{{ item.origin }}</p>
              </div>
            </div>
          </div>
          <div class="px-5 pb-4 pt-0 flex items-center justify-between border-t border-neutral-100">
            <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Gallery container - prevent overflow */
.gallery-container {
  overflow: hidden; /* Prevent children from overflowing */
}

/* Thumbnail strip with scrollbar */
.thumbnail-strip {
  width: 100%;
  max-width: 100%;
  min-width: 0; /* Important for flex items to allow shrinking */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  /* Ensure container doesn't expand beyond parent */
  box-sizing: border-box;
  /* Force horizontal scroll when content overflows */
  overflow-x: auto;
  overflow-y: hidden;
}

.thumbnail-strip::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-strip::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.thumbnail-strip::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.thumbnail-strip::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Custom scrollbar for variant grid */
.variant-grid {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.variant-grid::-webkit-scrollbar {
  height: 6px;
}

.variant-grid::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.variant-grid::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.variant-grid::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Variant card styles */
.variant-card {
  min-width: 160px;
}

.variant-card:disabled {
  pointer-events: none;
}

/* Smooth transitions */
.variant-card img {
  will-change: transform;
}

/* Better focus states for accessibility */
.variant-card:focus-visible {
  outline: 2px solid #b3000f;
  outline-offset: 2px;
}

/* Product name - prevent overflow on mobile */
.product-name {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  hyphens: auto;
}
</style>

