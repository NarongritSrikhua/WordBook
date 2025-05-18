import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    authInterrupts: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL || 'http://localhost:3001/:path*' // Backend URL
      }
    ];
  }
};

export default nextConfig;
