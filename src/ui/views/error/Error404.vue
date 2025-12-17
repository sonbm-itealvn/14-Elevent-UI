<script setup lang="ts">
import { useRouter } from 'vue-router';
import Notfound from '@/assets/svg/404.svg'
import Button from '@/shared/components/button/Button.vue';
import { ArrowLeft } from '@vicons/tabler';
import { NLayout } from 'naive-ui';
const router = useRouter();

const handleClick = () => {
    router.push('/');
}
</script>

<template>
    <n-layout>
        <div class="flex flex-col gap-10 items-center h-screen">
            <img :src="Notfound" alt="Not found" class="w-1/2 !pointer-events-none" />
            <span class="text-2xl font-bold">Oops! Page not found</span>
            <Button @click="handleClick" type="primary" size="large" label="Go to home">
                <template #icon>
                    <ArrowLeft />
                </template>
            </Button>
        </div>
    </n-layout>
</template>