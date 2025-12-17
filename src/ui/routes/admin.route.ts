import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/ui/layouts/dashboard/DashboardLayout.vue";

const AdminRoutes: RouteRecordRaw = {
  path: "/admin",
  name: "Admin",
  component: DashboardLayout,
  meta: {
    requiresAuth: true,
    roles: ["admin"],
  },
  children: [
    {
      path: "",
      name: "Dashboard",
      component: () => import("@/ui/views/admin/dashboard/Dashboard.vue"),
    },
  ],
};

export default AdminRoutes;
