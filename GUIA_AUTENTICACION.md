# Guía de Implementación de Autenticación - Strapi + Next.js 15

## 📋 Tabla de Contenidos
1. [Instalación de Dependencias](#instalación-de-dependencias)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Configuración de Strapi](#configuración-de-strapi)
4. [Implementación en Next.js](#implementación-en-nextjs)
5. [Estructura de Archivos](#estructura-de-archivos)

---

## 1. Instalación de Dependencias

### Frontend (Next.js)
```bash
cd frontend
npm install jose js-cookie react-toastify
npm install --save-dev @types/js-cookie
```

**Dependencias:**
- `jose`: Para manejo de JWT (JSON Web Tokens)
- `js-cookie`: Para gestión de cookies
- `react-toastify`: Para notificaciones toast

---

## 2. Configuración de Variables de Entorno

### Frontend (.env.local)
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXTAUTH_SECRET=your-super-secret-key-here-generate-with-openssl
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 3. Configuración de Strapi

### Habilitar Registro de Usuarios
1. Ve a Strapi Admin: `http://localhost:1337/admin`
2. Settings → Users & Permissions → Advanced Settings
3. Activa: "Enable sign-ups"
4. Activa: "Enable email confirmation" (opcional)

### Configurar Roles
1. Settings → Users & Permissions → Roles
2. Configura permisos para "Authenticated" y "Public"

---

## 4. Implementación en Next.js

### Estructura de Carpetas a Crear

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   └── api/
│       └── auth/
│           └── [...auth]/
│               └── route.ts
├── components/
│   ├── forms/
│   │   ├── signin-form.tsx
│   │   ├── signup-form.tsx
│   │   └── strapi-errors.tsx
│   └── auth/
│       └── logout-button.tsx
├── lib/
│   ├── actions/
│   │   └── auth-actions.ts
│   ├── services/
│   │   └── auth-service.ts
│   ├── session.ts
│   ├── dal.ts (Data Access Layer)
│   └── definitions.ts
└── middleware.ts
```

---

## 5. Paso a Paso de Implementación

### Paso 1: Crear Tipos y Definiciones
**Archivo:** `frontend/lib/definitions.ts`

### Paso 2: Crear Servicio de Autenticación
**Archivo:** `frontend/lib/services/auth-service.ts`

### Paso 3: Crear Gestión de Sesiones
**Archivo:** `frontend/lib/session.ts`

### Paso 4: Crear Server Actions
**Archivo:** `frontend/lib/actions/auth-actions.ts`

### Paso 5: Crear Data Access Layer
**Archivo:** `frontend/lib/dal.ts`

### Paso 6: Crear Middleware
**Archivo:** `frontend/middleware.ts`

### Paso 7: Crear Componentes de Formularios
- `frontend/components/forms/signin-form.tsx`
- `frontend/components/forms/signup-form.tsx`
- `frontend/components/forms/strapi-errors.tsx`

### Paso 8: Crear Páginas de Autenticación
- `frontend/app/(auth)/layout.tsx`
- `frontend/app/(auth)/signin/page.tsx`
- `frontend/app/(auth)/signup/page.tsx`

### Paso 9: Crear Páginas Protegidas
- `frontend/app/dashboard/page.tsx`
- `frontend/app/profile/page.tsx`

### Paso 10: Actualizar Header con Auth
- `frontend/components/header.tsx`

---

## 6. Pruebas

### Flujo de Prueba
1. **Registro:** Ve a `/signup` y crea una cuenta
2. **Login:** Ve a `/signin` y accede con tus credenciales
3. **Dashboard:** Accede a `/dashboard` (protegido)
4. **Profile:** Accede a `/profile` (protegido)
5. **Logout:** Cierra sesión desde el header

---

## 7. Características Implementadas

✅ Registro de usuarios
✅ Inicio de sesión
✅ Cierre de sesión
✅ Protección de rutas con Middleware
✅ Sesiones encriptadas con JWT
✅ Data Access Layer para seguridad
✅ Manejo de errores de Strapi
✅ Notificaciones toast
✅ Formularios con validación
✅ Estado de carga en botones

---

## 8. Seguridad

- ✅ Sesiones encriptadas con `jose`
- ✅ Cookies httpOnly
- ✅ CSRF protection
- ✅ Validación en servidor
- ✅ Middleware para rutas protegidas
- ✅ Data Access Layer

---

## 9. Próximos Pasos (Opcional)

- [ ] Reset de contraseña
- [ ] Verificación de email
- [ ] OAuth providers (Google, GitHub)
- [ ] Refresh tokens
- [ ] Rate limiting
- [ ] 2FA (Two-Factor Authentication)

---

## 10. Recursos

- [Strapi Authentication Docs](https://docs.strapi.io/dev-docs/plugins/users-permissions)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Jose Library](https://github.com/panva/jose)

---

## 🚀 ¡Listo para empezar!

Sigue los pasos en orden y tendrás un sistema de autenticación completo y seguro.
