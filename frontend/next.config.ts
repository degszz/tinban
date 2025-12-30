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
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  
  productionBrowserSourceMaps: false,
  
  // Deshabilitar Console Ninja en producción
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Deshabilitar Console Ninja en producción
      config.module = config.module || {};
      config.module.noParse = config.module.noParse || [];
      if (Array.isArray(config.module.noParse)) {
        config.module.noParse.push(/console-ninja/);
      }
    }
    return config;
  },
  
  // Configuración para Turbopack (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
