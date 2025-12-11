# 🧪 Guía de Prueba del Sistema de Autenticación

## ✅ Pre-requisitos

1. **Strapi corriendo:**
```bash
cd backend
npm run develop
```
Debería estar en: `http://localhost:1337`

2. **Next.js corriendo:**
```bash
cd frontend
npm install  # Si no lo hiciste aún
npm run dev
```
Debería estar en: `http://localhost:3000`

3. **Strapi configurado:**
   - Ve a: `http://localhost:1337/admin`
   - Settings → Users & Permissions → Advanced Settings
   - ✅ "Enable sign-ups" activado

---

## 📝 Test 1: Registro de Usuario

### Paso 1: Ir a página de registro
```
http://localhost:3000/signup
```

### Paso 2: Completar formulario
- **Username:** testuser123
- **Email:** test@test.com
- **Password:** Test123!
- **Confirm Password:** Test123!

### Paso 3: Click en "Registrarse"

### ✅ Resultado Esperado:
- Redirige a `/dashboard`
- Header muestra: "Hola, testuser123"
- Botones: "Dashboard", "Perfil", "Cerrar Sesión"
- Dashboard muestra información del usuario

### 🐛 Si hay error:
- Verifica que Strapi esté corriendo
- Verifica que "Enable sign-ups" esté activado
- Revisa la consola del navegador (F12)
- Revisa la terminal de Next.js

---

## 🔑 Test 2: Cerrar Sesión

### Paso 1: Click en "Cerrar Sesión" en el header

### ✅ Resultado Esperado:
- Redirige a página principal `/`
- Header muestra: "Iniciar Sesión" y "Registrarse"
- Cookies eliminadas

---

## 🔐 Test 3: Inicio de Sesión

### Paso 1: Ir a página de login
```
http://localhost:3000/signin
```

### Paso 2: Ingresar credenciales
- **Email o Usuario:** test@test.com
- **Password:** Test123!

### Paso 3: Click en "Iniciar Sesión"

### ✅ Resultado Esperado:
- Redirige a `/dashboard`
- Sesión restaurada correctamente
- Header muestra usuario

---

## 🛡️ Test 4: Protección de Rutas

### Paso 1: Cerrar sesión si estás logueado

### Paso 2: Intentar acceder a ruta protegida
```
http://localhost:3000/dashboard
```

### ✅ Resultado Esperado:
- **Automáticamente** redirige a `/signin`
- Middleware bloqueó el acceso

### Paso 3: Intentar acceder a perfil
```
http://localhost:3000/profile
```

### ✅ Resultado Esperado:
- También redirige a `/signin`

---

## 🍪 Test 5: Verificar Cookies

### Paso 1: Iniciar sesión

### Paso 2: Abrir DevTools (F12)
- Ve a: Application → Cookies → http://localhost:3000

### ✅ Deberías ver 2 cookies:

1. **session**
   - Value: JWT encriptado largo
   - HttpOnly: ✓
   - Expires: 7 días desde ahora

2. **strapi_jwt**
   - Value: JWT de Strapi
   - HttpOnly: ✓
   - Expires: 7 días desde ahora

---

## 👤 Test 6: Páginas de Usuario

### Dashboard
```
http://localhost:3000/dashboard
```
✅ Muestra:
- Bienvenida con username
- Estadísticas (subastas, ofertas, ganadas)
- Información del usuario
- Botones de acciones rápidas

### Perfil
```
http://localhost:3000/profile
```
✅ Muestra:
- Avatar con inicial del username
- Información personal completa
- Estadísticas
- Botones de acción

---

## 🔄 Test 7: Navegación

### Con sesión activa:

1. **Desde Dashboard:**
   - Click en "Mi Perfil" → Va a `/profile` ✓
   - Click en "Ver Subastas" → Va a `/` ✓

2. **Desde Perfil:**
   - Click en "Volver al Dashboard" → Va a `/dashboard` ✓

3. **Desde Header:**
   - Click en "Dashboard" → Va a `/dashboard` ✓
   - Click en "Perfil" → Va a `/profile` ✓
   - Click en logo → Va a `/` ✓

---

## ❌ Test 8: Validaciones

### Registro - Campos inválidos

**Test A: Username muy corto**
- Username: `ab`
- ❌ Error: "El nombre de usuario debe tener al menos 3 caracteres"

**Test B: Email inválido**
- Email: `noesunmail`
- ❌ Error: "Por favor ingresa un email válido"

**Test C: Password muy corta**
- Password: `123`
- ❌ Error: "La contraseña debe tener al menos 6 caracteres"

**Test D: Passwords no coinciden**
- Password: `Test123!`
- Confirm: `Test456!`
- ❌ Error: "Las contraseñas no coinciden"

### Login - Credenciales inválidas

**Test E: Email incorrecto**
- Email: `noexiste@test.com`
- ❌ Error: "Credenciales inválidas"

**Test F: Password incorrecta**
- Email: `test@test.com`
- Password: `wrongpassword`
- ❌ Error: "Credenciales inválidas"

---

## 🔍 Test 9: Persistencia de Sesión

### Paso 1: Iniciar sesión

### Paso 2: Cerrar la pestaña del navegador

### Paso 3: Abrir nueva pestaña
```
http://localhost:3000/dashboard
```

### ✅ Resultado Esperado:
- **Sesión persiste** ✓
- Acceso directo al dashboard
- No pide login nuevamente

### Paso 4: Esperar 7 días (o modificar cookie expiration)

### ✅ Resultado Esperado:
- Sesión expirada
- Redirige a `/signin`

---

## 🚨 Test 10: Casos Extremos

### A. Usuario ya existe
- Intentar registrar con email existente
- ❌ Error: "Email ya está en uso"

### B. Múltiples pestañas
- Abrir 2 pestañas con sesión
- Cerrar sesión en una
- La otra también debe cerrarse (requiere reload)

### C. Browser diferente
- Login en Chrome
- Abrir en Firefox
- ❌ No debería estar logueado (cookies son por navegador)

---

## 📊 Checklist Final

Marca cada test completado:

- [ ] ✅ Test 1: Registro exitoso
- [ ] ✅ Test 2: Cerrar sesión
- [ ] ✅ Test 3: Inicio de sesión
- [ ] ✅ Test 4: Middleware protege rutas
- [ ] ✅ Test 5: Cookies creadas correctamente
- [ ] ✅ Test 6: Dashboard y Perfil funcionan
- [ ] ✅ Test 7: Navegación fluida
- [ ] ✅ Test 8: Validaciones funcionan
- [ ] ✅ Test 9: Sesión persiste
- [ ] ✅ Test 10: Casos extremos manejados

---

## 🎯 ¿Todo funciona?

Si **todos los tests pasan**, tu sistema de autenticación está **100% funcional** según el video tutorial.

## 🐛 Si algo falla:

1. **Revisa logs:**
   ```bash
   # Terminal de Next.js
   # Busca errores en rojo
   
   # Terminal de Strapi
   # Busca errores de API
   ```

2. **Revisa cookies:**
   - F12 → Application → Cookies
   - Verifica que existan ambas cookies

3. **Revisa Strapi Admin:**
   - `http://localhost:1337/admin`
   - Content Manager → User
   - Verifica que el usuario se creó

4. **Limpia y reinicia:**
   ```bash
   # Frontend
   rm -rf .next
   npm run dev
   
   # Backend
   # Ctrl+C y npm run develop
   ```

---

## 📞 Comandos Útiles

```bash
# Ver logs en tiempo real
cd frontend && npm run dev
cd backend && npm run develop

# Limpiar cookies desde consola del navegador
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

# Verificar que Strapi responde
curl http://localhost:1337/_health

# Verificar que Next.js responde
curl http://localhost:3000
```

---

**🎉 Si todos los tests pasan, ¡felicidades! Tu sistema de autenticación está listo para producción.**
