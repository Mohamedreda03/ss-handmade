import Link from "next/link";
import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary/90 text-white py-12 w-full">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          {/* Logo and social icons */}
          <div className="flex flex-col mb-8">
            <h2 className="text-3xl font-bold mb-1">Hand Made</h2>
            <p className="text-sm mb-3 opacity-90">
              إبداع تركي وحرفية تكمل الحكاية
            </p>
            <div className="flex gap-4">
              <Link
                href="https://facebook.com"
                className="hover:text-secondary-lighter transition-colors"
              >
                <FaFacebook size={18} />
              </Link>
              <Link
                href="https://twitter.com"
                className="hover:text-secondary-lighter transition-colors"
              >
                <FaTwitter size={18} />
              </Link>
              <Link
                href="https://instagram.com"
                className="hover:text-secondary-lighter transition-colors"
              >
                <FaInstagram size={18} />
              </Link>
              <Link
                href="https://linkedin.com"
                className="hover:text-secondary-lighter transition-colors"
              >
                <FaLinkedin size={18} />
              </Link>
              <Link
                href="https://youtube.com"
                className="hover:text-secondary-lighter transition-colors"
              >
                <FaYoutube size={18} />
              </Link>
            </div>
          </div>

          {/* الدعم */}
          <div className="text-right order-3 md:order-2">
            <h3 className="text-xl font-bold mb-5">الدعم</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/faq" className="hover:text-secondary-lighter">
                  كيف نبدأ ؟
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-secondary-lighter">
                  مركز المساعدة
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-secondary-lighter">
                  بلغ عن مشكلة
                </Link>
              </li>
              <li>
                <Link
                  href="/live-support"
                  className="hover:text-secondary-lighter"
                >
                  محادثة مع فريق الدعم
                </Link>
              </li>
            </ul>
          </div>

          {/* الشركة */}
          <div className="text-right order-2 md:order-3">
            <h3 className="text-xl font-bold mb-5">الشركة</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="hover:text-secondary-lighter">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-secondary-lighter">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-secondary-lighter">
                  ثقافتنا
                </Link>
              </li>
              <li>
                <Link href="/vision" className="hover:text-secondary-lighter">
                  رؤيتنا
                </Link>
              </li>
            </ul>
          </div>

          {/* المنتجات */}
          <div className="text-right order-1 md:order-4">
            <h3 className="text-xl font-bold mb-5">المنتجات</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="hover:text-secondary-lighter">
                  منتجات المصنع
                </Link>
              </li>
              <li>
                <Link
                  href="/products/orders"
                  className="hover:text-secondary-lighter"
                >
                  منتجات الطلب
                </Link>
              </li>
              <li>
                <Link href="/training" className="hover:text-secondary-lighter">
                  دورات تدريبية
                </Link>
              </li>
            </ul>
          </div>

          {/* معلومات التواصل */}
          <div className="text-right order-1 md:order-5">
            <h3 className="text-xl font-bold mb-5">معلومات التواصل</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-end gap-2">
                <span className="mr-2">contact@Handmade.com</span>
                <FaEnvelope className="text-lg" />
              </li>
              <li className="flex items-center justify-end gap-2">
                <span className="mr-2" dir="ltr">
                  +2010123456
                </span>
                <FaPhone className="text-lg" />
              </li>
              <li className="flex items-center justify-end gap-2">
                <span className="mr-2">Egypt,Cairo</span>
                <FaMapMarkerAlt className="text-lg" />
              </li>
            </ul>
          </div>
        </div>

        {/* Divider line */}
        <div className="border-t border-white/20 my-6"></div>

        {/* Copyright */}
        <div className="text-center text-sm opacity-90">
          <p>حقوق النشر © 2025 جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
