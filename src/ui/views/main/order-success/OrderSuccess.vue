<template>
  <div class="order-success-page min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Success Animation Card -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header với animation -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center relative overflow-hidden">
          <!-- Decorative circles -->
          <div class="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"></div>
          
          <!-- Success Icon với animation -->
          <div class="relative z-10">
            <div class="success-icon-container inline-block mb-6">
              <div class="success-checkmark">
                <div class="check-icon">
                  <span class="icon-line line-tip"></span>
                  <span class="icon-line line-long"></span>
                  <div class="icon-circle"></div>
                  <div class="icon-fix"></div>
                </div>
              </div>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              Đặt hàng thành công!
            </h1>
            <p class="text-green-100 text-lg">
              Cảm ơn bạn đã tin tưởng và mua sắm tại 14Elevent
            </p>
          </div>
        </div>

        <!-- Order Information -->
        <div class="px-8 py-8">
          <!-- Order Code -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                <p class="text-2xl font-bold text-gray-900">{{ orderCode || '---' }}</p>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm font-semibold text-green-700">Đã xác nhận</span>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="space-y-4 mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Những bước tiếp theo</h2>
            
            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-blue-600 font-bold">1</span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 mb-1">Xác nhận đơn hàng</p>
                <p class="text-sm text-gray-600">Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn</p>
              </div>
            </div>

            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span class="text-purple-600 font-bold">2</span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 mb-1">Chuẩn bị hàng</p>
                <p class="text-sm text-gray-600">Đơn hàng của bạn đang được chuẩn bị và đóng gói cẩn thận</p>
              </div>
            </div>

            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span class="text-green-600 font-bold">3</span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 mb-1">Giao hàng</p>
                <p class="text-sm text-gray-600">Bạn sẽ nhận được thông báo khi đơn hàng được giao đến bạn</p>
              </div>
            </div>
          </div>

          <!-- Support Info -->
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <div class="flex gap-3">
              <svg class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="font-semibold text-amber-900 mb-1">Cần hỗ trợ?</p>
                <p class="text-sm text-amber-800">
                  Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <n-button
              type="primary"
              size="large"
              class="flex-1"
              @click="goToOrderHistory"
              :disabled="!authStore.isAuthenticated || !orderId"
            >
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </template>
              Xem chi tiết đơn hàng
            </n-button>
            <n-button
              size="large"
              class="flex-1"
              @click="goToHome"
            >
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </template>
              Tiếp tục mua sắm
            </n-button>
          </div>
        </div>
      </div>

      <!-- Additional Info Card -->
      <div class="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin hữu ích</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">Thời gian giao hàng</p>
              <p class="text-xs text-gray-600">3-5 ngày làm việc</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">Thanh toán an toàn</p>
              <p class="text-xs text-gray-600">COD - Thanh toán khi nhận</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton } from 'naive-ui';
import useAuthStore from '@/ui/stores/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const orderCode = ref<string>('');
const orderId = ref<number | null>(null);

onMounted(() => {
  // Lấy orderCode và orderId từ query params
  const code = route.query.orderCode as string;
  const id = route.query.orderId as string;
  
  if (code) {
    orderCode.value = code;
  } else {
    // Nếu không có orderCode, redirect về home
    router.push({ name: 'Home' });
    return;
  }
  
  if (id) {
    orderId.value = parseInt(id, 10);
  }
});

const goToOrderHistory = () => {
  if (authStore.isAuthenticated) {
    // Nếu có orderId, redirect đến trang chi tiết đơn hàng
    if (orderId.value) {
      router.push({ 
        name: 'OrderDetail', 
        params: { id: orderId.value.toString() } 
      });
    } else {
      // Nếu không có orderId, redirect đến trang lịch sử
      router.push({ name: 'OrderHistory' });
    }
  }
};

const goToHome = () => {
  router.push({ name: 'Home' });
};
</script>

<style scoped>
/* Success Checkmark Animation */
.success-icon-container {
  animation: scaleIn 0.5s ease-out;
}

.success-checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #4ade80;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
  position: relative;
  margin: 0 auto;
}

.check-icon {
  width: 80px;
  height: 80px;
  position: relative;
  border-radius: 50%;
  box-sizing: content-box;
  border: 4px solid #4ade80;
}

.check-icon::before {
  top: 3px;
  left: -2px;
  width: 30px;
  transform-origin: 100% 50%;
  border-radius: 100px 0 0 100px;
}

.check-icon::after {
  top: 0;
  left: 30px;
  width: 60px;
  transform-origin: 0 50%;
  border-radius: 0 100px 100px 0;
  animation: rotate-circle 4.25s ease-in;
}

.check-icon::before,
.check-icon::after {
  content: '';
  height: 100px;
  position: absolute;
  background: #ffffff;
  transform: rotate(-45deg);
}

.icon-line {
  height: 5px;
  background-color: #4ade80;
  display: block;
  border-radius: 2px;
  position: absolute;
  z-index: 10;
}

.icon-line.line-tip {
  top: 46px;
  left: 14px;
  width: 25px;
  transform: rotate(45deg);
  animation: icon-line-tip 0.75s;
}

.icon-line.line-long {
  top: 38px;
  right: 8px;
  width: 47px;
  transform: rotate(-45deg);
  animation: icon-line-long 0.75s;
}

.icon-circle {
  top: -4px;
  left: -4px;
  z-index: 10;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: absolute;
  box-sizing: content-box;
  border: 4px solid rgba(76, 175, 80, 0.5);
}

.icon-fix {
  top: 8px;
  width: 5px;
  left: 26px;
  z-index: 1;
  height: 85px;
  position: absolute;
  transform: rotate(-45deg);
  background-color: #ffffff;
}

@keyframes icon-line-tip {
  0% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  54% {
    width: 0;
    left: 1px;
    top: 19px;
  }
  70% {
    width: 50px;
    left: -8px;
    top: 37px;
  }
  84% {
    width: 17px;
    left: 21px;
    top: 48px;
  }
  100% {
    width: 25px;
    left: 14px;
    top: 46px;
  }
}

@keyframes icon-line-long {
  0% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  65% {
    width: 0;
    right: 46px;
    top: 54px;
  }
  84% {
    width: 55px;
    right: 0px;
    top: 35px;
  }
  100% {
    width: 47px;
    right: 8px;
    top: 38px;
  }
}

@keyframes rotate-circle {
  0% {
    transform: rotate(-45deg);
  }
  5% {
    transform: rotate(-45deg);
  }
  12% {
    transform: rotate(-405deg);
  }
  100% {
    transform: rotate(-405deg);
  }
}

@keyframes fill {
  0% {
    box-shadow: inset 0px 0px 0px #4ade80;
  }
  100% {
    box-shadow: inset 0px 0px 0px 30px #4ade80;
  }
}

@keyframes scale {
  0%,
  100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

