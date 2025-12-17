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
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: () => import("@/ui/views/error/Error404.vue"),
        }
    ],
});


router.beforeEach((to, from, next) => {
    //check router is here. auth, admin,..... lam deo gi thi lam. check theo meta
    next();

});

export default router;