<script setup lang="ts">
import { computed, ref, h, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NLayoutHeader, NSpace, NDropdown, NButton, NBadge } from 'naive-ui';
import Logo from '@/shared/components/logo/Logo.vue';
import Button from '@/shared/components/button/Button.vue';
import Avatar from '@/shared/components/avatar/Avatar.vue';
import { Moon, Sun, Menu2, Search, ShoppingCart, User } from '@vicons/tabler';
import useThemeStore from '@/ui/stores/theme.store';
import useAuthStore from '@/ui/stores/auth.store';
import useCartStore from '@/ui/stores/cart.store';
import HeaderMenu from './HeaderMenu.vue';
import { isDesktop } from '@/shared/composable/useWindowResize';
import type { Header } from '@/core/models/header.model';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();
const theme = computed(() => themeStore.getTheme);
const isLight = computed(() => theme.value === 'light');
const handleThemeToggle = () => themeStore.setTheme();
const showDropdown = ref(false);
const props = defineProps<{
  items?: Header[];
}>();

const handleLoginClick = () => {
  router.push({ name: 'Login' });
};

const handleCartClick = () => {
  router.push({ name: 'Cart' });
};

// Load cart khi component mount (chỉ nếu chưa có cart data)
onMounted(async () => {
  // Chỉ load cart nếu chưa có data hoặc đang không loading
  if (!cartStore.cart && !cartStore.loading) {
    await cartStore.loadCart();
  }
});

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
    :class="[
      'px-6 py-3 flex justify-between items-center sticky top-0 z-20 transition-colors duration-200',
      isLight
        ? 'bg-white text-neutral-900 border-b border-neutral-200 shadow-sm header--light'
        : 'bg-black text-white border-b-[3px] border-[#b3000f] header--dark'
    ]"
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
        <Button
          class="h-11 w-11 flex items-center justify-center rounded-full transition-colors duration-150"
          :class="isLight
            ? 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800'
            : 'bg-white/10 hover:bg-white/20 !border-none text-white'"
        >
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
        <Button
          class="h-11 w-11 flex items-center justify-center rounded-full transition-colors duration-150"
          :class="isLight
            ? 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800'
            : 'bg-white/10 hover:bg-white/25 !border-none text-white'"
        >
          <template #icon>
            <Search />
          </template>
        </Button>
        <n-badge :value="cartStore.totalItems" :show-zero="false" :max="99">
          <Button 
            class="h-11 w-11 flex items-center justify-center rounded-full transition-colors duration-150 relative"
            :class="isLight
              ? 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800'
              : 'bg-white/10 hover:bg-white/25 !border-none text-white'"
            @click="handleCartClick"
          >
            <template #icon>
              <ShoppingCart />
            </template>
          </Button>
        </n-badge>
        <Button
          class="h-11 w-11 flex items-center justify-center rounded-full transition-colors duration-150"
          :class="isLight
            ? 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800'
            : 'bg-white/10 hover:bg-white/25 !border-none text-white'"
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
          class="h-11 px-4 flex items-center justify-center rounded-full transition-colors duration-150"
          :class="isLight
            ? 'bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-800'
            : 'bg-white/10 hover:bg-white/25 !border-none text-white'"
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
:global(.header--light .n-badge-sup) {
  background-color: #b3000f;
}

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

:global(.header--light .n-menu-item) {
  --n-item-text-color: #4b5563;
  --n-item-text-color-hover: #111827;
  --n-item-text-color-active: #111827;
  --n-item-icon-color: #4b5563;
  --n-item-icon-color-active: #111827;
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
