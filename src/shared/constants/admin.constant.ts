import type { Header } from "@/core/models/header.model";
import { 
  Dashboard, 
  Users, 
  Folder, 
  Package, 
  ShoppingCart, 
  Receipt, 
  Photo,
  Ticket
} from "@vicons/tabler";

const adminConstants: Header[] = [
  {
    id: "admin-dashboard",
    icon: Dashboard,
    title: "Dashboard",
    to: "/admin",
  },
  {
    id: "admin-users",
    icon: Users,
    title: "Quản lý người dùng",
    to: "/admin/users",
  },
  {
    id: "admin-categories",
    icon: Folder,
    title: "Quản lý danh mục",
    to: "/admin/categories",
  },
  {
    id: "admin-products",
    icon: Package,
    title: "Quản lý sản phẩm",
    to: "/admin/products",
  },
  {
    id: "admin-orders",
    icon: ShoppingCart,
    title: "Quản lý đơn hàng",
    to: "/admin/orders",
  },
  {
    id: "admin-invoices",
    icon: Receipt,
    title: "Quản lý hóa đơn",
    to: "/admin/invoices",
  },
  {
    id: "admin-media",
    icon: Photo,
    title: "Quản lý media",
    to: "/admin/media",
  },
  {
    id: "admin-vouchers",
    icon: Ticket,
    title: "Quản lý voucher",
    to: "/admin/vouchers",
  },
];

export default adminConstants;

