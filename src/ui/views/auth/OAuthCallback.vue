<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useAuthStore from '@/ui/stores/auth.store';
import useCartStore from '@/ui/stores/cart.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const statusMessage = ref('Đang xác thực...');
const hasError = ref(false);

const doRedirect = async () => {
  try {
    const token = route.query.token as string | undefined;
    const refreshToken = (route.query.refresh_token as string) || (route.query.refreshToken as string) || undefined;
    if (token && refreshToken) {
      // Lưu token nếu BE trả qua query
      const JwtService = (await import('@/core/services/storages/jwt.service')).default;
      JwtService.setAccessToken(token);
      JwtService.setRefreshToken(refreshToken);
    }

    // Sau khi backend redirect về, token có thể đã được set (cookie/JWT)
    // → fetchCurrentUser để lấy thông tin và set store
    await authStore.fetchCurrentUser();

    // Load cart (auto merge nếu cần)
    await cartStore.loadCart();

    // Lấy authorized redirect uri từ query (backend trả về)
    const redirectUri =
      (route.query['authorized-redirect-uri'] as string) ||
      (route.query['redirect'] as string) ||
      '/';

    await router.replace(redirectUri);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    statusMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Không thể hoàn tất đăng nhập. Vui lòng thử lại.';
    hasError.value = true;
  }
};

onMounted(() => {
  void doRedirect();
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4">
    <div class="bg-white border border-neutral-200 shadow-lg rounded-lg px-8 py-10 w-full max-w-md text-center">
      <div class="mb-4 text-2xl font-semibold text-neutral-900">Đang xử lý đăng nhập</div>
      <div class="text-sm text-neutral-600 mb-6">
        {{ statusMessage }}
      </div>
      <div v-if="!hasError" class="flex items-center justify-center gap-2 text-[#b3000f]">
        <span class="h-2 w-2 bg-[#b3000f] rounded-full animate-ping"></span>
        <span class="h-2 w-2 bg-[#b3000f] rounded-full animate-ping [animation-delay:150ms]"></span>
        <span class="h-2 w-2 bg-[#b3000f] rounded-full animate-ping [animation-delay:300ms]"></span>
      </div>
      <div v-else class="text-sm text-red-600">
        Nếu vấn đề tiếp diễn, vui lòng thử lại hoặc đăng nhập thủ công.
      </div>
    </div>
  </div>
</template>

