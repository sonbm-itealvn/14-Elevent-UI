import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "@/ui/layouts/auth/AuthLayout.vue";

const AuthRoutes: RouteRecordRaw = {
  path: "/auth",
  component: AuthLayout,
  meta: {
    requiresAuth: false,
  },
  children: [
    {
        path: "login",
        name: "Login",
        component: () => import("@/ui/views/auth/Login.vue"),
    },
    {
        path: "register",
        name: "Register",
        component: () => import("@/ui/views/auth/Register.vue"),
    },
    {
        path: "forgot-password",
        name: "ForgotPassword",
        component: () => import("@/ui/views/auth/ForgotPassword.vue"),
    },
    {
        path: "reset-password",
        name: "ResetPassword",
        component: () => import("@/ui/views/auth/ResetPassword.vue"),
    },
    {
        path: "oauth2/callback",
        name: "OAuthCallback",
        component: () => import("@/ui/views/auth/OAuthCallback.vue"),
    }
  ],
};

export default AuthRoutes;