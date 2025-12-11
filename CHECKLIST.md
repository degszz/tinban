# ✅ Checklist de Implementación de Autenticación

## 📋 Antes de Empezar

- [ ] Node.js instalado (v18 o superior)
- [ ] npm o yarn instalado
- [ ] Git instalado (opcional)

---

## 🔧 Configuración Inicial

### Backend (Strapi)

- [ ] Strapi está instalado
- [ ] Strapi corre en `http://localhost:1337`
- [ ] Puedes acceder a Strapi Admin
- [ ] Usuario admin creado

### Frontend (Next.js)

- [ ] Next.js 16+ instalado
- [ ] Proyecto corre sin errores
- [ ] Tailwind CSS configurado
- [ ] shadcn/ui configurado

---

## 📦 Instalación

- [ ] Ejecutar `npm install` en `/frontend`
- [ ] Verificar que se instalaron:
  - [ ] jose
  - [ ] js-cookie
  - [ ] zod
  - [ ] react-toastify (opcional)

---

## 🔐 Variables de Entorno

- [ ] Archivo `.env.local` existe en `/frontend`
- [ ] `NEXT_PUBLIC_STRAPI_URL` configurado
- [ ] `NEXTAUTH_SECRET` generado y configurado
- [ ] Valores no son los por defecto

**Generar NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🗂️ Archivos Creados

### Lib (Lógica)
- [ ] `lib/definitions.ts` - Tipos TypeScript
- [ ] `lib/session.ts` - Gestión de sesiones
- [ ] `lib/dal.ts` - Data Access Layer
- [ ] `lib/actions/auth-actions.ts` - Server Actions
- [ ] `lib/services/auth-service.ts` - Servicios API

### Components
- [ ] `components/auth/logout-button.tsx` - Botón logout
- [ ] `components/forms/signin-form.tsx` - Form login
- [ ] `components/forms/signup-form.tsx` - Form registro
- [ ] `components/forms/strapi-errors.tsx` - Errores
- [ ] `components/header.tsx` - Actualizado con auth

### Pages
- [ ] `app/(auth)/layout.tsx` - Layout auth
- [ ] `app/(auth)/signin/page.tsx` - Página login
- [ ] `app/(auth)/signup/page.tsx` - Página registro
- [ ] `app/dashboard/page.tsx` - Dashboard
- [ ] `app/profile/page.tsx` - Perfil

### Otros
- [ ] `middleware.ts` - Protección de rutas

---

## ⚙️ Configuración de Strapi

- [ ] Strapi corriendo en modo develop
- [ ] Acceder a Admin: `http://localhost:1337/admin`
- [ ] Ir a: Settings → Users & Permissions → Advanced Settings
- [ ] Activar "Enable sign-ups" ✅
- [ ] Guardar cambios
- [ ] Ir a: Settings → Users & Permissions → Roles
- [ ] Role "Public" tiene permisos:
  - [ ] Auth → register
  - [ ] Auth → login
- [ ] Role "Authenticated" tiene permisos:
  - [ ] Users → me
  - [ ] (Permisos de tus content types)

---

## 🧪 Pruebas

### Test 1: Registro
- [ ] Ir a `http://localhost:3000/signup`
- [ ] Completar formulario
- [ ] Click en "Registrarse"
- [ ] Redirige a `/dashboard`
- [ ] Se ve nombre de usuario en header

### Test 2: Logout
- [ ] Click en "Cerrar Sesión"
- [ ] Redirige a página principal
- [ ] Header muestra "Iniciar Sesión" y "Registrarse"

### Test 3: Login
- [ ] Ir a `http://localhost:3000/signin`
- [ ] Ingresar credenciales
- [ ] Click en "Iniciar Sesión"
- [ ] Redirige a `/dashboard`

### Test 4: Protección de Rutas
- [ ] Cerrar sesión
- [ ] Intentar acceder a `/dashboard`
- [ ] Redirige a `/signin`
- [ ] Intentar acceder a `/profile`
- [ ] Redirige a `/signin`

### Test 5: Navegación Autenticado
- [ ] Iniciar sesión
- [ ] Acceder a `/dashboard`
- [ ] Ver estadísticas
- [ ] Click en "Mi Perfil"
- [ ] Ver información del perfil
- [ ] Click en "Volver al Dashboard"

### Test 6: Validaciones
- [ ] Intentar registrarse sin completar campos
- [ ] Ver mensajes de error
- [ ] Intentar registrarse con email inválido
- [ ] Ver mensaje de error
- [ ] Intentar registrarse con contraseñas que no coinciden
- [ ] Ver mensaje de error

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'jose'"
- [ ] Ejecutar `npm install jose`
- [ ] Reiniciar servidor

### Error: "Session not found"
- [ ] Verificar `.env.local` existe
- [ ] Verificar `NEXTAUTH_SECRET` está configurado
- [ ] Reiniciar servidor de Next.js

### Error: "Cannot register user"
- [ ] Verificar Strapi está corriendo
- [ ] Verificar "Enable sign-ups" está activado
- [ ] Verificar permisos de role "Public"
- [ ] Revisar consola de Strapi

### Error: "Redirect loop"
- [ ] Limpiar cookies del navegador
- [ ] Usar navegación privada
- [ ] Verificar middleware.ts existe

### Error: "Cannot connect to Strapi"
- [ ] Verificar Strapi corre en puerto 1337
- [ ] Verificar `NEXT_PUBLIC_STRAPI_URL` en `.env.local`
- [ ] Verificar no hay firewall bloqueando

---

## 📊 Verificación Final

Ejecutar script de verificación:
```bash
cd frontend
node verify-auth.js
```

- [ ] Todos los archivos existen
- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas

---

## 🎉 ¡Completado!

Si todos los checks están marcados:
- ✅ Tu sistema de autenticación está listo
- ✅ Puedes crear usuarios
- ✅ Puedes hacer login/logout
- ✅ Las rutas están protegidas
- ✅ El sistema es seguro

---

## 📚 Próximos Pasos (Opcional)

- [ ] Implementar reset de contraseña
- [ ] Agregar verificación de email
- [ ] Implementar OAuth (Google, GitHub)
- [ ] Agregar refresh tokens
- [ ] Implementar 2FA
- [ ] Personalizar diseño de formularios
- [ ] Agregar notificaciones toast
- [ ] Implementar "Remember me"

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de consola (frontend y backend)
2. Verifica que Strapi esté corriendo
3. Verifica las variables de entorno
4. Limpia cookies y cache del navegador
5. Reinicia ambos servidores

---

**Fecha de implementación:** Diciembre 2024
**Versión:** 1.0.0
**Status:** ✅ Completado
