import type { RouteRecordRaw } from "vue-router";
import MainLayout from "@/ui/layouts/main/MainLayout.vue";

const MainRoutes: RouteRecordRaw = {
    path: "/",
    component: MainLayout,
    meta: {
        requiresAuth: false, // Public pages
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
            path: "/products/:slug",
            name: "ProductDetail",
            component: () => import("@/ui/views/main/products/ProductDetail.vue"),
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
        },
        {
            path: "/contact",
            name: "Contact",
            component: () => import("@/ui/views/main/contact/Contact.vue"),
        },
        {
            path: "/profile",
            name: "Profile",
            component: () => import("@/ui/views/main/profile/Profile.vue"),
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: "/cart",
            name: "Cart",
            component: () => import("@/ui/views/main/cart/Cart.vue"),
        },
        {
            path: "articles/:id",
            name: "ArticleDetail",
            component: () => import("@/ui/views/main/articles/ArticleDetail.vue"),
        },
        {
            path: "/order-history",
            name: "OrderHistory",
            component: () => import("@/ui/views/main/order-history/OrderHistory.vue"),
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: "/order-history/:id",
            name: "OrderDetail",
            component: () => import("@/ui/views/main/order-history/OrderDetail.vue"),
            meta: {
                requiresAuth: true,
            },
        },
        {
            path: "/order-success",
            name: "OrderSuccess",
            component: () => import("@/ui/views/main/order-success/OrderSuccess.vue"),
        }
    ],
};

export default MainRoutes;