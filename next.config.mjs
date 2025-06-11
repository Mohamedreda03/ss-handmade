/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
  // تحسينات للأداء والـ Server-Side Rendering
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    optimizeCss: true,
  },
  // إضافة تكوين للويب باك لدعم ملفات الخطوط بشكل أفضل
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      type: "asset/resource",
    });
    return config;
  },
  // تحسين الـ Build للإنتاج
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
};

export default nextConfig;
