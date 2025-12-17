<script setup lang="ts">
import { computed, ref, h } from 'vue';
import { NLayoutHeader, NSpace, NDropdown } from 'naive-ui';
import Logo from '@/shared/components/logo/Logo.vue';
import Button from '@/shared/components/button/Button.vue';
import { Moon, Sun, Menu2 } from '@vicons/tabler';
import useThemeStore from '@/ui/stores/theme.store';
import SearchBox from '@/shared/components/searchbox/SearchBox.vue';
import Avatar from '@/shared/components/avatar/Avatar.vue';
import HeaderMenu from './HeaderMenu.vue';
import { isDesktop } from '@/shared/composable/useWindowResize';
import Language from '../language/Language.vue';
import type { Header } from '@/core/models/header.model';

const themeStore = useThemeStore();
const theme = computed(() => themeStore.getTheme);
const handleThemeToggle = () => themeStore.setTheme();
const showDropdown = ref(false);
const props = defineProps<{
  items?: Header[];
}>();

const dropdownOptions = [
  {
    key: 'menu',
    type: 'render',
    render: () =>
      h('div', { class: 'w-[250px] py-2 pl-2' }, [
        h(
          'div',
          { class: 'max-h-[400px] overflow-y-auto pr-2 small-scrollbar' },
          [
            h(SearchBox, { class: 'w-full mb-2' }),
            h(HeaderMenu, { mode: 'vertical', data: props.items ?? [] })
          ]
        )
      ])
  }
];


</script>

<template>
  <n-layout-header
    class="px-3 py-2 flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-neutral-900"
  >
    <n-space class="flex items-center flex-nowrap!">
      <n-dropdown
        v-if="!isDesktop"
        trigger="click"
        :show="showDropdown"
        @update:show="showDropdown = $event"
        :options="dropdownOptions"
        placement="bottom-end"
      >
        <Button regular circle secondary class="flex items-center justify-center">
          <template #icon>
            <Menu2 />
          </template>
        </Button>
      </n-dropdown>
      <Logo class="h-10 py-1 mr-1" />
      <SearchBox v-if="isDesktop" />
    </n-space>

    <n-space class="hidden lg:flex" v-if="isDesktop">
      <HeaderMenu :mode="'horizontal'" :data="props.items ?? []" />
    </n-space>

    <n-space>
      <div class="flex items-center gap-2">
        <Language/>
        <Button
          type="primary"
          
          circle
          secondary
          @click="handleThemeToggle"
          class="flex items-center justify-center"
        >
          <template #icon>
            <component :is="theme === 'light' ? Moon : Sun" />
          </template>
        </Button>
        <Avatar />
      </div>
    </n-space>
  </n-layout-header>
</template>
