<script setup lang="ts">
import { NLayoutSider } from 'naive-ui';
import HeaderMenu from '../header/HeaderMenu.vue';
import headerConstants from '@/shared/constants/header.constant';
import type { Header } from '@/core/models/header.model';
import { isDesktop } from '@/shared/composable/useWindowResize';

const props = withDefaults(defineProps<{
  menuData?: Header[];
}>(), {
  menuData: () => headerConstants,
});
</script>

<template>
  <n-layout-sider
    bordered
    show-trigger
    collapse-mode="width"
    :collapsed-width="64"
    :collapsed="!isDesktop"
    :native-scrollbar="false"
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
