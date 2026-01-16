export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Rutas que requieren verificación
    const protectedRoutes = [
      '/api/credit-requests',
      '/api/credits/request',
      '/api/bids',
    ];

    // Rutas que NO deben ser verificadas (permitir actualización de perfil)
    const allowedRoutes = [
      '/api/users/me',
      '/api/auth/',
    ];

    // Verificar si es una ruta permitida
    const isAllowedRoute = allowedRoutes.some(route => 
      ctx.request.url.startsWith(route) || ctx.request.path.startsWith(route)
    );

    if (isAllowedRoute) {
      return await next();
    }

    const isProtectedRoute = protectedRoutes.some(route => 
      ctx.request.url.startsWith(route) || ctx.request.path.startsWith(route)
    );

    // Si no es una ruta protegida, continuar
    if (!isProtectedRoute) {
      return await next();
    }

    // Verificar autenticación
    if (!ctx.state.user) {
      console.log('❌ verification-check: No hay usuario autenticado');
      return ctx.unauthorized('No autenticado');
    }

    const userId = ctx.state.user.id;

    try {
      // Obtener usuario con campo confirmed
      const user = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userId,
        {
          fields: ['id', 'username', 'email', 'confirmed'],
        }
      );

      if (!user) {
        console.log('❌ verification-check: Usuario no encontrado');
        return ctx.unauthorized('Usuario no encontrado');
      }

      console.log(`✅ verification-check: Usuario ${user.username} - Confirmed: ${user.confirmed}`);

      // ✅ Verificar si está confirmado
      if (!user.confirmed) {
        console.log('❌ verification-check: Usuario no confirmado');
        return ctx.forbidden('Tu cuenta aún no ha sido verificada. Espera la confirmación del administrador.');
      }

      console.log('✅ verification-check: Usuario verificado, continuando...');
      // Usuario verificado, continuar
      await next();
    } catch (error) {
      console.error('❌ verification-check: Error:', error);
      strapi.log.error('Error en verification-check middleware:', error);
      return ctx.internalServerError('Error al verificar usuario');
    }
  };
};