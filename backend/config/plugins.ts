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
      email: {
        // ✅ Desactivar confirmación automática
        confirmation: {
          enabled: false, // No auto-confirmar usuarios
        },
      },
    },
  },
});