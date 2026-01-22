<script setup lang="ts">
import { NLayout, NLayoutContent } from 'naive-ui';
import Header from '@/shared/components/header/Header.vue';
import Sidebar from '@/shared/components/sidebar/Sidebar.vue';
import Breadcrumb from '@/shared/components/breadcrumb/Breadcrumb.vue';
import adminConstants from '@/shared/constants/admin.constant';
</script>

<template>
  <NLayout class="h-screen overflow-hidden">
    <Header/>
    <NLayout has-sider class="h-[calc(100vh-64px)]">
      <Sidebar :menu-data="adminConstants" />
      <NLayoutContent class="overflow-y-auto bg-gray-50">
        <div class="px-6 py-6 flex flex-col gap-6">
          <Breadcrumb :items="adminConstants" :is-dashboard="true" />
          <div class="flex-1">
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