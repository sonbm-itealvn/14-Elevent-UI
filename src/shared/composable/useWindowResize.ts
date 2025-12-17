import { useWindowSize } from '@vueuse/core';
import { computed } from 'vue';

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const isTablet = computed(() => width.value >= 768 && width.value <= 1280);
const isDesktop = computed(() => width.value > 1280);

export { isMobile, isTablet, isDesktop };   