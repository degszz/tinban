export default {
  async canSendMessage(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('No autenticado');
    }

    try {
      // Buscar último mensaje enviado
      const lastMessage = await strapi.db.query('api::whatsapp-log.whatsapp-log').findOne({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!lastMessage) {
        return ctx.send({ canSend: true, waitTime: 0 });
      }

      const now = new Date();
      const lastSent = new Date(lastMessage.createdAt);
      const diffMs = now.getTime() - lastSent.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const WAIT_HOURS = 3;
      const canSend = diffHours >= WAIT_HOURS;
      const waitTime = canSend ? 0 : Math.ceil((WAIT_HOURS - diffHours) * 60); // minutos restantes

      return ctx.send({
        canSend,
        waitTime,
        lastSentAt: lastMessage.createdAt,
      });
    } catch (error) {
      strapi.log.error('Error checking WhatsApp send status:', error);
      return ctx.internalServerError('Error al verificar estado');
    }
  },

  async markMessageSent(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('No autenticado');
    }

    try {
      // Crear registro de mensaje enviado
      const log = await strapi.entityService.create('api::whatsapp-log.whatsapp-log', {
        data: {
          userId,
          sentAt: new Date(),
        },
      });

      return ctx.send({
        success: true,
        nextAvailableAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      });
    } catch (error) {
      strapi.log.error('Error marking WhatsApp message sent:', error);
      return ctx.internalServerError('Error al registrar mensaje');
    }
  },
};