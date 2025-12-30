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
<<<<<<< HEAD
  
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
=======
  // Configuración para evitar errores de prerendering
  experimental: {
    // Deshabilitar PPR temporalmente para evitar errores de build
    ppr: false,
>>>>>>> 8adef910fab1961a8a7dadb05ed77fc31d6e18e7
  },
  
  // Configuración para Turbopack (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
