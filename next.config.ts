import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  // Explicitly include better-sqlite3 in standalone output
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', '@auth/core'],
  },
};

export default nextConfig;
