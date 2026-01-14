
import type { Core } from '@strapi/strapi';
import { setupSocketIO } from './socket';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
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
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};