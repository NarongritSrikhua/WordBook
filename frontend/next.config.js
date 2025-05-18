/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
};

module.exports = nextConfig;

