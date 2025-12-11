# 🔐 Sistema de Autenticación - Tinban

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
cd frontend
npm install
```

### 2. Configurar Variables de Entorno
```bash
# Generar clave secreta
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Edita `frontend/.env.local`:
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXTAUTH_SECRET=<tu-clave-generada>
```

### 3. Configurar Strapi
```bash
# Iniciar Strapi
cd backend
npm run develop
```

Ir a `http://localhost:1337/admin`:
- Settings → Users & Permissions → Advanced Settings
- ✅ Enable sign-ups
- Save

### 4. Iniciar Frontend
```bash
cd frontend
npm run dev
```

Abrir: `http://localhost:3000`

---

## ✅ Rutas Disponibles

- `/signup` - Registro de usuario
- `/signin` - Iniciar sesión
- `/dashboard` - Panel protegido
- `/profile` - Perfil protegido

---

## 🎯 Flujo de Prueba

1. Ve a `/signup` y crea una cuenta
2. Serás redirigido a `/dashboard`
3. Navega a `/profile`
4. Cierra sesión desde el header
5. Intenta acceder a `/dashboard` → redirige a `/signin`
6. Inicia sesión nuevamente

---

## 📦 Dependencias Agregadas

```json
{
  "jose": "^5.9.6",
  "js-cookie": "^3.0.5",
  "zod": "^3.24.1",
  "react-toastify": "^10.0.6"
}
```

---

## 🔒 Características

- ✅ Registro e inicio de sesión
- ✅ Protección de rutas con middleware
- ✅ Sesiones encriptadas (JWT)
- ✅ Validación con Zod
- ✅ Server Actions
- ✅ Data Access Layer
- ✅ Manejo de errores de Strapi

---

## 🛠️ Solución de Problemas

### No puedo registrarme
- Verifica que Strapi esté corriendo
- Verifica que "Enable sign-ups" esté activado en Strapi

### Error de sesión
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Limpia las cookies del navegador

### No conecta con Strapi
- Verifica `NEXT_PUBLIC_STRAPI_URL` en `.env.local`
- Verifica que Strapi esté en `http://localhost:1337`

---

## 📁 Archivos Creados

```
frontend/
├── lib/
│   ├── definitions.ts
│   ├── session.ts
│   ├── dal.ts
│   ├── actions/auth-actions.ts
│   └── services/auth-service.ts
├── components/
│   ├── header.tsx (actualizado)
│   ├── auth/logout-button.tsx
│   └── forms/
│       ├── signin-form.tsx
│       ├── signup-form.tsx
│       └── strapi-errors.tsx
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx
│   └── profile/page.tsx
└── middleware.ts
```

---

## 🎉 ¡Listo para usar!

El sistema de autenticación está completamente implementado y funcional.
