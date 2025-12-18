export default (plugin: any) => {
  console.log('🔧 EXTENSION users-permissions cargada');
  
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx: any) => {
    console.log('📥 INTERCEPTADO - Request body:', ctx.request.body);
    
    const body = ctx.request.body;

    // Validar phone
    if (!body.phone) {
      console.log('❌ Phone no enviado');
      return ctx.badRequest("El número telefónico es requerido");
    }

    console.log('📞 Phone recibido:', body.phone, 'Length:', body.phone.length);

    if (typeof body.phone !== 'string' || body.phone.length < 10 || body.phone.length > 15) {
      console.log('❌ Phone inválido - longitud:', body.phone.length);
      return ctx.badRequest("El número telefónico debe tener entre 10 y 15 dígitos");
    }

    if (!/^[0-9]+$/.test(body.phone)) {
      console.log('❌ Phone contiene caracteres no numéricos');
      return ctx.badRequest("El número telefónico solo puede contener números");
    }

    console.log('✅ Phone válido, procediendo con registro');

    try {
      // Guardar phone temporalmente
      const phone = body.phone;

      // Registrar usuario SIN phone (evitar validación de Strapi)
      ctx.request.body = {
        username: body.username,
        email: body.email,
        password: body.password,
      };

      console.log('🔄 Ejecutando registro original sin phone');

      // Ejecutar registro original
      await originalRegister(ctx);

      console.log('✅ Usuario registrado, agregando phone');

      // Actualizar phone después de crear el usuario
      if (ctx.response.body && ctx.response.body.user) {
        const userId = ctx.response.body.user.id;

        console.log('💾 Actualizando user', userId, 'con phone:', phone);

        // @ts-ignore - phone es un campo custom
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          userId,
          {
            data: { phone },
          }
        );

        // Agregar phone a la respuesta
        ctx.response.body.user.phone = phone;
        
        console.log('✅ Phone agregado exitosamente');
      }
    } catch (error: any) {
      console.log('❌ ERROR en registro:', error.message);
      ctx.badRequest(error.message || "Error al registrar usuario");
    }
  };

  return plugin;
};
