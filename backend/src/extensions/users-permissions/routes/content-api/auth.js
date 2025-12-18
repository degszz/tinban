'use strict';

/**
 * Rutas personalizadas para users-permissions
 * Sobrescribe la ruta de register para usar nuestro controller personalizado
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/local/register',
      handler: 'auth.register',
      config: {
        middlewares: ['plugin::users-permissions.rateLimit'],
        prefix: '',
      },
    },
  ],
};
