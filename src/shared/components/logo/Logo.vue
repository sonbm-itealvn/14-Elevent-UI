<script setup lang="ts">
import Logo from '@/assets/svg/logo.svg';

</script>

<template>
    <div class="flex items-center">
        <div class="flex h-full items-center justify-center gap-2">
            <img class="h-full" :src="Logo" alt="Brand Logo" />
            <span class="text-2xl font-bold">
                FilmHub
            </span>
        </div>
    </div>
</template>
