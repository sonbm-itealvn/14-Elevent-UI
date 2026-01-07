<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { User, Mail, Phone, MapPin, Camera, DeviceFloppy, Edit } from '@vicons/tabler';
import UserProfileService from '@/core/services/api/user-profile.service';
import { useMessage } from 'naive-ui';
import type { User as UserType } from '@/domain/models/user.model';

const message = useMessage();
const isEditing = ref(false);
const isLoading = ref(false);
const loadingProfile = ref(false);

const userProfile = ref({
  fullName: '',
  email: '',
  phone: '',
  avatar: null as string | null,
});

const originalProfile = ref({ ...userProfile.value });
const userData = ref<UserType | null>(null);

const loadUserProfile = async () => {
  try {
    loadingProfile.value = true;
    const user = await UserProfileService.getCurrentUser();
    userData.value = user;
    
    // Map dữ liệu từ API vào userProfile
    userProfile.value = {
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || null,
    };
    
    originalProfile.value = { ...userProfile.value };
  } catch (error: any) {
    console.error('Error loading profile:', error);
    message.error(error?.response?.data?.message || 'Không thể tải thông tin người dùng');
  } finally {
    loadingProfile.value = false;
  }
};

onMounted(() => {
  loadUserProfile();
});

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
    const updateData: { fullName?: string; phone?: string } = {};
    
    if (userProfile.value.fullName !== originalProfile.value.fullName) {
      updateData.fullName = userProfile.value.fullName;
    }
    
    if (userProfile.value.phone !== originalProfile.value.phone) {
      updateData.phone = userProfile.value.phone;
    }
    
    if (Object.keys(updateData).length > 0) {
      const updatedUser = await UserProfileService.updateProfile(updateData);
      userData.value = updatedUser;
      message.success('Cập nhật thông tin thành công');
    }
    
    isEditing.value = false;
    originalProfile.value = { ...userProfile.value };
  } catch (error: any) {
    console.error('Error saving profile:', error);
    message.error(error?.response?.data?.message || 'Không thể cập nhật thông tin');
  } finally {
    isLoading.value = false;
  }
};

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      isLoading.value = true;
      const updatedUser = await UserProfileService.updateAvatar(file);
      userData.value = updatedUser;
      userProfile.value.avatar = updatedUser.avatar || null;
      originalProfile.value.avatar = updatedUser.avatar || null;
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      message.error(error?.response?.data?.message || 'Không thể cập nhật ảnh đại diện');
    } finally {
      isLoading.value = false;
      // Reset input để có thể chọn lại cùng file
      if (target) target.value = '';
    }
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
              class="w-48 h-48 rounded-full overflow-hidden border-4 border-[#b3000f] shadow-lg bg-white"
            >
              <img
                :src="userProfile.avatar"
                :alt="userProfile.fullName"
                class="w-full h-full object-cover"
                @error="userProfile.avatar = null"
              />
            </div>
            <div
              v-else
              class="w-48 h-48 rounded-full bg-neutral-100 border-4 border-[#b3000f] shadow-lg flex items-center justify-center"
            >
              <component :is="User" class="h-24 w-24 text-neutral-400" />
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

          <!-- Loading State -->
          <div v-if="loadingProfile" class="text-center py-8">
            <p class="text-neutral-500">Đang tải thông tin...</p>
          </div>

          <form v-else @submit.prevent="handleSave" class="space-y-6">
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

            <!-- Role -->
            <div v-if="userData">
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Vai Trò
              </label>
              <div class="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 text-neutral-600">
                {{ userData.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng' }}
              </div>
            </div>

            <!-- Provider -->
            <div v-if="userData">
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Phương Thức Đăng Nhập
              </label>
              <div class="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 text-neutral-600">
                {{ userData.provider === 'GOOGLE' ? 'Google' : userData.provider === 'FACEBOOK' ? 'Facebook' : 'Email/Mật khẩu' }}
              </div>
            </div>

            <!-- Email Verified -->
            <div v-if="userData">
              <label class="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wide">
                Trạng Thái Email
              </label>
              <div class="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 text-neutral-600">
                {{ userData.emailVerifiedAt ? 'Đã xác thực' : 'Chưa xác thực' }}
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

