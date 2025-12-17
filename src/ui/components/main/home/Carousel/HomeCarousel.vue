<script setup lang="ts">
import { NCarousel } from 'naive-ui';
import { ref } from 'vue';

const source = ref()
</script>

<template>
    <n-carousel autoplay >
        <template v-for="items in source">

        </template>
    </n-carousel>
</template>

<style scoped>

</style>