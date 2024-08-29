/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/plypicker-acafd.appspot.com/**',
      },
    ],
  },
};

export default nextConfig;
