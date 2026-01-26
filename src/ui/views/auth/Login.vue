<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Mail, Lock, BrandGoogle, BrandFacebook } from '@vicons/tabler';
import useAuthStore from '@/ui/stores/auth.store';
import useCartStore from '@/ui/stores/cart.store';
import StorageService from '@/core/services/storages/storage.service';
import AuthService from '@/core/services/api/auth.service';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

const CART_TOKEN_KEY = 'cartToken';

const formData = ref({
  email: '',
  password: '',
});

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const oauthUrls = ref<Record<string, string>>({});

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleLogin = async (e: Event) => {
  e.preventDefault();
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
  
  isLoading.value = true;

  try {
    // Lấy cartToken nếu có (guest cart) - lấy trước khi đăng nhập
    const cartToken = StorageService.getLocalStorageItem(CART_TOKEN_KEY) || undefined;
    
    // Đăng nhập với cartToken
    // Backend sẽ tự động merge guest cart vào user cart trong login endpoint
    await authStore.login(formData.value.email, formData.value.password, cartToken);
    
    // Sau khi đăng nhập thành công, XÓA cartToken ngay lập tức
    // để đảm bảo các request sau chỉ gửi JWT, không gửi X-Cart-Token
    // Backend sẽ tự động merge nếu có cả JWT và X-Cart-Token trong các request tiếp theo
    StorageService.removeLocalStorageItem(CART_TOKEN_KEY);
    
    // Load cart để lấy user cart (đã được merge từ backend)
    await cartStore.loadCart();
    
    // Get redirect path from query or default based on role
    const redirect = route.query.redirect as string;
    
    if (redirect) {
      router.push(redirect);
    } else if (authStore.isAdmin) {
      router.push({ name: 'Dashboard' });
    } else {
      router.push({ name: 'Home' });
    }
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = () => {
  redirectToProvider('GOOGLE');
};

const handleFacebookLogin = () => {
  redirectToProvider('FACEBOOK');
};

const goToRegister = () => {
  router.push('/auth/register');
};

const loadOAuthLoginUrls = async () => {
  try {
    const urls = await AuthService.getOAuthLoginUrls();
    oauthUrls.value = urls.reduce<Record<string, string>>((acc, cur) => {
      // Normalize provider key to uppercase to match button handlers
      const key = (cur.provider || '').toString().toUpperCase();
      acc[key] = cur.authorizationUrl;
      return acc;
    }, {});
  } catch (error: any) {
    console.error('Failed to load OAuth login URLs:', error);
  }
};

const redirectToProvider = async (provider: 'GOOGLE' | 'FACEBOOK') => {
  const key = provider.toUpperCase();
  if (!oauthUrls.value[key]) {
    await loadOAuthLoginUrls();
  }
  const targetUrl = oauthUrls.value[key];
  if (targetUrl) {
    window.location.href = targetUrl;
  } else {
    errorMessage.value = 'Không lấy được đường dẫn đăng nhập ' + provider;
  }
};

onMounted(() => {
  loadOAuthLoginUrls();
});
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f7] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-600 font-semibold mb-4">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Welcome Back</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
          Đăng <span class="text-[#b3000f]">Nhập</span>
        </h1>
        <p class="text-neutral-500 text-sm">ログイン</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white border border-neutral-200 shadow-lg p-8">
        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
        >
          {{ errorMessage }}
        </div>

        <!-- Login Form -->
        <form @submit="handleLogin" class="space-y-5">
          <!-- Email Field -->
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

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
              Mật Khẩu
            </label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock class="h-5 w-5" />
              </div>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-12 pr-12 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <!-- Forgot Password Link -->
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 text-[#b3000f] border-neutral-300 rounded focus:ring-red-500" />
              <span class="text-neutral-600">Ghi nhớ đăng nhập</span>
            </label>
            <RouterLink to="/auth/forgot-password" class="text-[#b3000f] hover:underline font-semibold">
              Quên mật khẩu?
            </RouterLink>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold uppercase text-sm transition-colors duration-200"
          >
            {{ isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-4">
          <div class="flex-1 h-[1px] bg-neutral-300"></div>
          <span class="text-sm text-neutral-500 uppercase">Hoặc</span>
          <div class="flex-1 h-[1px] bg-neutral-300"></div>
        </div>

        <!-- Social Login Buttons -->
        <div class="space-y-3">
          <button
            @click="handleGoogleLogin"
            class="w-full px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 font-semibold uppercase text-sm transition-all duration-200 flex items-center justify-center gap-3"
          >
            <BrandGoogle class="h-5 w-5" />
            Đăng nhập với Google
          </button>
          <button
            @click="handleFacebookLogin"
            class="w-full px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 font-semibold uppercase text-sm transition-all duration-200 flex items-center justify-center gap-3"
          >
            <BrandFacebook class="h-5 w-5" />
            Đăng nhập với Facebook
          </button>
        </div>

        <!-- Register Link -->
        <div class="mt-6 text-center text-sm text-neutral-600">
          <span>Chưa có tài khoản? </span>
          <button
            @click="goToRegister"
            class="text-[#b3000f] hover:underline font-semibold"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input::placeholder {
  color: #9ca3af;
}
</style>
