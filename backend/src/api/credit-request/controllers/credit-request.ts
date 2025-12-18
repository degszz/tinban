/**
 * credit-request controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::credit-request.credit-request', ({ strapi }) => ({
  
  /**
   * Crear solicitud de crédito (solo usuarios autenticados)
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado para solicitar créditos');
    }

    const { amount, reason } = ctx.request.body.data;

    // Validar monto
    if (!amount || amount <= 0) {
      return ctx.badRequest('El monto debe ser mayor a 0');
    }

    // Validar si puede solicitar
    const validation = await strapi.service('api::credit-request.credit-request').canUserRequestCredits(user.id);
    
    if (!validation.canRequest) {
      return ctx.badRequest(validation.reason);
    }

    try {
      const creditRequest = await strapi.service('api::credit-request.credit-request').createRequest(
        user.id,
        amount,
        reason || ''
      );

      return creditRequest;
    } catch (error) {
      strapi.log.error('Error al crear solicitud:', error);
      return ctx.internalServerError('Error al crear la solicitud');
    }
  },

  /**
   * Obtener solicitudes
   * - Admin: ve TODAS las solicitudes
   * - Usuario normal: ve SOLO sus propias solicitudes
   */
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    try {
      // Verificar si es Admin
      const isAdmin = user.role?.name === 'Admin';

      if (isAdmin) {
        // Admin ve TODAS las solicitudes con populate de user
        const requests = await strapi.entityService.findMany('api::credit-request.credit-request', {
          populate: ['user'],
          sort: { createdAt: 'desc' },
        });
        
        return { data: requests };
      } else {
        // Usuario normal ve SOLO sus solicitudes
        const requests = await strapi.service('api::credit-request.credit-request').getUserRequests(user.id);
        return requests;
      }
    } catch (error) {
      strapi.log.error('Error al obtener solicitudes:', error);
      return ctx.internalServerError('Error al obtener solicitudes');
    }
  },

  /**
   * Aprobar solicitud (solo admin)
   */
  async approve(ctx) {
    const { id } = ctx.params;
    const { admin_notes } = ctx.request.body;

    try {
      const updatedRequest = await strapi.service('api::credit-request.credit-request').approveRequest(
        parseInt(id),
        admin_notes
      );

      return updatedRequest;
    } catch (error) {
      strapi.log.error('Error al aprobar solicitud:', error);
      return ctx.badRequest(error.message);
    }
  },

  /**
   * Rechazar solicitud (solo admin)
   */
  async reject(ctx) {
    const { id } = ctx.params;
    const { admin_notes } = ctx.request.body;

    try {
      const updatedRequest = await strapi.service('api::credit-request.credit-request').rejectRequest(
        parseInt(id),
        admin_notes
      );

      return updatedRequest;
    } catch (error) {
      strapi.log.error('Error al rechazar solicitud:', error);
      return ctx.badRequest(error.message);
    }
  },
}));
