import { factories } from '@strapi/strapi';

export default factories.createCoreController('plugin::users-permissions.user', () => ({
  async register(ctx) {
    const { username, email, password, phone } = ctx.request.body;

    console.log('📥 CUSTOM REGISTER - Datos recibidos:', { 
      username, 
      email, 
      phone,
      hasPassword: !!password 
    });

    // Validaciones básicas
    if (!username || !email || !password) {
      console.log('❌ Faltan campos requeridos');
      return ctx.badRequest('Username, email y password son requeridos');
    }

    // Validación de phone (opcional pero si viene debe ser válido)
    if (phone) {
      const phoneStr = String(phone).trim();
      
      if (phoneStr.length < 10 || phoneStr.length > 15) {
        console.log('❌ Phone inválido - longitud:', phoneStr.length);
        return ctx.badRequest('El teléfono debe tener entre 10 y 15 dígitos');
      }

      if (!/^[0-9]+$/.test(phoneStr)) {
        console.log('❌ Phone inválido - contiene caracteres no numéricos');
        return ctx.badRequest('El teléfono solo puede contener números');
      }

      console.log('✅ Phone válido:', phoneStr);
    }

    try {
      // Verificar si el email ya existe
      const existingEmail = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: email.toLowerCase() },
      });

      if (existingEmail) {
        console.log('❌ Email ya registrado:', email);
        return ctx.badRequest('Este email ya está registrado');
      }

      // Verificar si el username ya existe
      const existingUsername = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { username },
      });

      if (existingUsername) {
        console.log('❌ Username ya registrado:', username);
        return ctx.badRequest('Este username ya está en uso');
      }

      // Obtener el rol 'authenticated'
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (!role) {
        console.log('❌ Rol authenticated no encontrado');
        return ctx.internalServerError('Error de configuración del sistema');
      }

      console.log('✅ Rol encontrado:', role.id);

      // Preparar datos del usuario
      const userData: any = {
        username,
        email: email.toLowerCase(),
        password,
        confirmed: false,
        role: role.id,
        provider: 'local',
        credits: 0,
      };

      // Agregar phone si existe
      if (phone) {
        userData.phone = String(phone).trim();
      }

      console.log('🔄 Creando usuario con datos:', {
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        confirmed: userData.confirmed,
        credits: userData.credits,
      });

      // Crear usuario
      const user = await strapi.entityService.create('plugin::users-permissions.user', {
        data: userData,
      });

      console.log('✅ Usuario creado exitosamente:', {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        confirmed: user.confirmed,
        credits: user.credits,
      });

      // Generar JWT
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      console.log('✅ JWT generado');

      // Sanitizar usuario manualmente (remover campos sensibles)
      const { password: _, resetPasswordToken, confirmationToken, ...sanitizedUser } = user;

      console.log('✅ Usuario sanitizado');
      console.log('✅ Registro completado exitosamente');

      // Enviar respuesta
      ctx.send({
        jwt,
        user: sanitizedUser,
      });

    } catch (error: any) {
      console.error('❌ ERROR en custom register:', error.message);
      console.error('Stack:', error.stack);
      
      return ctx.badRequest(
        error.message || 'Error al registrar usuario. Inténtalo de nuevo.'
      );
    }
  },
}));