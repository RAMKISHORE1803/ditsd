/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows all sources
      },
      {
        protocol: 'http',
        hostname: '**', // Also allow non-secure sources (optional)
      },
    ],
  },
};

export default nextConfig;
