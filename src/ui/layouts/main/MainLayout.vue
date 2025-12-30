<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui';
import Header from '@/shared/components/header/Header.vue';
import Footer from '@/shared/components/footer/Footer.vue';
import headerConstant from '@/shared/constants/header.constant';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <Header :items="headerConstant" />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style lang="css" scoped></style>