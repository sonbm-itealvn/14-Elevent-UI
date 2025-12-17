<script setup lang="ts">
import { NIcon, NInput } from 'naive-ui';
import { Search } from '@vicons/tabler';
</script>

<template>
    <n-input placeholder="Search" >
        <template #prefix>
            <n-icon :component="Search" />
        </template>
    </n-input>
</template>

<style lang="css" scoped></style>