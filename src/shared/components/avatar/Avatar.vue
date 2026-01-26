<script setup lang="ts">
import { NAvatar, NIcon, NDropdown, type DropdownOption } from 'naive-ui';
import useThemeStore from '@/ui/stores/theme.store';
import useAuthStore from '@/ui/stores/auth.store';
import { computed, h, ref, watch, type Component } from 'vue';
import { useRouter } from 'vue-router';
import { User } from '@vicons/tabler';
import menuAvatarOptions from '@/shared/constants/menu-avatar.constant';

// Props
const props = defineProps<{
  url?: string;
  name?: string;
}>();

// Stores & router
const themeStore = useThemeStore();
const authStore = useAuthStore();
const theme = computed(() => themeStore.getTheme);
const router = useRouter();

// Track avatar load error
const avatarError = ref(false);
const hasAvatar = computed(() => props.url && !avatarError.value);

const handleAvatarError = () => {
  avatarError.value = true;
};

watch(
  () => props.url,
  () => {
    // Mỗi khi url thay đổi, reset trạng thái lỗi
    avatarError.value = false;
  }
);

// Helpers
const displayName = computed(() => props.name ?? 'User');

const renderIcon = (icon: Component) => () =>
  h(NIcon, null, { default: () => h(icon) });

// Options for dropdown (no render types except user info)
const options = computed<DropdownOption[]>(() => [
  {
    key: 'user-info',
    type: 'render',
    render: () =>
      h(
        'div',
        { class: 'flex items-center gap-2 px-3 py-2 cursor-default' },
        [
          h(
            NAvatar,
            {
              src: hasAvatar.value ? props.url : undefined,
              round: true,
              size: 36,
              color: hasAvatar.value ? undefined : theme.value === 'light' ? '#f3f4f6' : '#374151'
              ,
              onError: handleAvatarError
            },
            {
              default: () =>
                hasAvatar.value
                  ? null
                  : h(
                      NIcon,
                      {
                        size: 20,
                        style: {
                          color: theme.value === 'light' ? '#9ca3af' : '#d1d5db'
                        }
                      },
                      { default: () => h(User) }
                    )
            }
          ),
          h(
            'span',
            {
              class: 'font-medium',
              style: {
                color: theme.value === 'light' ? 'black' : 'white',
                fontSize: '14px',
                fontWeight: '500'
              }
            },
            displayName.value
          )
        ]
      )
  },
  { type: 'divider' },
  ...menuAvatarOptions.map(option => ({
    key: option.key,
    label: option.label,
    icon: renderIcon(option.icon)
  }))
]);

// Handle select (SPA navigation only)
const handleMenuSelect = (key: string | number) => {
  const keyStr = String(key);
  if (keyStr === 'user-info') return;

  if (keyStr === 'profile') {
    router.push({ name: 'Profile' });
  } else if (keyStr === 'order-history') {
    router.push({ name: 'OrderHistory' });
  } else if (keyStr === 'logout') {
    authStore.logout().then(() => {
      router.push({ name: 'Home' });
    });
  } else if (keyStr === 'support') {
    router.push({ name: 'Contact' });
  }
};
</script>

<template>
  <n-dropdown
    trigger="click"
    :options="options"
    @select="handleMenuSelect"
  >
    <n-avatar
      v-if="hasAvatar"
      lazy
      :src="url"
      round
      class="cursor-pointer"
      :on-error="handleAvatarError"
    />
    <n-avatar
      v-else
      round
      :color="theme === 'light' ? '#f3f4f6' : '#374151'"
      class="cursor-pointer"
    >
      <n-icon
        :size="20"
        :color="theme === 'light' ? '#9ca3af' : '#d1d5db'"
      >
        <User />
      </n-icon>
    </n-avatar>
  </n-dropdown>
</template>