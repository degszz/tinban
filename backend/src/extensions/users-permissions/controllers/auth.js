'use strict';

/**
 * Auth.js controller personalizado
 * Extiende el controller de users-permissions para aceptar el campo phone
 */

const utils = require('@strapi/utils');
const { getService } = require('@strapi/plugin-users-permissions/server/utils');
const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

module.exports = ({ strapi }) => ({
  /**
   * Register a new user with phone field
   */
  async register(ctx) {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });

    const settings = await pluginStore.get({ key: 'advanced' });

    if (!settings.allow_register) {
      throw new ApplicationError('Register action is currently disabled');
    }

    const params = {
      ...ctx.request.body,
    };

    // Validar que el phone esté presente
    if (!params.phone || params.phone.trim().length < 8) {
      throw new ValidationError('El número telefónico debe tener al menos 8 dígitos');
    }

    // Validar que el phone sea numérico
    if (!/^[0-9]+$/.test(params.phone)) {
      throw new ValidationError('El número telefónico solo puede contener números');
    }

    // Validaciones básicas
    if (!params.username || !params.email || !params.password) {
      throw new ValidationError('Username, email y password son requeridos');
    }

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      throw new ApplicationError('Impossible to find the default role');
    }

    // Verificar si el email ya existe
    const existingEmail = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: params.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ApplicationError('Email already taken');
    }

    // Verificar si el username ya existe
    const existingUsername = await strapi.query('plugin::users-permissions.user').findOne({
      where: { username: params.username },
    });

    if (existingUsername) {
      throw new ApplicationError('Username already taken');
    }

    // Verificar si el teléfono ya existe
    const existingPhone = await strapi.query('plugin::users-permissions.user').findOne({
      where: { phone: params.phone },
    });

    if (existingPhone) {
      throw new ApplicationError('Phone number already taken');
    }

    try {
      // Crear el usuario con todos los campos
      const user = await strapi.query('plugin::users-permissions.user').create({
        data: {
          username: params.username,
          email: params.email.toLowerCase(),
          password: params.password,
          phone: params.phone.trim(),
          credits: 0, // Inicializar créditos en 0
          role: role.id,
          confirmed: !settings.email_confirmation,
          provider: 'local',
        },
      });

      // Sanitizar el usuario para la respuesta
      const sanitizedUser = await sanitize.contentAPI.output(
        user,
        strapi.getModel('plugin::users-permissions.user')
      );

      // Generar JWT
      const jwt = getService('jwt').issue({
        id: user.id,
      });

      ctx.send({
        jwt,
        user: sanitizedUser,
      });

      strapi.log.info(`Usuario registrado exitosamente: ${user.username} (ID: ${user.id})`);
    } catch (error) {
      if (error.message.includes('unique')) {
        throw new ApplicationError('Email, username o teléfono ya están en uso');
      }
      strapi.log.error('Error al registrar usuario:', error);
      throw error;
    }
  },
});
