<script setup lang="ts">
import { NButton, NIcon, type ButtonProps as NButtonProps } from "naive-ui";

interface ButtonProps { 
    label?: string;
    type?: NButtonProps["type"]; 
    size?: NButtonProps["size"]; 
    disabled?: NButtonProps["disabled"]; 
    loading?: NButtonProps["loading"]; 
    onClick?: NButtonProps["onClick"]; 
}

const props = defineProps<ButtonProps>()
</script>

<template>
    <NButton :size="props.size" :loading="props.loading" :type="props.type" :disabled="props.disabled" @click="props.onClick"
        class="rounded-lg">
        <template #icon>
            <n-icon>
                <slot name="icon" />
            </n-icon>
        </template>
        <template #default v-if="props.label">
            {{ props.label }}
        </template>
    </NButton>
</template>
