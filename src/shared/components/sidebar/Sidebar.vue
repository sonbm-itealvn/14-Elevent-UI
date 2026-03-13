<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { NLayoutSider } from 'naive-ui';
import HeaderMenu from '../header/HeaderMenu.vue';
import headerConstants from '@/shared/constants/header.constant';
import type { Header } from '@/core/models/header.model';
import { isDesktop, isMobile } from '@/shared/composable/useWindowResize';

const props = withDefaults(defineProps<{
  menuData?: Header[];
  /** Controlled: parent truyền collapsed (dùng trong DashboardLayout để sync với hamburger header) */
  collapsed?: boolean;
}>(), {
  menuData: () => headerConstants,
  collapsed: undefined,
});

const emit = defineEmits<{ 'update:collapsed': [value: boolean] }>();

// Trên mobile: controlled từ parent nếu có props.collapsed, không thì dùng state local.
const mobileCollapsed = ref(true);
const isControlled = computed(() => props.collapsed !== undefined && props.collapsed !== null);
const collapsed = computed(() => {
  if (isDesktop.value) return false;
  if (isControlled.value) return props.collapsed ?? true;
  return mobileCollapsed.value;
});

function handleUpdateCollapsed(value: boolean) {
  if (isControlled.value) {
    emit('update:collapsed', value);
  } else {
    mobileCollapsed.value = value;
  }
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
