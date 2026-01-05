<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { User, Mail, Phone, MapPin, Camera, DeviceFloppy, Edit } from '@vicons/tabler';

const isEditing = ref(false);
const isLoading = ref(false);

onMounted(() => {
  console.log('Profile component mounted');
});

const userProfile = ref({
  fullName: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '+84 123 456 789',
  address: '123 Đường ABC, Quận XYZ, Hà Nội',
  avatar: null as string | null,
  dateOfBirth: '1990-01-01',
  gender: 'male',
});

const originalProfile = ref({ ...userProfile.value });

const handleEdit = () => {
  isEditing.value = true;
  originalProfile.value = { ...userProfile.value };
};

const handleCancel = () => {
  isEditing.value = false;
  userProfile.value = { ...originalProfile.value };
};

const handleSave = async () => {
  isLoading.value = true;
  try {
    // TODO: Implement save profile API call
    // await userService.updateProfile(userProfile.value);
    console.log('Saving profile:', userProfile.value);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    isEditing.value = false;
    originalProfile.value = { ...userProfile.value };
  } catch (error) {
    console.error('Error saving profile:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      userProfile.value.avatar = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const getInitials = computed(() => {
  const names = userProfile.value.fullName.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return userProfile.value.fullName.substring(0, 2).toUpperCase();
});
</script>

<template>
  <!-- Hero Section -->
  <section class="relative bg-black text-white py-16 md:py-24">
    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6 md:px-10 lg:px-14">
      <div class="text-center space-y-4">
        <div class="flex items-center justify-center gap-3 text-sm uppercase tracking-[0.25em] text-red-500 font-semibold">
          <span class="h-[2px] w-12 bg-red-600"></span>
          <span>My Profile</span>
          <span class="h-[2px] w-12 bg-red-600"></span>
        </div>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">
          Thông Tin <span class="text-red-500">Cá Nhân</span>
        </h1>
        <p class="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto">
          プロフィール
        </p>
      </div>
    </div>
  </section>

  <!-- Profile Section -->
  <section class="bg-white py-14 px-4 md:px-8 lg:px-12">
    <div class="max-w-4xl mx-auto">
      <div class="grid gap-8 lg:grid-cols-[300px,1fr]">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center">
          <div class="relative mb-4">
            <div
              v-if="userProfile.avatar"
              class="w-48 h-48 rounded-full overflow-hidden border-4 border-[#b3000f] shadow-lg"
            >
              <img
                :src="userProfile.avatar"
                :alt="userProfile.fullName"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-48 h-48 rounded-full bg-[#b3000f] flex items-center justify-center text-white text-5xl font-bold border-4 border-[#b3000f] shadow-lg"
            >
              {{ getInitials }}
            </div>
            
            <label
              v-if="isEditing"
              class="absolute bottom-0 right-0 h-12 w-12 bg-[#b3000f] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#c00015] transition-colors shadow-lg"
            >
              <component :is="Camera" class="h-6 w-6 text-white" />
              <input
                type="file"
                accept="image/*"
                @change="handleAvatarChange"
                class="hidden"
              />
            </label>
          </div>
          
          <h2 class="text-2xl font-bold text-neutral-900 mb-1 text-center">
            {{ userProfile.fullName }}
          </h2>
          <p class="text-neutral-500 text-sm mb-6 text-center">{{ userProfile.email }}</p>
          
          <div v-if="!isEditing" class="w-full">
            <button
              @click="handleEdit"
              class="w-full px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] text-white font-semibold uppercase text-sm transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <component :is="Edit" class="h-5 w-5" />
              Chỉnh Sửa
            </button>
          </div>
        </div>

        <!-- Profile Information -->
        <div class="bg-[#f7f7f7] border border-neutral-200 p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-neutral-900 uppercase tracking-wide">
              Thông Tin Chi Tiết
            </h3>
          </div>

          <form @submit.prevent="handleSave" class="space-y-6">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Họ và Tên
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <component :is="User" class="h-5 w-5" />
                </div>
                <input
                  v-if="isEditing"
                  v-model="userProfile.fullName"
                  type="text"
                  required
                  class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                />
                <div v-else class="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 text-neutral-900">
                  {{ userProfile.fullName }}
                </div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Email
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <component :is="Mail" class="h-5 w-5" />
                </div>
                <div class="w-full pl-12 pr-4 py-3 bg-neutral-100 border border-neutral-200 text-neutral-600">
                  {{ userProfile.email }}
                </div>
                <p class="mt-1 text-xs text-neutral-500">Email không thể thay đổi</p>
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Số Điện Thoại
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <component :is="Phone" class="h-5 w-5" />
                </div>
                <input
                  v-if="isEditing"
                  v-model="userProfile.phone"
                  type="tel"
                  required
                  class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
                />
                <div v-else class="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 text-neutral-900">
                  {{ userProfile.phone }}
                </div>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Địa Chỉ
              </label>
              <div class="relative">
                <div class="absolute left-4 top-3 text-neutral-400">
                  <component :is="MapPin" class="h-5 w-5" />
                </div>
                <textarea
                  v-if="isEditing"
                  v-model="userProfile.address"
                  rows="3"
                  class="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900 resize-none"
                ></textarea>
                <div v-else class="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 text-neutral-900 min-h-[80px]">
                  {{ userProfile.address }}
                </div>
              </div>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Ngày Sinh
              </label>
              <input
                v-if="isEditing"
                v-model="userProfile.dateOfBirth"
                type="date"
                class="w-full px-4 py-3 border border-neutral-300 focus:border-[#b3000f] focus:outline-none focus:ring-2 focus:ring-red-500/20 bg-white text-neutral-900"
              />
              <div v-else class="w-full px-4 py-3 bg-white border border-neutral-200 text-neutral-900">
                {{ new Date(userProfile.dateOfBirth).toLocaleDateString('vi-VN') }}
              </div>
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Giới Tính
              </label>
              <div v-if="isEditing" class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="userProfile.gender"
                    type="radio"
                    value="male"
                    class="w-4 h-4 text-[#b3000f] border-neutral-300 focus:ring-red-500"
                  />
                  <span class="text-neutral-700">Nam</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="userProfile.gender"
                    type="radio"
                    value="female"
                    class="w-4 h-4 text-[#b3000f] border-neutral-300 focus:ring-red-500"
                  />
                  <span class="text-neutral-700">Nữ</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="userProfile.gender"
                    type="radio"
                    value="other"
                    class="w-4 h-4 text-[#b3000f] border-neutral-300 focus:ring-red-500"
                  />
                  <span class="text-neutral-700">Khác</span>
                </label>
              </div>
              <div v-else class="w-full px-4 py-3 bg-white border border-neutral-200 text-neutral-900">
                {{ userProfile.gender === 'male' ? 'Nam' : userProfile.gender === 'female' ? 'Nữ' : 'Khác' }}
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="isEditing" class="flex gap-4 pt-4">
              <button
                type="submit"
                :disabled="isLoading"
                class="flex-1 px-6 py-3 bg-[#b3000f] hover:bg-[#c00015] disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-semibold uppercase text-sm transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <component :is="DeviceFloppy" class="h-5 w-5" />
                {{ isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi' }}
              </button>
              <button
                type="button"
                @click="handleCancel"
                class="flex-1 px-6 py-3 bg-white border-2 border-neutral-300 hover:border-neutral-400 text-neutral-700 font-semibold uppercase text-sm transition-colors duration-200"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

