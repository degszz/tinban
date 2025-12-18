export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Solo interceptar el registro
    if (ctx.request.url === '/api/auth/local/register' && ctx.request.method === 'POST') {
      console.log('🔧 MIDDLEWARE - Interceptando registro');
      console.log('📥 Body recibido:', ctx.request.body);

      const body = ctx.request.body;

      // Validar phone
      if (!body.phone) {
        console.log('❌ Phone no enviado');
        return ctx.badRequest("El número telefónico es requerido");
      }

      console.log('📞 Phone:', body.phone, 'Length:', body.phone.length);

      if (typeof body.phone !== 'string' || body.phone.length < 10 || body.phone.length > 15) {
        console.log('❌ Phone inválido');
        return ctx.badRequest("El número telefónico debe tener entre 10 y 15 dígitos");
      }

      if (!/^[0-9]+$/.test(body.phone)) {
        console.log('❌ Phone no numérico');
        return ctx.badRequest("El número telefónico solo puede contener números");
      }

      console.log('✅ Phone válido');

      // Guardar phone temporalmente
      const phone = body.phone;

      // Quitar phone del body para evitar validación de Strapi
      delete ctx.request.body.phone;

      console.log('🔄 Ejecutando registro sin phone');

      // Continuar con el registro
      await next();

      // Si el registro fue exitoso, agregar phone
      if (ctx.response.status === 200 && ctx.response.body && ctx.response.body.user) {
        const userId = ctx.response.body.user.id;

        console.log('💾 Agregando phone al usuario', userId);

        try {
          // @ts-ignore
          await strapi.entityService.update(
            'plugin::users-permissions.user',
            userId,
            {
              data: { phone },
            }
          );

          ctx.response.body.user.phone = phone;
          console.log('✅ Phone agregado exitosamente');
        } catch (error) {
          console.log('❌ Error al agregar phone:', error);
        }
      }
    } else {
      await next();
    }
  };
};
