/**
 * bid controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::bid.bid', ({ strapi }) => ({
  // Crear una nueva puja
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Debes estar autenticado para pujar');
    }

    const { amount, auction_id, auction_title } = ctx.request.body.data;

    // Validar que el monto sea mayor a 0
    if (!amount || amount <= 0) {
      return ctx.badRequest('El monto de la puja debe ser mayor a 0');
    }

    // Obtener la última puja para este remate
    const lastBid = await strapi.db.query('api::bid.bid').findOne({
      where: { auction_id },
      orderBy: { amount: 'desc' },
    });

    // Validar que la nueva puja sea mayor a la última
    if (lastBid && amount <= lastBid.amount) {
      return ctx.badRequest(`La puja debe ser mayor a $${lastBid.amount}`);
    }

    // Si hay una puja anterior, marcarla como "outbid"
    if (lastBid) {
      await strapi.db.query('api::bid.bid').update({
        where: { id: lastBid.id },
        data: { status: 'outbid' },
      });
    }

    // Crear la nueva puja
    const newBid = await strapi.db.query('api::bid.bid').create({
      data: {
        amount,
        auction_id,
        auction_title,
        user: user.id,
        status: 'active',
        bidDate: new Date(),
      },
      populate: ['user'],
    });

    return newBid;
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
