import { createRouter, createWebHistory } from "vue-router";
import AuthRoutes from "./auth.route";
import MainRoutes from "./main.route";
import AdminRoutes from "./admin.route";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        AuthRoutes,
        MainRoutes,
        AdminRoutes,
        {
            path: "/forgot-password",
            name: "ForgotPasswordDirect",
            redirect: (to) => ({ path: "/auth/forgot-password", query: to.query }),
            meta: { requiresAuth: false },
        },
        {
            path: "/reset-password",
            name: "ResetPasswordDirect",
            redirect: (to) => ({ path: "/auth/reset-password", query: to.query }),
            meta: { requiresAuth: false },
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("@/ui/views/error/Error404.vue"),
        }
    ],
});


import useAuthStore from "@/ui/stores/auth.store";
import useCartStore from "@/ui/stores/cart.store";
import JwtService from "@/core/services/storages/jwt.service";

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  
  // Nếu BE redirect kèm token/refresh_token trên URL, lưu và làm sạch query
  const token = to.query.token as string | undefined;
  const refreshToken = (to.query.refresh_token as string) || (to.query.refreshToken as string) || undefined;
  if (token && refreshToken) {
    JwtService.setAccessToken(token);
    JwtService.setRefreshToken(refreshToken);
    // Làm sạch query tránh lộ token trên URL
    const cleanedQuery = { ...to.query };
    delete cleanedQuery.token;
    delete cleanedQuery.refresh_token;
    delete cleanedQuery.refreshToken;
    await authStore.fetchCurrentUser();
    await cartStore.loadCart();
    next({ path: to.path, query: cleanedQuery, replace: true });
    return;
  }
  
  // Check authentication status
  await authStore.checkAuth();
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles as string[] | undefined;
  
  // If route requires auth but user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: "Login", query: { redirect: to.fullPath } });
    return;
  }
  
  // If route requires specific roles (e.g., admin)
  if (requiredRoles && requiredRoles.length > 0) {
    if (!authStore.isAuthenticated) {
      next({ name: "Login", query: { redirect: to.fullPath } });
      return;
    }
    
    // Check if user has required role (case-insensitive)
    const userRole = authStore.user?.role?.toUpperCase();
    const hasRole = requiredRoles.some(role => role.toUpperCase() === userRole);
    
    if (!hasRole) {
      // User doesn't have required role, redirect to home
      next({ name: "Home" });
      return;
    }
  }
  
  // If user is authenticated and trying to access auth pages, redirect based on role
  if (to.matched.some(record => record.path === "/auth") && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      next({ name: "Dashboard" });
    } else {
      next({ name: "Home" });
    }
    return;
  }
  
  next();
});

export default router;