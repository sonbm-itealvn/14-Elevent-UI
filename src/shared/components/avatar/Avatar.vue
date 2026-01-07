<script setup lang="ts">
import { NAvatar, NIcon, NDropdown, type DropdownOption } from 'naive-ui';
import useThemeStore from '@/ui/stores/theme.store';
import useAuthStore from '@/ui/stores/auth.store';
import { computed, h, type Component } from 'vue';
import { useRouter } from 'vue-router';
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

// Helpers
const getInitials = (name?: string | null) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
};

const displayName = computed(() => props.name ?? 'User');
const initials = computed(() => getInitials(displayName.value));

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
              src: props.url,
              round: true,
              size: 36,
              color: props.url ? undefined : theme.value === 'light' ? '#daf0e4' : '#243834'
            },
            {
              default: () =>
                props.url
                  ? null
                  : h(
                      'span',
                      {
                        style: {
                          color: theme.value === 'light' ? '#18a058' : '#63e2b7',
                          fontSize: '14px',
                          fontWeight: '500'
                        }
                      },
                      initials.value
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
  } else if (keyStr === 'logout') {
    authStore.logout().then(() => {
      router.push({ name: 'Home' });
    });
  } else if (keyStr === 'settings') {
    console.log('Settings - TODO');
  } else if (keyStr === 'support') {
    console.log('Support - TODO');
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
      v-if="url"
      lazy
      :src="url"
      round
      class="cursor-pointer"
    />
    <n-avatar
      v-else
      round
      :color="theme === 'light' ? '#daf0e4' : '#243834'"
      class="cursor-pointer"
    >
      <span
        :style="{
          color: theme === 'light' ? '#18a058' : '#63e2b7',
          fontSize: '14px',
          fontWeight: '500'
        }"
      >
        {{ initials }}
      </span>
    </n-avatar>
  </n-dropdown>
</template>