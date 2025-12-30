import type { Header } from "@/core/models/header.model";
import { Home, InfoCircle, ShoppingCart, Star } from "@vicons/tabler";

const headerConstants: Header[] = [
  {
    id: "home",
    icon: Home,
    title: "TRANG CHỦ",
    to: "/",
  },
  {
    id: "products",
    icon: ShoppingCart,
    title: "SẢN PHẨM",
    to: "/products",
  },
  {
    id: "best-sellers",
    icon: Star,
    title: "BÁN CHẠY",
    to: "/best-sellers",
  },
  {
    id: "about",
    icon: InfoCircle,
    title: "GIỚI THIỆU",
    to: "/about",
  },
];

export default headerConstants;
