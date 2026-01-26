<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { NConfigProvider, lightTheme, darkTheme, NLoadingBarProvider, NNotificationProvider, NMessageProvider } from 'naive-ui';
import useThemeStore from '@/ui/stores/theme.store';
import { useAppUpdate } from '@/shared/composable/useAppUpdate';

const themeStore = useThemeStore();
const theme = computed(() => themeStore.getTheme);

// Enable auto-update checking
useAppUpdate();

</script>

<template>
  <n-config-provider :theme="theme === 'light' ? lightTheme : darkTheme">
    <n-message-provider>
      <n-notification-provider>
        <n-loading-bar-provider>
          <RouterView/>
        </n-loading-bar-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
</style>
