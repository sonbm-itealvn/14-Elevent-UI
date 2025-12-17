<script setup lang="ts">
import { NMenu, type MenuOption } from "naive-ui";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import type { Header } from "@/core/models/header.model";
import { buildMenuOptions } from "@/shared/utils";

const props = defineProps<{
  mode: "horizontal" | "vertical";
  data?: Header[];
}>();

const router = useRouter();
const route = useRoute();


const menuOptions = computed<MenuOption[]>(() => buildMenuOptions(props.data ?? [], "", props.mode));

const activeKey = computed(() => route.path);

function handleUpdateValue(key: string) {
  if (key && key.startsWith("/")) {
    router.push(key);
  }
}
</script>

<template>
  <n-menu
    :mode="mode"
    :options="menuOptions"
    :value="activeKey"
    @update:value="handleUpdateValue"
  />
</template>
