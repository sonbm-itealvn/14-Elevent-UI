<script setup lang="ts">
import { NCarousel } from 'naive-ui';
import { ref } from 'vue';
import type { HomeCarousel } from '@/domain/models/home.carousel.model';

// Dữ liệu carousel từ backend (placeholder, sau này sẽ gọi API)
const source = ref<HomeCarousel[]>([]);
</script>

<template>
  <n-carousel autoplay v-if="source.length">
    <div
      v-for="item in source"
      :key="item.id"
      class="h-64 w-full bg-cover bg-center flex items-end justify-start p-6 text-white"
      :style="{ backgroundImage: `url(${item.imageUrl})` }"
    >
      <div class="bg-black/40 px-4 py-2 rounded">
        <div class="font-semibold text-lg">{{ item.title }}</div>
      </div>
    </div>
  </n-carousel>
</template>

<style scoped>
</style>