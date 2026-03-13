<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NLayoutSider } from 'naive-ui';
import HeaderMenu from '../header/HeaderMenu.vue';
import headerConstants from '@/shared/constants/header.constant';
import type { Header } from '@/core/models/header.model';
import { isDesktop, isMobile } from '@/shared/composable/useWindowResize';

const props = withDefaults(defineProps<{
  menuData?: Header[];
}>(), {
  menuData: () => headerConstants,
});

// Trên mobile: dùng state local để bấm trigger mới mở/đóng được. Trên desktop: luôn mở.
const mobileCollapsed = ref(true);
const collapsed = computed(() => (isDesktop.value ? false : mobileCollapsed.value));

function handleUpdateCollapsed(value: boolean) {
  mobileCollapsed.value = value;
}

// Khi chuyển sang desktop thì đóng state mobile để lần sau vào mobile bắt đầu đóng
watch(isDesktop, (desk) => {
  if (desk) mobileCollapsed.value = true;
});
</script>

<template>
  <n-layout-sider
    bordered
    show-trigger
    collapse-mode="width"
    :width="280"
    :collapsed-width="isMobile ? 0 : 64"
    :collapsed="collapsed"
    :native-scrollbar="false"
    @update:collapsed="handleUpdateCollapsed"
  >
    <HeaderMenu
      mode="vertical"
      :collapsed-width="64"
      class="pt-18"
      :collapsed-icon-size="22"
      :data="props.menuData"
    />
  </n-layout-sider>
</template>
