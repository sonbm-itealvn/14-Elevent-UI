<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, Lock, User, Phone, BrandGoogle, BrandFacebook } from '@vicons/tabler';
import useAuthStore from '@/ui/stores/auth.store';
import useCartStore from '@/ui/stores/cart.store';
import StorageService from '@/core/services/storages/storage.service';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const CART_TOKEN_KEY = 'cartToken';

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Chấp nhận số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx hoặc 84xxxxxxxxx
  const phoneRegex = /^(0|\+84|84)[1-9][0-9]{8,9}$/;
  // Loại bỏ khoảng trắng và dấu gạch ngang để kiểm tra
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone);
};

const validateForm = () => {
  // Validate email
  if (!formData.value.email.trim()) {
    errorMessage.value = 'Vui lòng nhập email.';
    return false;
  }
  if (!validateEmail(formData.value.email)) {
    errorMessage.value = 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.';
    return false;
  }
  
  // Validate phone
  if (!formData.value.phone.trim()) {
    errorMessage.value = 'Vui lòng nhập số điện thoại.';
    return false;
  }
  if (!validatePhone(formData.value.phone)) {
    errorMessage.value = 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số, bắt đầu bằng 0 hoặc +84).';
    return false;
  }
  
  // Validate password
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.';
    return false;
  }
  if (formData.value.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự.';
    return false;
  }
  return true;
};

const handleRegister = async (e: Event) => {
  e.preventDefault();
  errorMessage.value = '';
  successMessage.value = '';

  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    // Lấy cartToken nếu có (guest cart) - lấy trước khi đăng ký
    const cartToken = StorageService.getLocalStorageItem(CART_TOKEN_KEY) || undefined;
    
    // Đăng ký với cartToken
    // Backend sẽ tự động merge guest cart vào user cart trong register endpoint
    await authStore.register(
      formData.value.email,
      formData.value.password,
      formData.value.fullName,
      formData.value.phone,
      cartToken
    );
    
    // Sau khi đăng ký thành công, XÓA cartToken ngay lập tức
    // để đảm bảo các request sau chỉ gửi JWT, không gửi X-Cart-Token
    // Backend sẽ tự động merge nếu có cả JWT và X-Cart-Token trong các request tiếp theo
    StorageService.removeLocalStorageItem(CART_TOKEN_KEY);
    
    // Load cart để lấy user cart (đã được merge từ backend)
    await cartStore.loadCart();
    
    successMessage.value = 'Đăng ký thành công! Đang chuyển hướng...';
    
    // Redirect to home after successful registration
    setTimeout(() => {
      router.push({ name: 'Home' });
    }, 1500);
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleLogin = () => {
  // TODO: Implement Google OAuth login
  console.log('Google login');
  // window.location.href = '/api/oauth2/authorize/google';
};

const handleFacebookLogin = () => {
  // TODO: Implement Facebook OAuth login
  console.log('Facebook login');
  // window.location.href = '/api/oauth2/authorize/facebook';
};

const goToLogin = () => {
  router.push('/auth/login');
};
</script>

<template>
  <div class="min-h-screen bg-[#f7f7f7] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-600 font-semibold mb-4">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>Join Us</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
          Đăng <span class="text-[#b3000f]">Ký</span>
        </h1>
        <p class="text-neutral-500 text-sm">新規登録</p>
      </div>

      <!-- Register Card -->
      <div class="bg-white border border-neutral-200 shadow-lg p-8">
        <!-- Success Message -->
        <div
          v-if="successMessage"
          class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded"
        >
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
        >
          {{ errorMessage }}
        </div>

        <!-- Register Form -->
        <form @submit="handleRegister" class="space-y-5">
          <!-- Full Name Field -->
          <div>
            <label for="fullName" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
              Họ và Tên
            </label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <User class="h-5 w-5" />
              </div>
              <input
                id="fullName"
                v-model="formData.fullName"
                type="text"
                required
                class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="Nhập họ và tên"
              />
            </div>
          </div>

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

          <!-- Phone Field -->
          <div>
            <label for="phone" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
              Số Điện Thoại
            </label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Phone class="h-5 w-5" />
              </div>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
                class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="+84 123 456 789"
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
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
              Xác Nhận Mật Khẩu
            </label>
            <div class="relative">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Lock class="h-5 w-5" />
              </div>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full pl-12 pr-12 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              required
              class="mt-1 w-4 h-4 text-[#b3000f] border-neutral-300 rounded focus:ring-red-500"
            />
            <span class="text-neutral-600">
              Tôi đồng ý với
              <a href="#" class="text-[#b3000f] hover:underline font-semibold">Điều khoản dịch vụ</a>
              và
              <a href="#" class="text-[#b3000f] hover:underline font-semibold">Chính sách bảo mật</a>
            </span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold uppercase text-sm transition-colors duration-200"
          >
            {{ isLoading ? 'Đang đăng ký...' : 'Đăng Ký' }}
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
            Đăng ký với Google
          </button>
          <button
            @click="handleFacebookLogin"
            class="w-full px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 font-semibold uppercase text-sm transition-all duration-200 flex items-center justify-center gap-3"
          >
            <BrandFacebook class="h-5 w-5" />
            Đăng ký với Facebook
          </button>
        </div>

        <!-- Login Link -->
        <div class="mt-6 text-center text-sm text-neutral-600">
          <span>Đã có tài khoản? </span>
          <button
            @click="goToLogin"
            class="text-[#b3000f] hover:underline font-semibold"
          >
            Đăng nhập ngay
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
