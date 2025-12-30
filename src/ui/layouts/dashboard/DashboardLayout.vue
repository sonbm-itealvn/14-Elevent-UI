<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui';
import Header from '@/shared/components/header/Header.vue';
import Footer from '@/shared/components/footer/Footer.vue';
import Sidebar from '@/shared/components/sidebar/Sidebar.vue';
import Breadcrumb from '@/shared/components/breadcrumb/Breadcrumb.vue';
import headerConstant from '@/shared/constants/header.constant';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <Header/>
    <div class="flex flex-1">
      <Sidebar />
      <main class="flex-1">
        <div class="px-6 py-4 flex flex-col gap-4">
          <Breadcrumb :items="headerConstant" :is-dashboard="true" />
          <RouterView />
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<style lang="css" scoped></style>