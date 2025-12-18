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
  // Configuración para evitar errores de prerendering
  experimental: {
    // Deshabilitar PPR temporalmente para evitar errores de build
    ppr: false,
  },
};

export default nextConfig;
