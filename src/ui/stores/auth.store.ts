import { defineStore } from "pinia";
import { ref, computed } from "vue";
import AuthService from "@/core/services/api/auth.service";
import type { User } from "@/domain/models/user.model";

const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");
  const isCustomer = computed(() => user.value?.role === "CUSTOMER");

  const login = async (email: string, password: string, cartToken?: string) => {
    try {
      loading.value = true;
      await AuthService.login({ email, password, cartToken });
      // Fetch user info after login
      await fetchCurrentUser();
    } finally {
      loading.value = false;
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    cartToken?: string
  ) => {
    try {
      loading.value = true;
      await AuthService.register({ email, password, fullName, phone, cartToken });
      // Fetch user info after register
      await fetchCurrentUser();
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      user.value = null;
    }
  };

  const fetchCurrentUser = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const currentUser = await AuthService.getCurrentUser();
        user.value = currentUser;
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      user.value = null;
    }
  };

  const checkAuth = async () => {
    if (AuthService.isAuthenticated() && !user.value) {
      await fetchCurrentUser();
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isCustomer,
    login,
    register,
    logout,
    fetchCurrentUser,
    checkAuth,
  };
});

export default useAuthStore;

