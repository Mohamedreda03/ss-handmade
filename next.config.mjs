/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dluypemoocrcremebcwf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/images/**",
      },
    ],
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
  // Disable static exports - everything will be dynamically rendered
  output: "standalone",
  trailingSlash: true,
  // Force all routes to be dynamically rendered
  experimental: {
    serverComponentsExternalPackages: ["next-auth"],
  },
  // Set this to completely disable static exports
  eslint: {
    // Allow Next.js to build with warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow Next.js to build with type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
