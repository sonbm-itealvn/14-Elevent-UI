<script setup lang="ts">
import { ref, provide, watch } from 'vue';
import { useRoute } from 'vue-router';
import { NLayout, NLayoutContent } from 'naive-ui';
import Header from '@/shared/components/header/Header.vue';
import Sidebar from '@/shared/components/sidebar/Sidebar.vue';
import Breadcrumb from '@/shared/components/breadcrumb/Breadcrumb.vue';
import adminConstants from '@/shared/constants/admin.constant';

const route = useRoute();

// Trên mobile: Header cần mở sidebar khi bấm hamburger → share state qua provide/inject
const mobileSidebarOpen = ref(false);
provide('dashboardSidebar', {
  open: mobileSidebarOpen,
  toggle: () => { mobileSidebarOpen.value = !mobileSidebarOpen.value; },
});

// Chọn xong mục menu (đổi route) thì tự thu sidebar trên mobile
watch(() => route.path, () => {
  mobileSidebarOpen.value = false;
});
</script>

<template>
  <NLayout class="h-screen overflow-hidden">
    <Header :items="adminConstants" hide-nav-menu />
    <NLayout has-sider class="h-[calc(100vh-64px)]">
      <Sidebar :menu-data="adminConstants" :collapsed="!mobileSidebarOpen" @update:collapsed="(v: boolean) => (mobileSidebarOpen = !v)" />
      <NLayoutContent class="overflow-y-auto bg-gray-50">
        <div class="px-3 py-4 sm:px-6 sm:py-6 flex flex-col gap-4 sm:gap-6">
          <div class="hidden md:block">
            <Breadcrumb :items="adminConstants" :is-dashboard="true" />
          </div>
          <div class="flex-1 min-h-0">
            <RouterView />
          </div>
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style lang="css" scoped>
:deep(.n-layout-content) {
  height: 100%;
}
</style>