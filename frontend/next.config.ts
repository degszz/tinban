import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
  // Deshabilitar source maps en desarrollo para evitar warnings
  productionBrowserSourceMaps: false,
};

export default nextConfig;
