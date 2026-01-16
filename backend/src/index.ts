import type { Core } from '@strapi/strapi';
import { setupSocketIO } from './socket';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Configurar Socket.IO cuando Strapi se registre
    const io = setupSocketIO(strapi.server.httpServer);
    
    // Hacer Socket.IO disponible globalmente en Strapi
    (strapi as any).io = io;
    
    console.log('🚀 Socket.IO configurado correctamente');
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    console.log('🚀 Bootstrap: Sistema iniciado correctamente');
    
    // Ya no necesitamos modificar el registro aquí porque usamos custom-auth
    // El bootstrap solo se usa para otras inicializaciones
    
    console.log('✅ Bootstrap: Configuración completada');
  },
};