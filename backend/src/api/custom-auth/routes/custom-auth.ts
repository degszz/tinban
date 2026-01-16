export default {
  routes: [
    {
      method: 'POST',
      path: '/custom-register',
      handler: 'custom-auth.register',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};