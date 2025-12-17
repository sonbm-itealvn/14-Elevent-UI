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
    ],
};

export default MainRoutes;