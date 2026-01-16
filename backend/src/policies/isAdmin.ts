/**
 * Policy: isAdmin
 * Verifica que el usuario sea administrador
 * 
 * Ubicación: backend/src/policies/isAdmin.ts
 */

module.exports = (policyContext: any, config: any, { strapi }: any) => {
  const { user } = policyContext.state;

  // Si no hay usuario autenticado
  if (!user) {
    console.log('❌ isAdmin: No hay usuario autenticado');
    return false;
  }

  // Verificar si el usuario tiene el rol "Admin"
  const isAdmin = user.role?.name === 'Admin';

  if (!isAdmin) {
    console.log(`❌ isAdmin: Usuario ${user.id} (${user.email}) no es admin`);
    strapi.log.warn(`User ${user.id} (${user.email}) attempted to access admin-only endpoint`);
  } else {
    console.log(`✅ isAdmin: Usuario ${user.id} es admin`);
  }

  return isAdmin;
};