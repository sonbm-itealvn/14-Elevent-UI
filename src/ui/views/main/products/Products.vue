<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Filter, X } from '@vicons/tabler';

// Sample products data
const allProducts = ref([
  {
    id: 1,
    title: "Premium Sushi Set",
    jpTitle: "プレミアム寿司セット",
    category: "FOOD",
    price: "450.000 đ",
    oldPrice: null,
    tag: "NEW",
    desc: "Freshly made sushi set with premium ingredients",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Traditional Ramen",
    jpTitle: "ラーメン",
    category: "FOOD",
    price: "120.000 đ",
    oldPrice: null,
    tag: "NEW",
    desc: "Rich and flavorful traditional Japanese ramen",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "Matcha Tea Set",
    jpTitle: "抹茶セット",
    category: "DRINK",
    price: "180.000 đ",
    oldPrice: null,
    tag: "NEW",
    desc: "Premium matcha tea powder from Kyoto",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Premium Sake",
    jpTitle: "プレミアム日本酒",
    category: "DRINK",
    price: "350.000 đ",
    oldPrice: null,
    tag: "NEW",
    desc: "Authentic Japanese sake from premium breweries",
    image: "https://images.unsplash.com/photo-1481391204139-7c1d3d98adf1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 5,
    title: "Onigiri Combo",
    jpTitle: "おにぎりセット",
    category: "SNACK",
    price: "90.000 đ",
    oldPrice: "120.000 đ",
    tag: "SALE",
    desc: "Delicious rice balls with various fillings",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80&sat=-50",
  },
  {
    id: 6,
    title: "Takoyaki Box",
    jpTitle: "たこ焼きボックス",
    category: "FOOD",
    price: "110.000 đ",
    oldPrice: "140.000 đ",
    tag: "SALE",
    desc: "Octopus balls with special sauce",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 7,
    title: "Dorayaki Mix",
    jpTitle: "どら焼きミックス",
    category: "SNACK",
    price: "95.000 đ",
    oldPrice: "120.000 đ",
    tag: "SALE",
    desc: "Sweet red bean pancakes",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80&sat=-30",
  },
  {
    id: 8,
    title: "Uji Matcha Latte",
    jpTitle: "宇治抹茶ラテ",
    category: "DRINK",
    price: "75.000 đ",
    oldPrice: "95.000 đ",
    tag: "SALE",
    desc: "Creamy matcha latte from Uji",
    image: "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 9,
    title: "Mochi Dessert Box",
    jpTitle: "もちデザート",
    category: "SNACK",
    price: "150.000 đ",
    oldPrice: null,
    tag: "NEW",
    desc: "Assorted mochi with classic Japanese flavors",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 10,
    title: "Wagyu Beef Set",
    jpTitle: "和牛セット",
    category: "FOOD",
    price: "850.000 đ",
    oldPrice: null,
    tag: "NEW",
    desc: "Premium Japanese wagyu beef",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 11,
    title: "Sencha Green Tea",
    jpTitle: "煎茶",
    category: "DRINK",
    price: "125.000 đ",
    oldPrice: "150.000 đ",
    tag: "SALE",
    desc: "High-quality sencha green tea leaves",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 12,
    title: "Pocky Assorted",
    jpTitle: "ポッキー詰め合わせ",
    category: "SNACK",
    price: "65.000 đ",
    oldPrice: null,
    tag: "NEW",
    desc: "Assorted flavors of Pocky sticks",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
  },
]);

const searchQuery = ref('');
const selectedCategory = ref<string | null>(null);
const selectedTag = ref<string | null>(null);
const showFilters = ref(false);

const categories = ['FOOD', 'DRINK', 'SNACK'];
const tags = ['NEW', 'SALE'];

const filteredProducts = computed(() => {
  let filtered = allProducts.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product =>
      product.title.toLowerCase().includes(query) ||
      product.jpTitle.toLowerCase().includes(query) ||
      product.desc.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category === selectedCategory.value);
  }

  // Tag filter
  if (selectedTag.value) {
    filtered = filtered.filter(product => product.tag === selectedTag.value);
  }

  return filtered;
});

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = null;
  selectedTag.value = null;
};

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedTag.value;
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
          @click="showFilters = !showFilters"
          class="md:hidden px-6 py-3 bg-black text-white font-semibold uppercase text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <Filter class="h-5 w-5" />
          Lọc
        </button>

        <!-- Filter Buttons (Desktop) -->
        <div class="hidden md:flex items-center gap-3">
          <button
            @click="showFilters = !showFilters"
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
        class="mt-6 p-6 bg-white border border-neutral-200 shadow-sm"
      >
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Category Filter -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900 mb-3">
              Danh mục
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="category in categories"
                :key="category"
                @click="selectedCategory = selectedCategory === category ? null : category"
                :class="[
                  'px-4 py-2 text-sm font-semibold uppercase transition-colors',
                  selectedCategory === category
                    ? 'bg-[#b3000f] text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                ]"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <!-- Tag Filter -->
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-900 mb-3">
              Nhãn
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in tags"
                :key="tag"
                @click="selectedTag = selectedTag === tag ? null : tag"
                :class="[
                  'px-4 py-2 text-sm font-semibold uppercase transition-colors',
                  selectedTag === tag
                    ? 'bg-[#b3000f] text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                ]"
              >
                {{ tag }}
              </button>
            </div>
          </div>
        </div>

        <!-- Clear Filters (Mobile) -->
        <div class="mt-4 pt-4 border-t border-neutral-200 md:hidden">
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="w-full px-6 py-3 bg-white border border-neutral-300 text-neutral-700 font-semibold uppercase text-sm flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
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
          {{ selectedCategory }}
        </span>
        <span
          v-if="selectedTag"
          class="px-3 py-1 bg-[#b3000f] text-white text-sm font-semibold uppercase"
        >
          {{ selectedTag }}
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
          Tìm thấy <span class="font-semibold text-[#b3000f]">{{ filteredProducts.length }}</span> sản phẩm
        </p>
      </div>

      <!-- Products Grid -->
      <div v-if="filteredProducts.length > 0" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="item in filteredProducts"
          :key="item.id"
          class="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
        >
          <div class="relative overflow-hidden">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div
              class="absolute top-3 left-3 px-3 py-1 text-sm font-semibold rounded text-white"
              :class="item.tag === 'SALE' ? 'bg-[#b3000f]' : 'bg-black'"
            >
              {{ item.tag }}
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col gap-3">
            <div class="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
              {{ item.category }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 mb-1">{{ item.title }}</h3>
              <p class="text-sm text-neutral-500">{{ item.jpTitle }}</p>
            </div>
            <p class="text-sm text-neutral-600 leading-relaxed flex-1">{{ item.desc }}</p>
            <div class="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div class="flex items-baseline gap-2">
                <span class="text-red-600 font-semibold text-lg">{{ item.price }}</span>
                <span
                  v-if="item.oldPrice"
                  class="text-sm text-neutral-400 line-through"
                >
                  {{ item.oldPrice }}
                </span>
              </div>
              <button
                class="h-9 w-9 flex items-center justify-center border border-neutral-300 hover:border-[#b3000f] hover:bg-[#b3000f] hover:text-white transition-all duration-200"
              >
                🛒
              </button>
            </div>
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
    </div>
  </section>
</template>

<style scoped>
input::placeholder {
  color: #9ca3af;
}
</style>
