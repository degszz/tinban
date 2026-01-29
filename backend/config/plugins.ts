/**
 * Ubicación: backend/config/plugins.ts
 */

export default () => ({
  // Configuración de users-permissions
  'users-permissions': {
    config: {
      register: {
        allowRegister: true,
      },
      i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en'],
      },
      email: {
        // ✅ Desactivar confirmación automática
        confirmation: {
          enabled: false, // No auto-confirmar usuarios
        },
      },
      
    },
  },
});