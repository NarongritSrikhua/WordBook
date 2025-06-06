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
      'image.ibb.co',
      'static.vecteezy.com',
      'media.istockphoto.com'
    ],
  },
};

module.exports = nextConfig;

