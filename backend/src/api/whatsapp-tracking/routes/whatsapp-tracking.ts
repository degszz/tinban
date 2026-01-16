export default {
  routes: [
    {
      method: 'GET',
      path: '/whatsapp-tracking/can-send',
      handler: 'whatsapp-tracking.canSendMessage',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/whatsapp-tracking/mark-sent',
      handler: 'whatsapp-tracking.markMessageSent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};