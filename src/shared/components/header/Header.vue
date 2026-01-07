<script setup lang="ts">
import { computed, ref, h } from 'vue';
import { useRouter } from 'vue-router';
import { NLayoutHeader, NSpace, NDropdown, NButton } from 'naive-ui';
import Logo from '@/shared/components/logo/Logo.vue';
import Button from '@/shared/components/button/Button.vue';
import Avatar from '@/shared/components/avatar/Avatar.vue';
import { Moon, Sun, Menu2, Search, ShoppingCart, User } from '@vicons/tabler';
import useThemeStore from '@/ui/stores/theme.store';
import useAuthStore from '@/ui/stores/auth.store';
import HeaderMenu from './HeaderMenu.vue';
import { isDesktop } from '@/shared/composable/useWindowResize';
import Language from '../language/Language.vue';
import type { Header } from '@/core/models/header.model';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();
const theme = computed(() => themeStore.getTheme);
const handleThemeToggle = () => themeStore.setTheme();
const showDropdown = ref(false);
const props = defineProps<{
  items?: Header[];
}>();

const handleLoginClick = () => {
  router.push({ name: 'Login' });
};

const dropdownOptions = [
  {
    key: 'menu',
    type: 'render',
    render: () =>
      h('div', { class: 'w-[260px] py-2 pl-2' }, [
        h(
          'div',
          { class: 'max-h-[400px] overflow-y-auto pr-2 small-scrollbar' },
          [
            h(HeaderMenu, { mode: 'vertical', data: props.items ?? [] })
          ]
        )
      ])
  }
];
</script>

<template>
  <n-layout-header
    class="px-6 py-3 flex justify-between items-center sticky top-0 z-20 bg-black text-white border-b-[3px] border-[#b3000f]"
  >
    <n-space class="flex items-center flex-nowrap! gap-3">
      <n-dropdown
        v-if="!isDesktop"
        trigger="click"
        :show="showDropdown"
        @update:show="showDropdown = $event"
        :options="dropdownOptions"
        placement="bottom-end"
      >
        <Button class="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 !border-none">
          <template #icon>
            <Menu2 />
          </template>
        </Button>
      </n-dropdown>
      <Logo class="h-12" />
    </n-space>

    <div class="hidden lg:flex flex-1 justify-center">
      <HeaderMenu :mode="'horizontal'" :data="props.items ?? []" />
    </div>

    <n-space>
      <div class="flex items-center gap-2">
        <Button class="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 !border-none">
          <template #icon>
            <Search />
          </template>
        </Button>
        <Button class="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 !border-none">
          <template #icon>
            <ShoppingCart />
          </template>
        </Button>
        <Language/>
        <Button
          class="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 !border-none"
          @click="handleThemeToggle"
        >
          <template #icon>
            <component :is="theme === 'light' ? Moon : Sun" />
          </template>
        </Button>
        <!-- Show Avatar if authenticated, Login button if not -->
        <Avatar 
          v-if="authStore.isAuthenticated && authStore.user"
          :url="authStore.user.avatar"
          :name="authStore.user.fullName"
        />
        <NButton
          v-else
          class="h-11 px-4 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 !border-none text-white"
          @click="handleLoginClick"
        >
          <template #icon>
            <User class="h-5 w-5 mr-2" />
          </template>
          Đăng nhập
        </NButton>
      </div>
    </n-space>
  </n-layout-header>
</template>

<style scoped>
:deep(.n-menu) {
  background: transparent;
}

:deep(.n-menu-item) {
  --n-item-text-color: #e5e7eb;
  --n-item-text-color-hover: #ffffff;
  --n-item-text-color-active: #ffffff;
  --n-item-icon-color: #e5e7eb;
  --n-item-icon-color-active: #ffffff;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(.n-menu-item-content) {
  padding: 0 14px;
}

:deep(.n-menu-item-content)::after {
  content: "";
  display: block;
  margin-top: 8px;
  height: 2px;
  background: transparent;
  transition: background-color 0.2s ease;
}

:deep(.n-menu-item--selected .n-menu-item-content)::after,
:deep(.n-menu-item-content:hover)::after {
  background: #b3000f;
}

:deep(.n-menu-item-content:hover) {
  color: #ffffff;
}
</style>
