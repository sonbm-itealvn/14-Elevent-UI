<script setup lang="ts">
import Header from '@/shared/components/header/Header.vue';
import Footer from '@/shared/components/footer/Footer.vue';
import ChatBubble from '@/shared/components/chat-bubble/ChatBubble.vue';
import headerConstant from '@/shared/constants/header.constant';
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-900">
    <Header :items="headerConstant" />
    <main class="flex-1">
      <RouterView />
    </main>
    <Footer />
    <ChatBubble />
  </div>
</template>

<style lang="css" scoped></style>