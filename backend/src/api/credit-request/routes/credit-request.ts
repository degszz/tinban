/**
 * credit-request router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::credit-request.credit-request', {
  config: {
    // Usuarios normales pueden ver solo SUS propias solicitudes
    find: {
      middlewares: [],
      policies: [], // El controller ya filtra por usuario
    },
    findOne: {
      middlewares: [],
      policies: [],
    },
    // Usuarios normales pueden crear solicitudes
    create: {
      middlewares: [],
      policies: [],
    },
    // Solo admin puede actualizar
    update: {
      middlewares: [],
      policies: ['global::isAdmin'],
    },
    // Solo admin puede eliminar
    delete: {
      middlewares: [],
      policies: ['global::isAdmin'],
    },
  },
});
