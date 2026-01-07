import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/ui/layouts/dashboard/DashboardLayout.vue";

const AdminRoutes: RouteRecordRaw = {
  path: "/admin",
  name: "Admin",
  component: DashboardLayout,
  meta: {
    requiresAuth: true,
    roles: ["ADMIN"],
  },
  children: [
    {
      path: "",
      name: "Dashboard",
      component: () => import("@/ui/views/admin/dashboard/Dashboard.vue"),
    },
    {
      path: "users",
      name: "AdminUsers",
      component: () => import("@/ui/views/admin/users/Users.vue"),
    },
    {
      path: "categories",
      name: "AdminCategories",
      component: () => import("@/ui/views/admin/categories/Categories.vue"),
    },
    {
      path: "products",
      name: "AdminProducts",
      component: () => import("@/ui/views/admin/products/Products.vue"),
    },
    {
      path: "orders",
      name: "AdminOrders",
      component: () => import("@/ui/views/admin/orders/Orders.vue"),
    },
    {
      path: "invoices",
      name: "AdminInvoices",
      component: () => import("@/ui/views/admin/invoices/Invoices.vue"),
    },
    {
      path: "media",
      name: "AdminMedia",
      component: () => import("@/ui/views/admin/media/Media.vue"),
    },
  ],
};

export default AdminRoutes;
