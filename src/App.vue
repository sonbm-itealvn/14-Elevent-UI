<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { NConfigProvider, lightTheme, darkTheme, NLoadingBarProvider, NNotificationProvider } from 'naive-ui';
import useThemeStore from '@/ui/stores/theme.store';

const themeStore = useThemeStore();

const theme = computed(() => themeStore.getTheme);

</script>

<template>
  <n-config-provider :theme="theme === 'light' ? lightTheme : darkTheme">
    <n-notification-provider>
      <n-loading-bar-provider>
        <RouterView/>
      </n-loading-bar-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
</style>
