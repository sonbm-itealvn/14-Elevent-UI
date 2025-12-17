<script setup lang="ts">
import { NAvatar, NIcon, NDropdown } from 'naive-ui';
import useThemeStore from '@/ui/stores/theme.store';
import { computed, h, type Component } from 'vue';
import menuAvatarOptions from '@/shared/constants/menu-avatar.constant';

const themeStore = useThemeStore();
const theme = computed(() => themeStore.getTheme);

const getInitials = (name?: string | null) => {
  if (!name) return ''; 

  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  if (nameParts.length === 0) return '';

  const initials = nameParts
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return initials;
};

const name: string | null = 'John Doe'; 
const initials = computed(() => getInitials(name));


function renderIcon(icon: Component) {
  return () =>
    h(NIcon, null, {
      default: () => h(icon)
    });
}

const options = computed(() => {
  return [
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
            h('span', { class: 'font-medium',
                style: {
                    color: theme.value === 'light' ? 'black' : 'white',
                    fontSize: '14px',
                    fontWeight: '500'
                }
              }, name)
          ]
        )
    },
    { type: 'divider' },
    ...menuAvatarOptions.map((option) => ({
      label: option.label,
      key: option.key,
      icon: renderIcon(option.icon)
    }))
  ];
});

const props = defineProps<{
  url?: string;
}>();
</script>

<template>
  <n-dropdown trigger="click" :options="options">
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