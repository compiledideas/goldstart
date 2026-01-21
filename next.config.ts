import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // Fix images in standalone deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
