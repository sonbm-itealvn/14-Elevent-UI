<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, Send } from '@vicons/tabler';
import AuthService from '@/core/services/api/auth.service';

const router = useRouter();
const formData = ref({ email: '' });
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  successMessage.value = '';
  errorMessage.value = '';
  
  // Validate email
  if (!formData.value.email.trim()) {
    errorMessage.value = 'Vui lòng nhập email.';
    return;
  }
  if (!validateEmail(formData.value.email)) {
    errorMessage.value = 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.';
    return;
  }
  
  isSubmitting.value = true;
  try {
    const message = await AuthService.forgotPassword({ email: formData.value.email });
    successMessage.value = message || 'Vui lòng kiểm tra email để nhận mã đặt lại mật khẩu.';
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
  } finally {
    isSubmitting.value = false;
  }
};

const goToLogin = () => {
  router.push({ name: 'Login' });
};
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f7] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-600 font-semibold mb-4">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Quên mật khẩu</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
          Lấy lại <span class="text-[#b3000f]">mật khẩu</span>
        </h1>
        <p class="text-neutral-500 text-sm">Nhập email để nhận liên kết đặt lại mật khẩu.</p>
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
            <label for="email" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
              Email
            </label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail class="h-5 w-5" />
              </div>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold uppercase text-sm transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Send class="h-5 w-5" />
            <span>{{ isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu' }}</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-neutral-600">
          Nhớ mật khẩu?
          <button class="text-[#b3000f] font-semibold hover:underline" type="button" @click="goToLogin">Đăng nhập</button>
        </div>
      </div>
    </div>
  </div>
</template>

