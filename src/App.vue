<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { RouterView } from 'vue-router';
import { NConfigProvider, lightTheme, darkTheme, NLoadingBarProvider, NNotificationProvider, NMessageProvider } from 'naive-ui';
import useThemeStore from '@/ui/stores/theme.store';
import { useAppUpdate } from '@/shared/composable/useAppUpdate';

const themeStore = useThemeStore();
const theme = computed(() => themeStore.getTheme);

// Sync dark class với HTML element khi app khởi động
onMounted(() => {
  themeStore.syncHtmlClass();
});

// Watch theme changes để sync dark class
watch(theme, () => {
  themeStore.syncHtmlClass();
});

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
