<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PublicProductService from '@/core/services/api/public-product.service';
import type { PublicProduct } from '@/core/services/api/public-product.service';
import { useMessage } from 'naive-ui';
import { Bolt } from '@vicons/tabler';

const message = useMessage();
const bestSellers = ref<PublicProduct[]>([]);
const loading = ref(false);

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

const loadBestSellers = async () => {
  try {
    loading.value = true;
    const products = await PublicProductService.getTopSelling(20); // Load nhiều hơn để hiển thị
    bestSellers.value = products;
  } catch (error: any) {
    console.error('Error loading best sellers:', error);
    message.error('Lỗi khi tải sản phẩm bán chạy');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBestSellers();
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
          <span>Best Sellers</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">
          Sản Phẩm <span class="text-red-500">Bán Chạy</span>
        </h1>
        <p class="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto">
          ベストセラー商品
        </p>
      </div>
    </div>
  </section>

  <!-- Best Sellers Section -->
  <section class="bg-[#f7f7f7] py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-6xl mx-auto text-center mb-10">
      <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-red-600 font-semibold mb-3">
        <span class="h-[2px] w-12 bg-red-600"></span>
        <span>Sản phẩm bán chạy</span>
        <span class="h-[2px] w-12 bg-red-600"></span>
      </div>
      <p class="text-neutral-500 text-sm">ベストセラー商品</p>
    </div>

    <div v-if="loading" class="max-w-6xl mx-auto text-center py-10">
      <p class="text-neutral-500">Đang tải...</p>
    </div>
    <div v-else-if="bestSellers.length > 0" class="max-w-6xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(item, index) in bestSellers"
        :key="item.id"
        class="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border border-neutral-200 flex flex-col rounded-md overflow-hidden"
      >
        <router-link :to="{ name: 'ProductDetail', params: { slug: item.slug } }" class="block flex-1">
          <div class="relative bg-neutral-50 flex items-center justify-center" style="height: 200px;">
            <img :src="item.thumbnail || 'https://via.placeholder.com/400'" :alt="item.name" class="max-w-full max-h-full object-contain" />
            <!-- Badge góc trên bên trái -->
            <div v-if="item.isOnSale" class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 text-sm font-semibold rounded flex items-center gap-1">
              <Bolt class="h-4 w-4" />
              FLASH SALE
            </div>
            <div v-else class="absolute top-3 left-3 bg-[#b3000f] text-white px-3 py-1 text-sm font-semibold rounded">
              #{{ index + 1 }}
            </div>
            <!-- % Sale góc trên bên phải -->
            <div v-if="item.isOnSale && item.salePercentage" class="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">
              -{{ item.salePercentage }}%
            </div>
          </div>

          <div class="p-5 flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 uppercase tracking-wide line-clamp-2">{{ item.name }}</h3>
              <p v-if="item.brand" class="text-sm text-neutral-500">{{ item.brand }}</p>
            </div>
          </div>
        </router-link>
        <div class="px-5 pb-4 pt-0 flex flex-col gap-1 border-t border-neutral-100">
          <div v-if="item.isOnSale && item.salePercentage && item.minPrice" class="flex flex-col gap-1">
            <!-- Giá gốc với đường gạch ngang -->
            <span class="text-neutral-400 text-sm line-through">
              {{ formatPrice(calculateOriginalPrice(item.minPrice, item.salePercentage)) }}
            </span>
            <!-- Giá sale -->
            <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
          </div>
          <div v-else>
            <span class="text-red-600 font-semibold text-lg">{{ formatPrice(item.minPrice) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="max-w-6xl mx-auto text-center py-16">
      <p class="text-neutral-500">Chưa có sản phẩm bán chạy.</p>
    </div>
  </section>
</template>

