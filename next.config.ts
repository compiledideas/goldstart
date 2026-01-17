import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  // Explicitly include better-sqlite3 in standalone output
  serverExternalPackages: ['better-sqlite3', '@auth/core'],
  // Fix images in standalone deployment
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
