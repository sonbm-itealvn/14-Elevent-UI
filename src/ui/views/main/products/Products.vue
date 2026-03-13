<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Search, Filter, X, Bolt } from '@vicons/tabler';
import PublicProductService from '@/core/services/api/public-product.service';
import type { PublicProduct } from '@/core/services/api/public-product.service';
import CategoryService from '@/core/services/api/category.service';
import type { CategoryTreeResponse } from '@/domain/models/category.model';
import { useMessage, NPagination } from 'naive-ui';

const message = useMessage();
const route = useRoute();

const allProducts = ref<PublicProduct[]>([]);
const categories = ref<CategoryTreeResponse[]>([]);
const loading = ref(false);
const loadingCategories = ref(false);
const pagination = ref({
  page: 1,
  pageSize: 12,
  total: 0,
  pageSizes: [12, 24, 48, 96],
});

const searchQuery = ref('');
const selectedCategory = ref<string | null>(null);
const selectedBrand = ref<string | null>(null);
const showFilters = ref(false);
const isSearchMode = ref(false); // Track if we're using search API

const formatPrice = (price?: number) => {
  if (price == null) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
};

const findCategoryName = (slug: string | null): string | undefined => {
  if (!slug) return undefined;
  for (const category of categories.value) {
    if (category.slug === slug) return category.name;
    if (category.children) {
      const child = category.children.find(c => c.slug === slug);
      if (child) return child.name;
    }
  }
  return undefined;
};

const loadCategories = async () => {
  try {
    loadingCategories.value = true;
    const data = await CategoryService.getCategoryTree();
    categories.value = data;
  } catch (error: any) {
    console.error('Error loading categories:', error);
    message.error('Lỗi khi tải danh sách danh mục');
  } finally {
    loadingCategories.value = false;
  }
};

const handleFilterToggle = () => {
  showFilters.value = !showFilters.value;
  if (showFilters.value && categories.value.length === 0) {
    // Chỉ load categories khi mở filter panel lần đầu
    loadCategories();
  }
};

const applyFilters = () => {
  pagination.value.page = 1;
  loadProducts();
  showFilters.value = false; // Đóng filter panel sau khi áp dụng
};

const loadProducts = async () => {
  // Tránh gọi API khi đang loading
  if (loading.value) {
    return;
  }
  
  try {
    loading.value = true;
    
    // If only search query (no other filters), use search API
    const hasOnlySearch = searchQuery.value.trim() && 
                         !selectedCategory.value && 
                         !selectedBrand.value;
    
    if (hasOnlySearch) {
      // Use search API
      isSearchMode.value = true;
      const searchResults = await PublicProductService.searchProducts(searchQuery.value.trim());
      allProducts.value = searchResults;
      pagination.value.total = searchResults.length;
      loading.value = false;
      return;
    }
    
    isSearchMode.value = false;
    
    // Build params for regular getProducts
    const params: any = {
      page: pagination.value.page - 1, // Backend expects 0-based page
      size: pagination.value.pageSize,
    };
    
    if (searchQuery.value) {
      params.keyword = searchQuery.value;
    }
    
    if (selectedCategory.value) {
      params.categorySlug = selectedCategory.value;
    }
    
    if (selectedBrand.value) {
      params.brand = selectedBrand.value;
    }
    
    const response = await PublicProductService.getProducts(params);
    allProducts.value = response.content;
    pagination.value.total = response.totalElements;
  } catch (error: any) {
    console.error('Error loading products:', error);
    message.error('Lỗi khi tải danh sách sản phẩm');
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = null;
  selectedBrand.value = null;
  isSearchMode.value = false;
  pagination.value.page = 1;
  loadProducts();
};

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedBrand.value;
});

// Watch for search query changes with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  // Clear timeout trước đó nếu có
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  // Chỉ gọi API sau khi user ngừng gõ 500ms
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    loadProducts();
    searchTimeout = null;
  }, 500);
});

// Không tự động gọi API khi filter thay đổi, chỉ gọi khi ấn nút "Áp dụng lọc"


onMounted(() => {
  // Đọc query params từ URL
  const categorySlug = route.query.categorySlug as string | undefined;
  if (categorySlug) {
    selectedCategory.value = categorySlug;
  }
  
  // Load categories và products
  loadCategories();
  loadProducts();
});
</script>

<template>
  <!-- Hero Section -->
  <section class="relative bg-black text-white py-16 md:py-24">
    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-14">
      <div class="text-center space-y-4">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-500 font-semibold">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Our Products</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">
          Sản Phẩm <span class="text-red-500">Nhật Bản</span>
        </h1>
        <p class="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto">
          商品カタログ
        </p>
      </div>
    </div>
  </section>

  <!-- Search and Filter Section -->
  <section class="bg-[#f7f7f7] py-8 px-4 md:px-8 lg:px-12 border-b border-neutral-200">
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <!-- Search Bar -->
        <div class="flex-1 w-full relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            class="w-full px-4 py-3 pl-12 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
          />
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        </div>

        <!-- Filter Toggle Button (Mobile) -->
        <button
          @click="handleFilterToggle"
          class="md:hidden px-6 py-3 bg-black text-white font-semibold uppercase text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <Filter class="h-5 w-5" />
          Lọc
        </button>

        <!-- Filter Buttons (Desktop) -->
        <div class="hidden md:flex items-center gap-3">
          <button
            @click="handleFilterToggle"
            class="px-6 py-3 bg-black text-white font-semibold uppercase text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors"
          >
            <Filter class="h-5 w-5" />
            Lọc
          </button>
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-6 py-3 bg-white border border-neutral-300 text-neutral-700 font-semibold uppercase text-sm flex items-center gap-2 hover:bg-neutral-50 transition-colors"
          >
            <X class="h-5 w-5" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <!-- Filter Panel -->
      <div
        v-show="showFilters"
        class="mt-6 p-6 bg-white border border-neutral-200 shadow-sm rounded-2xl"
      >
        <div class="flex items-center justify-between gap-4 mb-4">
          <div>
            <p class="text-base font-semibold text-neutral-900">Bộ lọc nâng cao</p>
            <p class="text-sm text-neutral-500">Chọn danh mục hoặc nhập thương hiệu, áp dụng để xem kết quả</p>
          </div>
          <button
            @click="clearFilters"
            class="px-4 py-2 text-sm font-semibold text-neutral-700 border border-neutral-300 rounded-lg flex items-center gap-2 hover:bg-neutral-50 transition-colors"
          >
            <X class="h-5 w-5" />
            Xóa nhanh
          </button>
        </div>

        <div class="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <!-- Category Filter -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900 mb-3">
              Danh mục
            </h3>
            <div v-if="loadingCategories" class="text-sm text-neutral-500">
              Đang tải danh mục...
            </div>
            <div
              v-else
              class="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1"
            >
              <button
                @click="selectedCategory = null"
                :class="[
                  'px-4 py-2 text-sm font-semibold rounded-full border transition-colors text-left',
                  !selectedCategory
                    ? 'bg-[#b3000f] border-[#b3000f] text-white'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                ]"
              >
                Tất cả
              </button>
              <template v-for="category in categories" :key="category.id">
                <button
                  @click="selectedCategory = selectedCategory === category.slug ? null : category.slug"
                  :class="[
                    'px-4 py-2 text-sm font-semibold rounded-full border transition-colors text-left',
                    selectedCategory === category.slug
                      ? 'bg-[#b3000f] border-[#b3000f] text-white'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  ]"
                >
                  {{ category.name }}
                </button>
                <!-- Hiển thị children nếu có -->
                <button
                  v-for="child in category.children"
                  :key="child.id"
                  @click="selectedCategory = selectedCategory === child.slug ? null : child.slug"
                  :class="[
                    'px-4 py-2 text-sm font-medium rounded-full border transition-colors text-left',
                    selectedCategory === child.slug
                      ? 'bg-[#b3000f] border-[#b3000f] text-white'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  ]"
                >
                  {{ child.name }}
                </button>
              </template>
            </div>
          </div>

          <!-- Brand Filter -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900 mb-3">
              Thương hiệu
            </h3>
            <div class="flex items-center gap-3">
              <div class="relative flex-1">
                <input
                  v-model="selectedBrand"
                  type="text"
                  placeholder="Nhập tên thương hiệu và nhấn Enter"
                  class="w-full pl-4 pr-10 py-3 border border-neutral-300 rounded-lg focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/10 bg-white text-neutral-900"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  ⏎
                </span>
              </div>
              <button
                @click="selectedBrand = ''"
                class="px-3 py-3 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Xóa
              </button>
            </div>
            <p class="mt-2 text-xs text-neutral-500">
              Gợi ý: nhập vài ký tự, nhấn Enter để áp dụng
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="mt-6 pt-4 border-t border-neutral-200 flex flex-col md:flex-row gap-3"
        >
          <button
            @click="applyFilters"
            class="flex-1 px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] text-white font-semibold uppercase text-sm transition-colors rounded-lg"
          >
            Áp dụng lọc
          </button>
          <button
            @click="clearFilters"
            class="px-6 py-3 bg-white border border-neutral-300 text-neutral-700 font-semibold uppercase text-sm flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors rounded-lg"
          >
            <X class="h-5 w-5" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
        <span class="text-sm text-neutral-600">Bộ lọc đang áp dụng:</span>
        <span
          v-if="selectedCategory"
          class="px-3 py-1 bg-[#b3000f] text-white text-sm font-semibold uppercase"
        >
          Danh mục: {{ findCategoryName(selectedCategory) || selectedCategory }}
        </span>
        <span
          v-if="selectedBrand"
          class="px-3 py-1 bg-[#b3000f] text-white text-sm font-semibold uppercase"
        >
          Thương hiệu: {{ selectedBrand }}
        </span>
        <span
          v-if="searchQuery"
          class="px-3 py-1 bg-neutral-800 text-white text-sm font-semibold"
        >
          Tìm: "{{ searchQuery }}"
        </span>
      </div>
    </div>
  </section>

  <!-- Products Grid Section -->
  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto">
      <!-- Results Count -->
      <div class="mb-8 flex items-center justify-between">
        <p class="text-neutral-600">
          Tìm thấy <span class="font-semibold text-[#b3000f]">{{ pagination.total }}</span> sản phẩm
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <p class="text-neutral-500">Đang tải sản phẩm...</p>
      </div>

      <!-- Products Grid -->
      <div v-else-if="allProducts.length > 0" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="item in allProducts"
          :key="item.id"
          class="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group rounded-md overflow-hidden"
        >
          <router-link
            :to="{ name: 'ProductDetail', params: { slug: item.slug } }"
            class="block flex-1"
          >
            <div class="relative overflow-hidden bg-neutral-50 flex items-center justify-center" style="height: 200px;">
              <img
                :src="item.thumbnail || 'https://via.placeholder.com/400'"
                :alt="item.name"
                class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <!-- Badge góc trên bên trái -->
              <div v-if="item.isOnSale" class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded flex items-center gap-1">
                <Bolt class="h-4 w-4" />
                FLASH SALE
              </div>
              <div v-else class="absolute top-3 left-3 px-3 py-1 text-sm font-semibold rounded text-white bg-black">
                NEW
              </div>
            </div>
            <div class="p-5 flex flex-col gap-3">
              <div v-if="item.brand" class="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {{ item.brand }}
              </div>
              <div>
                <h3 class="text-lg font-semibold text-neutral-900 mb-1 line-clamp-2">{{ item.name }}</h3>
                <p v-if="item.origin" class="text-sm text-neutral-500">{{ item.origin }}</p>
              </div>
            </div>
          </router-link>
          <div class="px-5 pb-4 pt-0 flex flex-col gap-1 border-t border-neutral-100">
            <template v-if="item.isOnSale && item.minSalePrice != null">
              <span class="text-neutral-400 text-sm line-through"><s>{{ formatPrice(item.minPrice) }}</s></span>
              <span class="text-red-600 font-bold text-lg">{{ formatPrice(item.minSalePrice) }}</span>
            </template>
            <template v-else>
              <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-16">
        <div class="max-w-md mx-auto space-y-4">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-2xl font-semibold text-neutral-900">Không tìm thấy sản phẩm</h3>
          <p class="text-neutral-600">
            Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
          </p>
          <button
            @click="clearFilters"
            class="px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] text-white font-semibold uppercase text-sm transition-colors mt-4"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && pagination.total > 0 && !isSearchMode" class="mt-10 flex justify-center">
        <NPagination
          v-model:page="pagination.page"
          :page-size="pagination.pageSize"
          :item-count="pagination.total"
          :page-sizes="pagination.pageSizes"
          show-size-picker
          @update:page="(page) => { pagination.page = page; loadProducts(); }"
          @update:page-size="(size) => { pagination.pageSize = size; pagination.page = 1; loadProducts(); }"
        />
      </div>
      <!-- Search results info (no pagination for search) -->
      <div v-if="!loading && isSearchMode && allProducts.length > 0" class="mt-10 text-center text-sm text-neutral-600">
        Tìm thấy {{ allProducts.length }} kết quả cho "{{ searchQuery }}"
      </div>
    </div>
  </section>
</template>

<style scoped>
input::placeholder {
  color: #9ca3af;
}
</style>
