/**
 * credit-request service
 */

import { factories } from '@strapi/strapi';

// Type para la relación user populada
interface CreditRequestWithUser {
  id: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  user: {
    id: number;
    username: string;
    email: string;
    credits: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default factories.createCoreService('api::credit-request.credit-request', ({ strapi }) => ({
  
  /**
   * Crear solicitud de crédito asociada al usuario
   */
  async createRequest(userId: number, amount: number, reason: string) {
    try {
      const creditRequest = await strapi.entityService.create('api::credit-request.credit-request', {
        data: {
          amount: parseInt(amount.toString()),
          reason: reason.trim(),
          status: 'pending',
          user: userId,
          publishedAt: new Date(),
        },
        populate: {
          user: {
            fields: ['id', 'username', 'email', 'credits'],
          },
        },
      });

      strapi.log.info(`✅ Solicitud creada: ID ${creditRequest.id} | Usuario: ${userId} | Monto: ${amount}`);
      return creditRequest;
    } catch (error) {
      strapi.log.error('❌ Error al crear solicitud:', error);
      throw error;
    }
  },

  /**
   * Aprobar solicitud y actualizar créditos del usuario
   */
  async approveRequest(requestId: number, adminNotes?: string) {
    try {
      const creditRequest = await strapi.entityService.findOne(
        'api::credit-request.credit-request',
        requestId,
        {
          populate: {
            user: {
              fields: ['id', 'username', 'email', 'credits'],
            },
          },
        }
      ) as unknown as CreditRequestWithUser;

      if (!creditRequest) {
        throw new Error('Solicitud no encontrada');
      }

      if (creditRequest.status !== 'pending') {
        throw new Error(`Esta solicitud ya fue ${creditRequest.status}`);
      }

      if (!creditRequest.user) {
        throw new Error('Solicitud sin usuario asociado');
      }

      const currentCredits = creditRequest.user.credits || 0;
      const newCredits = currentCredits + creditRequest.amount;

      // @ts-ignore - credits es un campo custom
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        creditRequest.user.id,
        {
          data: {
            credits: newCredits,
          },
        }
      );

      // @ts-ignore - status es un campo válido
      const updatedRequest = await strapi.entityService.update(
        'api::credit-request.credit-request',
        requestId,
        {
          data: {
            status: 'approved',
            admin_notes: adminNotes || `Aprobado. Créditos otorgados: ${creditRequest.amount}`,
          },
          populate: {
            user: {
              fields: ['id', 'username', 'email', 'credits'],
            },
          },
        }
      );

      strapi.log.info(
        `✅ Solicitud ${requestId} aprobada | Usuario ${creditRequest.user.id} ahora tiene ${newCredits} créditos`
      );

      return updatedRequest;
    } catch (error) {
      strapi.log.error('❌ Error al aprobar solicitud:', error);
      throw error;
    }
  },

  /**
   * Rechazar solicitud
   */
  async rejectRequest(requestId: number, adminNotes?: string) {
    try {
      const creditRequest = await strapi.entityService.findOne(
        'api::credit-request.credit-request',
        requestId,
        {
          populate: {
            user: {
              fields: ['id', 'username', 'email'],
            },
          },
        }
      ) as unknown as CreditRequestWithUser;

      if (!creditRequest) {
        throw new Error('Solicitud no encontrada');
      }

      if (creditRequest.status !== 'pending') {
        throw new Error(`Esta solicitud ya fue ${creditRequest.status}`);
      }

      // @ts-ignore - status es un campo válido
      const updatedRequest = await strapi.entityService.update(
        'api::credit-request.credit-request',
        requestId,
        {
          data: {
            status: 'rejected',
            admin_notes: adminNotes || 'Solicitud rechazada',
          },
          populate: {
            user: {
              fields: ['id', 'username', 'email'],
            },
          },
        }
      );

      strapi.log.info(`⛔ Solicitud ${requestId} rechazada`);
      return updatedRequest;
    } catch (error) {
      strapi.log.error('❌ Error al rechazar solicitud:', error);
      throw error;
    }
  },

  /**
   * Obtener solicitudes del usuario
   */
  async getUserRequests(userId: number) {
    try {
      const requests = await strapi.entityService.findMany(
        'api::credit-request.credit-request',
        {
          filters: {
            user: {
              id: userId,
            },
          },
          sort: { createdAt: 'desc' },
          populate: {
            user: {
              fields: ['id', 'username', 'email'],
            },
          },
        }
      );

      return requests;
    } catch (error) {
      strapi.log.error('❌ Error al obtener solicitudes:', error);
      throw error;
    }
  },

  /**
   * Validar si el usuario puede crear una solicitud
   */
  async canUserRequestCredits(userId: number) {
    try {
      const pendingRequests = await strapi.entityService.findMany(
        'api::credit-request.credit-request',
        {
          filters: {
            user: {
              id: userId,
            },
            status: 'pending',
          },
        }
      );

      if (pendingRequests.length > 0) {
        return {
          canRequest: false,
          reason: 'Ya tienes una solicitud pendiente',
        };
      }

      return {
        canRequest: true,
      };
    } catch (error) {
      strapi.log.error('❌ Error al validar solicitud:', error);
      throw error;
    }
  },
}));
