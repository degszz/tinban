export default (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  // Si no hay usuario autenticado
  if (!user) {
    return false;
  }

  // Verificar si el usuario tiene el rol "Admin"
  const isAdmin = user.role?.name === 'Admin';

  if (!isAdmin) {
    strapi.log.warn(`User ${user.id} (${user.email}) attempted to access admin-only endpoint`);
  }

  return isAdmin;
};
