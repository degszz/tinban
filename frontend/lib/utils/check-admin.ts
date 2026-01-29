export function isUserAdmin(userData: any): boolean {
  // Verificar múltiples formas de determinar si es admin
  
  // Opción 1: Campo directo isAdmin
  if (userData.isAdmin === true) {
    return true;
  }
  
  // Opción 2: Role con type 'admin'
  if (userData.role?.type === 'admin' || userData.role?.name === 'Admin') {
    return true;
  }
  
  // Opción 3: Role con name 'Authenticated' pero con permisos de admin
  if (userData.role?.name === 'Authenticated' && userData.id === 1) {
    // El primer usuario suele ser admin
    return true;
  }
  
  // Opción 4: Verificar por email (temporal para desarrollo)
  const adminEmails = ['horaciotinban@gmail.com', 'horaciotinban@gmail.com'];
  if (adminEmails.includes(userData.email)) {
    return true;
  }
  
  console.log('❌ No es admin:', {
    isAdmin: userData.isAdmin,
    role: userData.role,
    email: userData.email,
    id: userData.id
  });
  
  return false;
}