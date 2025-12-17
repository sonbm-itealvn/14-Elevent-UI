<script setup lang="ts">
import { NDropdown, NButton, NIcon } from 'naive-ui';
import { Language as LanguageIcon } from '@vicons/tabler';
import { computed, h } from 'vue';
import languageConstants from '@/shared/constants/language.constant';
import useLanguageStore from '@/ui/stores/language.store';
import { Language as LanguageEnum } from '@/domain/enums/language.enum';
import { translate } from '@/shared/utils';

const languageStore = useLanguageStore();

const currentLocale = computed(() => languageStore.getLanguage);

const options = computed(() =>
  languageConstants.map(opt => ({
    key: opt.key,
    label: () => h('span', translate(opt.label)) 
  }))
);

const currentLabel = computed(() => translate(
  languageConstants.find(l => l.key === currentLocale.value)?.label ?? ''
));

const handleSelect = (key: LanguageEnum) => {
  languageStore.setLanguage(key);
};
</script>

<template>
  <n-dropdown
    :options="options"
    :value="currentLocale"
    @select="handleSelect"
    trigger="click"
  >
    <n-button quaternary>
      <template #icon>
        <n-icon :component="LanguageIcon" />
      </template>
      {{ currentLabel }}
    </n-button>
  </n-dropdown>
</template>
