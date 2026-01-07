<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Lock, Send } from '@vicons/tabler';
import AuthService from '@/core/services/api/auth.service';

const route = useRoute();
const router = useRouter();

const token = computed(() => (route.query.token as string) || '');
const formData = ref({
  newPassword: '',
  confirmPassword: '',
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  successMessage.value = '';
  errorMessage.value = '';

  if (!token.value) {
    errorMessage.value = 'Thiếu token đặt lại mật khẩu. Vui lòng kiểm tra lại email.';
    return;
  }

  if (formData.value.newPassword !== formData.value.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.';
    return;
  }

  isSubmitting.value = true;
  try {
    const message = await AuthService.resetPassword({
      token: token.value,
      newPassword: formData.value.newPassword,
      confirmPassword: formData.value.confirmPassword,
    });
    successMessage.value = message || 'Đặt lại mật khẩu thành công.';
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 1200);
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f7] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-600 font-semibold mb-4">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Đặt lại mật khẩu</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
          Tạo <span class="text-[#b3000f]">mật khẩu mới</span>
        </h1>
        <p class="text-neutral-500 text-sm">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      </div>

      <div class="bg-white border border-neutral-200 shadow-lg p-8">
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          {{ successMessage }}
        </div>

        <form @submit="handleSubmit" class="space-y-5">
          <div>
            <label for="new-password" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
              Mật khẩu mới
            </label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock class="h-5 w-5" />
              </div>
              <input
                id="new-password"
                v-model="formData.newPassword"
                type="password"
                minlength="6"
                required
                class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
              Xác nhận mật khẩu
            </label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock class="h-5 w-5" />
              </div>
              <input
                id="confirm-password"
                v-model="formData.confirmPassword"
                type="password"
                minlength="6"
                required
                class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold uppercase text-sm transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Send class="h-5 w-5" />
            <span>{{ isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

