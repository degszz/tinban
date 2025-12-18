export default {
  routes: [
    {
      method: 'POST',
      path: '/credit-requests/:id/approve',
      handler: 'credit-request.approve',
      config: {
        policies: ['global::isAdmin'], // 🔒 Solo Admin
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/credit-requests/:id/reject',
      handler: 'credit-request.reject',
      config: {
        policies: ['global::isAdmin'], // 🔒 Solo Admin
        middlewares: [],
      },
    },
  ],
};
