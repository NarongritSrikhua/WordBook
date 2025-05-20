/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    domains: [
      'images.unsplash.com', 
      'localhost', 
      'ibb.co',
      'i.ibb.co',  // The actual image hosting domain for ibb.co
      'image.ibb.co'
    ],
  },
};

module.exports = nextConfig;

