<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui';
import Header from '@/shared/components/header/Header.vue';
import Footer from '@/shared/components/footer/Footer.vue';
import Sidebar from '@/shared/components/sidebar/Sidebar.vue';
import Breadcrumb from '@/shared/components/breadcrumb/Breadcrumb.vue';
import headerConstant from '@/shared/constants/header.constant';
</script>

<template>
  <n-layout position="absolute" :native-scrollbar="false" class="h-screen">
    <Header/>
    <n-layout has-sider position="absolute" class="h-screen">
      <Sidebar />
      <n-layout :native-scrollbar="false">
        <n-layout-content content-style="padding: 64px 24px;" >
          <div class="flex flex-col gap-4">
            <Breadcrumb :items="headerConstant" :is-dashboard="true" />
            <RouterView />
          </div>
        </n-layout-content>
      </n-layout>
    </n-layout>
    <Footer />
  </n-layout>
</template>

<style lang="css" scoped></style>