import {
  Book,
  User2,
  LucideIcon,
  Wallet,
  BookMinus,
  Home,
  Barcode,
  QrCode,
  History,
  FlaskConical,
  Package,
  ShoppingBag,
} from "lucide-react";

interface MenuData {
  id: number;
  title: string;
  Icon: LucideIcon;
  link: string;
  role?: string[];
}

export const menu_data: MenuData[] = [
  {
    id: 1,
    title: "ملف المستخدم",
    Icon: User2,
    link: "/profile",
  },
  {
    id: 2,
    title: "كورساتي",
    Icon: Book,
    link: "/student_courses",
  },
];

export const admin_menu_data: MenuData[] = [
  {
    id: 1,
    title: "الرئيسية",
    link: "/admin/dashboard",
    Icon: Home,
    role: ["ADMIN"],
  },
  {
    id: 2,
    title: "الكورسات",
    link: "/admin/courses",
    Icon: BookMinus,
    role: ["ADMIN", "CONSTRUCTOR"],
  },
  {
    id: 3,
    title: "المستخدمين",
    link: "/admin/users",
    Icon: User2,
    role: ["ADMIN"],
  },
  {
    id: 5,
    title: "الكوبونات",
    link: "/admin/coupons",
    Icon: QrCode,
    role: ["ADMIN", "CONSTRUCTOR"],
  },
  {
    id: 6,
    title: "بيانات العمليات",
    link: "/admin/history",
    Icon: History,
    role: ["ADMIN"],
  },
  {
    id: 7,
    link: `/admin/products`,
    title: "المنتجات",
    Icon: Package,
    role: ["ADMIN"],
  },
  {
    id: 8,
    link: `/admin/orders`,
    title: "الطلبات",
    Icon: ShoppingBag,
    role: ["ADMIN"],
  },
];
