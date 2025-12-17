<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui';
import Header from '@/shared/components/header/Header.vue';
import Footer from '@/shared/components/footer/Footer.vue';
import headerConstant from '@/shared/constants/header.constant';
</script>

<template>
  <n-layout position="absolute" :native-scrollbar="false" class="h-screen">
    <Header :items="headerConstant" />
    <n-layout :native-scrollbar="false" position="absolute" class="h-screen">
      <n-layout-content content-style="padding: 64px 0">
        <RouterView />  
      </n-layout-content>
    </n-layout>
    <Footer />
  </n-layout>
</template>

<style lang="css" scoped></style>