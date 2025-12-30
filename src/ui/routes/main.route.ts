import type { RouteRecordRaw } from "vue-router";
import MainLayout from "@/ui/layouts/main/MainLayout.vue";

const MainRoutes: RouteRecordRaw = {
    path: "/",
    component: MainLayout,
    meta: {
        requiresAuth: true,
    },
    children: [
        {
            path: "/",
            name: "Home",
            component: () => import("@/ui/views/main/home/Home.vue"),
        },
        {
            path: "/genres",
            name: "Genres",
            component: ()=> import("@/ui/views/main/genres/Genres.vue"),
        }
        ,
        {
            path: "/products",
            name: "Products",
            component: () => import("@/ui/views/main/products/Products.vue"),
        },
        {
            path: "/best-sellers",
            name: "BestSellers",
            component: () => import("@/ui/views/main/best-sellers/BestSellers.vue"),
        },
        {
            path: "/about",
            name: "About",
            component: () => import("@/ui/views/main/about/About.vue"),
        }
    ],
};

export default MainRoutes;