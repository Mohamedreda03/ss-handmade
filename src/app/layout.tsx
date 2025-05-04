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
  title: "handmade - منصة الحرف اليدوية",
  description: "منصة تعليمية متخصصة في الحرف اليدوية وبيع المنتجات الحرفية",
  keywords: "حرف يدوية، دورات، منتجات، تعليم، صناعة يدوية، حرفيين، handmade",
  openGraph: {
    title: "handmade - منصة الحرف اليدوية",
    description: "منصة تعليمية متخصصة في الحرف اليدوية وبيع المنتجات الحرفية",
    url: "",
    images: [
      {
        url: "/icons/handmade-favicon.svg",
        alt: "handmade",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/handmade-favicon-16.svg", type: "image/svg+xml" },
      { url: "/icons/handmade-favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      {
        url: "/icons/handmade-favicon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="icon"
          href="/icons/handmade-favicon-16.svg"
          type="image/svg+xml"
        />
        <link rel="alternate icon" href="/icons/handmade-favicon.svg" />
      </head>
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
            <ReactHotToaster />
            <NextAuthProvider>
              {children}
              <SonnerToaster position="top-center" />
            </NextAuthProvider>
            <ShadcnToaster />
          </ThemeProvider>
        </body>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!} />
      </Providers>
    </html>
  );
}
