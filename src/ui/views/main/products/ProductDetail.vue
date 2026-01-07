<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NTag, NImage, NImageGroup, NButton, NBadge, useMessage, NBreadcrumb, NBreadcrumbItem } from 'naive-ui';
import PublicProductService, { type ProductDetail } from '@/core/services/api/public-product.service';
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

const variantAttributes = computed(() => {
  const variants = product.value?.variants || [];
  if (!variants.length) return {};
  const attrMap: Record<string, Set<string>> = {};
  variants.forEach((v) => {
    if (v.attributes) {
      Object.entries(v.attributes).forEach(([k, val]) => {
        if (!attrMap[k]) attrMap[k] = new Set();
        attrMap[k].add(String(val));
      });
    }
  });
  return Object.fromEntries(Object.entries(attrMap).map(([k, set]) => [k, Array.from(set)]));
});

const setMainImage = (url?: string) => {
  if (url) mainImage.value = url;
};

const loadProduct = async (slug: string) => {
  try {
    loading.value = true;
    const data = await PublicProductService.getProductBySlug(slug);
    product.value = data;
    // Images
    const thumb = data.images?.find(img => img.thumbnail)?.imageUrl;
    setMainImage(thumb || data.images?.[0]?.imageUrl);
    // Default variant: pick first in stock, else first
    if (data.variants?.length) {
      const inStock = data.variants.find(v => v.stock > 0);
      selectedVariantId.value = (inStock || data.variants[0]).id;
    }
  } catch (error: any) {
    console.error('Error loading product detail', error);
    message.error(error?.response?.data?.message || 'Không thể tải thông tin sản phẩm');
    router.push({ name: 'Products' });
  } finally {
    loading.value = false;
  }
};

const handleSelectVariant = (id: number) => {
  selectedVariantId.value = id;
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
            <n-image
              v-if="mainImage"
              :src="mainImage"
              class="max-h-[460px] object-contain"
              :preview-src="mainImage"
            />
            <div v-else class="text-neutral-400 text-sm">Không có hình ảnh</div>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-1">
            <n-image-group>
              <n-image
                v-for="img in product.images || []"
                :key="img.id"
                :src="img.imageUrl"
                width="80"
                height="80"
                class="rounded border border-neutral-200 object-cover cursor-pointer hover:border-[#b3000f]"
                @click="setMainImage(img.imageUrl)"
              />
            </n-image-group>
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
              <span v-if="selectedVariant">Giá của biến thể: {{ selectedVariant.sku }}</span>
              <span v-else>Giá theo biến thể; chọn biến thể để xem giá chính xác.</span>
            </p>
            <div class="text-sm text-neutral-500 flex items-center gap-2">
              <span>Đánh giá</span>
              <span class="text-amber-500">★ ★ ★ ★ ★</span>
              <span>(giả lập)</span>
            </div>
          </div>

          <!-- Variants -->
          <div v-if="product.variants?.length" class="space-y-3">
            <div class="font-semibold text-neutral-900">Chọn biến thể</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="variant in product.variants"
                :key="variant.id"
                @click="handleSelectVariant(variant.id)"
                :class="[
                  'border rounded-lg px-3 py-2 text-left transition-colors min-w-[120px]',
                  selectedVariantId === variant.id
                    ? 'border-[#b3000f] bg-[#fff5f5]'
                    : 'border-neutral-200 hover:border-neutral-300'
                ]"
              >
                <div class="font-semibold text-neutral-900 text-sm truncate">{{ variant.sku }}</div>
                <div v-if="variant.attributes" class="text-xs text-neutral-500 mt-1 truncate">
                  {{ Object.values(variant.attributes).join(' · ') }}
                </div>
                <div class="flex items-center justify-between mt-1 text-xs text-neutral-600">
                  <span>{{ variant.price.toLocaleString('vi-VN') }}₫</span>
                  <n-badge :value="variant.stock" :max="99" type="success" />
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
              class="!px-6"
              @click="handleAddToCart"
              :loading="loading"
            >
              <template #icon>
                <ShoppingCart />
              </template>
              Thêm vào giỏ
            </n-button>
            <n-button
              type="primary"
              strong
              size="large"
              class="!px-6"
              ghost
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
</template>

