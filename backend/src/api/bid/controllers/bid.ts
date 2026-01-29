/**
 * bid controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::bid.bid', ({ strapi }) => ({
  // Crear una nueva puja
  async create(ctx) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Debes estar autenticado para pujar');
      }

      const { amount, auction_id, auction_title, requires_approval } = ctx.request.body.data;

      // Validar que el monto sea mayor a 0
      if (!amount || amount <= 0) {
        return ctx.badRequest('El monto de la puja debe ser mayor a 0');
      }

      // 🔍 OBTENER INFORMACIÓN DEL USUARIO
      const userWithCredits = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          fields: ['id', 'username', 'credits'],
        }
      );

      const currentCredits = (userWithCredits as any)?.credits || 0;

      // 🔍 OBTENER ÚLTIMA PUJA DEL REMATE (de cualquier usuario) - buscar activas Y pending
      const lastBid = await strapi.db.query('api::bid.bid').findOne({
        where: {
          auction_id,
          status: { $in: ['active', 'pending'] } // 🔑 Buscar pujas activas Y pendientes
        },
        orderBy: { amount: 'desc' },
      });

      // Validar que la nueva puja sea mayor a la última
      if (lastBid && amount <= lastBid.amount) {
        return ctx.badRequest(`La puja debe ser mayor a $${lastBid.amount}`);
      }

      // 🔍 VERIFICAR SI EL USUARIO YA TIENE UNA PUJA ACTIVA O PENDIENTE EN ESTE REMATE
      const userActiveBid = await strapi.db.query('api::bid.bid').findOne({
        where: {
          auction_id,
          user: user.id,
          status: { $in: ['active', 'pending'] } // 🔑 Buscar activas Y pendientes
        },
        orderBy: { amount: 'desc' },
      });

      // 💰 CALCULAR CUÁNTO DEBE PAGAR
      let amountToCharge = amount;

      if (userActiveBid) {
        // Si ya tiene una puja activa o pendiente, solo paga la diferencia
        amountToCharge = amount - userActiveBid.amount;
      }

      // ✅ VALIDAR CRÉDITOS SUFICIENTES
      if (currentCredits < amountToCharge) {
        return ctx.badRequest(`Créditos insuficientes. Tienes $${currentCredits} pero necesitas $${amountToCharge}`);
      }

      // 💸 DESCONTAR CRÉDITOS AL USUARIO ACTUAL
      const newCredits = currentCredits - amountToCharge;

      await strapi.entityService.update(
        'plugin::users-permissions.user',
        user.id,
        {
          // @ts-ignore
          data: {
            credits: newCredits,
          },
        }
      );

      // 💵 DEVOLVER CRÉDITOS AL USUARIO ANTERIOR (solo si es OTRO usuario Y es una puja activa)
      if (lastBid && String(lastBid.user) !== String(user.id)) {
        const previousBidUser = await strapi.db.query('api::bid.bid').findOne({
          where: { id: lastBid.id },
          populate: ['user'],
        });

        if (previousBidUser && previousBidUser.user) {
          const previousUserId = previousBidUser.user.id;
          
          // 🔑 VERIFICACIÓN EXTRA: Asegurar que NO sea el mismo usuario
          if (previousUserId !== user.id) {
            const previousUserData = await strapi.entityService.findOne(
              'plugin::users-permissions.user',
              previousUserId,
              { fields: ['id', 'credits'] }
            );

            const refundAmount = lastBid.amount;
            const previousUserNewCredits = ((previousUserData as any)?.credits || 0) + refundAmount;

            await strapi.entityService.update(
              'plugin::users-permissions.user',
              previousUserId,
              {
                // @ts-ignore
                data: {
                  credits: previousUserNewCredits,
                },
              }
            );
          }
        }

        // Marcar puja anterior como "outbid"
        await strapi.db.query('api::bid.bid').update({
          where: { id: lastBid.id },
          data: { status: 'outbid' },
        });
      }

      // ❌ MARCAR PUJA ANTERIOR DEL MISMO USUARIO COMO "OUTBID" (si existe)
      if (userActiveBid) {
        await strapi.db.query('api::bid.bid').update({
          where: { id: userActiveBid.id },
          data: { status: 'outbid' },
        });
      }

      // ✅ CREAR LA NUEVA PUJA - status depende de requires_approval
      const bidStatus = requires_approval ? 'pending' : 'active';

      const newBid = await strapi.db.query('api::bid.bid').create({
        data: {
          amount,
          auction_id,
          auction_title,
          user: user.id,
          status: bidStatus, // 🔑 'pending' si requiere aprobacion, 'active' si es automatico
          bidDate: new Date(),
          amount_charged: amountToCharge, // 💰 Guardar el monto cobrado
        },
        populate: ['user'],
      });

      // 📤 DEVOLVER RESPUESTA
      return {
        ...newBid,
        userCredits: newCredits,
        amountCharged: amountToCharge,
      };

    } catch (error) {
      console.error('❌ ERROR EN CREATE BID:', error);
      strapi.log.error('Error en create bid:', error);
      return ctx.internalServerError('Error al procesar la puja: ' + error.message);
    }
  },

  // Obtener todas las pujas de un remate
  async findByAuction(ctx) {
    const { auctionId } = ctx.params;

    const bids = await strapi.db.query('api::bid.bid').findMany({
      where: { auction_id: auctionId },
      orderBy: { amount: 'desc' },
      populate: ['user'],
    });

    return bids;
  },

  // Obtener la puja más alta de un remate
  async getHighestBid(ctx) {
    const { auctionId } = ctx.params;

    const highestBid = await strapi.db.query('api::bid.bid').findOne({
      where: { auction_id: auctionId },
      orderBy: { amount: 'desc' },
      populate: ['user'],
    });

    return highestBid || null;
  },

  // Obtener las pujas de un usuario
  async findByUser(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado');
    }

    const bids = await strapi.db.query('api::bid.bid').findMany({
      where: { user: user.id },
      orderBy: { bidDate: 'desc' },
      populate: ['user'],
    });

    return bids;
  },
}));
