import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster as ReactHotToaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import Providers from "@/components/Providers";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster as SonnerToaster } from "sonner";
import { NextAuthProvider } from "@/components/Providers/NextAuthProvider";
import { CartManager } from "@/components/CartManager";

import { El_Messiri } from "next/font/google";

const elMessiri = El_Messiri({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-el-messiri",
  display: "swap",
});

const dgagnadeen = localFont({
  src: [
    {
      path: "../fonts/alfont_com_DGAgnadeen-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/alfont_com_DGAgnadeen-Ultralight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/alfont_com_DGAgnadeen-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/alfont_com_DGAgnadeen-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/alfont_com_DGAgnadeen-Bold.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/alfont_com_DGAgnadeen-Extrabold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/alfont_com_DGAgnadeen-Heavy.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dgagnadeen",
});

export const metadata: Metadata = {
  title: "crafteria",
  description: "منصة تعليمية متخصصة في الحرف اليدوية وبيع المنتجات الحرفية",
  keywords: "حرف يدوية، دورات، منتجات، تعليم، صناعة يدوية، حرفيين، handmade",
  openGraph: {
    title: "crafteria",
    description: "منصة تعليمية متخصصة في الحرف اليدوية وبيع المنتجات الحرفية",
    url: "",
    images: [
      {
        url: "/logo.png",
        alt: "crafteria logo",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=2", type: "image/png" },
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
    ],
    apple: [
      {
        url: "/favicon.png?v=2",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <Providers>
        <body
          className={cn(
            elMessiri.variable,
            dgagnadeen.variable,
            "font-el-messiri dark:bg-dark_background"
          )}
        >
          <NextTopLoader height={3} showSpinner={false} />
          <ThemeProvider
            attribute="light"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {" "}
            <ReactHotToaster />
            <NextAuthProvider>
              <CartManager />
              {children}
              <SonnerToaster position="top-center" />
            </NextAuthProvider>
            <ShadcnToaster />
          </ThemeProvider>
        </body>
      </Providers>
    </html>
  );
}
