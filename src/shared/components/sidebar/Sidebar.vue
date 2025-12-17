<script setup lang="ts">
import { NLayoutSider } from 'naive-ui';
import HeaderMenu from '../header/HeaderMenu.vue';
import headerConstants from '@/shared/constants/header.constant';
</script>

<template>
    <n-layout-sider bordered show-trigger collapse-mode="width" :collapsed-width="64" 
        :native-scrollbar="false">
        <HeaderMenu mode="vertical" :collapsed-width="64" class="pt-18" :collapsed-icon-size="22" :data="headerConstants" />
    </n-layout-sider>
</template>
