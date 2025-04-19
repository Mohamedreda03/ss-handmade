import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import Providers from "@/components/Providers";
import AuthChecker from "@/components/AuthChecker";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
// Import dynamic configuration to make routes dynamic
import { dynamic } from "./dynamic-config";

// Export dynamic and runtime settings
export { dynamic };
export const runtime = "nodejs";

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
  title: "handmade",
  description: "handmade corses and products",
  keywords: "handmade, corses, products",
  openGraph: {
    title: "handmade",
    description: "handmade corses and products",
    url: "",
    images: [
      {
        url: "",
        alt: "handmade",
      },
    ],
  },
  icons: {
    icon: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <AuthChecker>
        <Providers>
          <body
            className={cn(
              dgagnadeen.variable,
              "font-dgagnadeen dark:bg-dark_background"
            )}
          >
            <NextTopLoader height={3} showSpinner={false} />
            <ThemeProvider
              attribute="light"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster />
              {children}
              <ShadcnToaster />
            </ThemeProvider>
          </body>
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!}
          />
        </Providers>
      </AuthChecker>
    </html>
  );
}
