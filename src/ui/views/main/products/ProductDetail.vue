<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NTag, NButton, NBadge, useMessage, NBreadcrumb, NBreadcrumbItem } from 'naive-ui';
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
  <section class="bg-white py-10 px-4 md:px-8 lg:px-12" v-if="product">
    <div class="max-w-6xl mx-auto">
      <div class="mb-3">
        <n-breadcrumb separator=">">
          <n-breadcrumb-item class="cursor-pointer" @click="router.push({ name: 'Home' })">Trang chủ</n-breadcrumb-item>
          <n-breadcrumb-item class="cursor-pointer" @click="router.push({ name: 'Products' })">Sản phẩm</n-breadcrumb-item>
          <n-breadcrumb-item>{{ product.name }}</n-breadcrumb-item>
        </n-breadcrumb>
      </div>
      <div class="grid gap-8 lg:grid-cols-[520px,1fr]">
        <!-- Gallery -->
        <div class="space-y-4">
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
          <div class="flex gap-3 overflow-x-auto pb-1">
            <!-- Product main image - luôn hiển thị và có thể chọn -->
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              class="w-20 h-20 rounded border object-cover cursor-pointer transition-colors flex-shrink-0"
              :class="[
                selectedImageSource === 'product' && mainImage === product.imageUrl
                  ? 'border-[#b3000f] ring-2 ring-[#b3000f]'
                  : 'border-neutral-200 hover:border-[#b3000f]'
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
                class="w-20 h-20 rounded border object-cover cursor-pointer transition-colors flex-shrink-0"
                :class="[
                  selectedImageSource === 'variant' && selectedVariantId === variant.id && mainImage === variant.imageUrl
                    ? 'border-[#b3000f] ring-2 ring-[#b3000f]'
                    : 'border-neutral-200 hover:border-[#b3000f]'
                ]"
                @click="handleSelectVariant(variant.id)"
                :alt="`Variant ${variant.sku} thumbnail`"
                :title="`Chọn ảnh biến thể ${variant.sku}`"
              />
            </template>
            <!-- Fallback to images array if no imageUrl -->
            <template v-if="!product.imageUrl && (!product.variants || product.variants.every(v => !v.imageUrl))">
              <img
                v-for="img in product.images || []"
                :key="img.id"
                :src="img.imageUrl"
                class="w-20 h-20 rounded border object-cover cursor-pointer transition-colors flex-shrink-0"
                :class="[
                  mainImage === img.imageUrl
                    ? 'border-[#b3000f] ring-2 ring-[#b3000f]'
                    : 'border-neutral-200 hover:border-[#b3000f]'
                ]"
                @click="setMainImage(img.imageUrl, 'product')"
                alt="Product image thumbnail"
              />
            </template>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-4">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <n-tag type="warning" size="small" bordered round>Yêu thích</n-tag>
              <n-tag type="error" size="small" round>HOT</n-tag>
            </div>
            <h1 class="text-2xl md:text-3xl font-bold text-neutral-900">{{ product.name }}</h1>
            <p v-if="product.brand || product.origin" class="text-sm text-neutral-500">
              <span v-if="product.brand">Thương hiệu: {{ product.brand }}</span>
              <span v-if="product.brand && product.origin" class="mx-2">•</span>
              <span v-if="product.origin">Xuất xứ: {{ product.origin }}</span>
            </p>
          </div>

          <div class="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-2">
            <div class="text-3xl font-semibold text-[#b3000f]">
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
            <p class="text-sm text-neutral-600">
              <span v-if="selectedVariant">
                Giá của biến thể: <strong>{{ selectedVariant.sku }}</strong>
                <span v-if="selectedVariant.stock > 0" class="ml-2 text-green-600">
                  (Còn {{ selectedVariant.stock }} sản phẩm)
                </span>
                <span v-else class="ml-2 text-red-600">(Hết hàng)</span>
              </span>
              <span v-else>Giá theo biến thể; chọn biến thể để xem giá chính xác.</span>
            </p>
            <div class="text-sm text-neutral-500 flex items-center gap-2">
              <span>Đánh giá</span>
              <span class="text-amber-500">★ ★ ★ ★ ★</span>
            </div>
          </div>

          <!-- Variants -->
          <div v-if="product.variants?.length" class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="font-semibold text-neutral-900">Chọn biến thể</div>
              <span class="text-xs text-neutral-500">{{ product.variants.length }} biến thể</span>
            </div>
            <!-- Variant grid with improved layout -->
            <div 
              class="grid gap-3 overflow-x-auto pb-2 variant-grid"
              :class="[
                product.variants.length > 4 
                  ? 'grid-cols-[repeat(auto-fill,minmax(160px,1fr))]' 
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              ]"
            >
              <button
                v-for="variant in product.variants"
                :key="variant.id"
                @click="handleSelectVariant(variant.id)"
                :disabled="variant.stock === 0"
                :class="[
                  'variant-card border rounded-xl p-3 text-left transition-all relative overflow-hidden group',
                  'flex flex-col',
                  selectedVariantId === variant.id
                    ? 'border-[#b3000f] bg-[#fff5f5] shadow-md ring-2 ring-[#b3000f]/20'
                    : variant.stock === 0
                    ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed'
                    : 'border-neutral-200 hover:border-[#b3000f] hover:shadow-lg bg-white'
                ]"
              >
                <!-- Variant image with better aspect ratio -->
                <div v-if="variant.imageUrl" class="mb-3 relative rounded-lg overflow-hidden bg-neutral-100 aspect-[4/3]">
                  <img
                    :src="variant.imageUrl"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    :alt="`Variant ${variant.sku} image`"
                    loading="lazy"
                  />
                  <!-- Selected checkmark overlay -->
                  <div
                    v-if="selectedVariantId === variant.id"
                    class="absolute top-2 right-2 w-6 h-6 bg-[#b3000f] rounded-full flex items-center justify-center shadow-lg z-10"
                  >
                    <span class="text-white text-xs font-bold">✓</span>
                  </div>
                  <!-- Out of stock overlay -->
                  <div
                    v-if="variant.stock === 0"
                    class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10"
                  >
                    <span class="text-white text-xs font-semibold bg-red-600 px-2.5 py-1 rounded-full">Hết hàng</span>
                  </div>
                </div>
                <!-- Placeholder if no image -->
                <div v-else class="mb-3 rounded-lg bg-neutral-100 aspect-[4/3] flex items-center justify-center">
                  <span class="text-neutral-400 text-xs">Không có ảnh</span>
                </div>
                
                <!-- Variant info -->
                <div class="flex-1 flex flex-col gap-1.5">
                  <div class="font-semibold text-neutral-900 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                    {{ variant.sku }}
                  </div>
                  <div v-if="variant.attributes" class="text-xs text-neutral-500 space-y-0.5">
                    <div v-for="(value, key) in variant.attributes" :key="key" class="truncate">
                      <span class="font-medium text-neutral-600">{{ key }}:</span> 
                      <span>{{ value }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Price and stock -->
                <div class="mt-2 pt-2 border-t border-neutral-100">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-bold text-[#b3000f] leading-tight">
                      {{ variant.price.toLocaleString('vi-VN') }}₫
                    </span>
                    <n-badge 
                      v-if="variant.stock > 0"
                      :value="variant.stock" 
                      :max="99" 
                      type="success"
                      :show-zero="false"
                      size="small"
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Quantity + Add to cart -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
              <button
                class="w-10 h-10 hover:bg-neutral-100"
                @click="quantity = Math.max(1, quantity - 1)"
              >-</button>
              <div class="w-12 text-center font-semibold">{{ quantity }}</div>
              <button
                class="w-10 h-10 hover:bg-neutral-100"
                @click="quantity = quantity + 1"
              >+</button>
            </div>
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
              {{ selectedVariant && selectedVariant.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
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

          <!-- Description -->
          <div v-if="product.description" class="pt-2 border-t border-neutral-200">
            <h3 class="font-semibold text-neutral-900 mb-2">Mô tả</h3>
            <p class="text-neutral-700 leading-relaxed whitespace-pre-line">
              {{ product.description }}
            </p>
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
          <div class="relative">
            <img
              :src="item.thumbnail || 'https://via.placeholder.com/400'"
              :alt="item.name"
              class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-200"
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
</style>

