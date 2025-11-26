import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Don't fail build on ESLint errors during production build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail build on TypeScript errors during production build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
