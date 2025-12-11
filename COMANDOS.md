# 🎯 Comandos Útiles - Sistema de Autenticación

## 🚀 Inicio Rápido (Copy-Paste)

### Terminal 1 - Backend (Strapi)
```bash
cd backend
npm run develop
```

### Terminal 2 - Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Instalación de Dependencias

### Instalar todas las dependencias
```bash
cd frontend
npm install
```

### Instalar dependencias individuales (si es necesario)
```bash
npm install jose
npm install js-cookie
npm install zod
npm install react-toastify
npm install --save-dev @types/js-cookie
```

---

## 🔐 Generar NEXTAUTH_SECRET

### Linux / Mac / Git Bash
```bash
openssl rand -base64 32
```

### Windows PowerShell
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Windows CMD
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🧪 Verificación

### Verificar archivos de autenticación
```bash
cd frontend
node verify-auth.js
```

### Verificar que Next.js compila
```bash
cd frontend
npm run build
```

### Verificar TypeScript
```bash
cd frontend
npx tsc --noEmit
```

---

## 🔄 Reiniciar Servicios

### Reiniciar Frontend
```bash
# Ctrl+C para detener
cd frontend
npm run dev
```

### Reiniciar Backend
```bash
# Ctrl+C para detener
cd backend
npm run develop
```

### Reiniciar ambos (Script PowerShell)
```powershell
# Guardar como restart.ps1
Write-Host "🔄 Reiniciando servicios..." -ForegroundColor Cyan

# Detener procesos en puertos 3000 y 1337
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Iniciar Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run develop"

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Iniciar Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ Servicios reiniciados!" -ForegroundColor Green
```

---

## 🧹 Limpiar y Reinstalar

### Limpiar caché de Next.js
```bash
cd frontend
rm -rf .next
npm run dev
```

### Reinstalar node_modules
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Limpiar cookies del navegador (Chrome DevTools)
```javascript
// En la consola del navegador:
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

---

## 🔍 Debugging

### Ver logs de Next.js en detalle
```bash
cd frontend
npm run dev -- --debug
```

### Ver logs de Strapi
```bash
cd backend
npm run develop -- --debug
```

### Verificar variables de entorno
```bash
cd frontend
cat .env.local
```

### Ver puerto ocupado (Windows)
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :1337
```

### Matar proceso en puerto (Windows)
```bash
# Obtener PID del comando anterior, luego:
taskkill /PID <PID> /F
```

---

## 🗄️ Strapi Database

### Reset de base de datos (SQLite)
```bash
cd backend
rm -rf .tmp
rm database/data.db
npm run develop
# Crear nuevo admin
```

### Ver usuarios en Strapi
```bash
# Abrir en navegador:
http://localhost:1337/admin/plugins/content-manager/collectionType/plugin::users-permissions.user
```

---

## 🧪 Pruebas con cURL

### Test de Registro
```bash
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@test.com",
    "password": "Test123!"
  }'
```

### Test de Login
```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@test.com",
    "password": "Test123!"
  }'
```

### Test de /users/me (requiere JWT)
```bash
curl -X GET http://localhost:1337/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 📝 Git Commands (Opcional)

### Commit inicial
```bash
git add .
git commit -m "feat: implement authentication system with Strapi and Next.js"
```

### Ver cambios
```bash
git status
git diff
```

### Crear branch para auth
```bash
git checkout -b feature/authentication
```

---

## 🌐 URLs Importantes

### Frontend
- Desarrollo: http://localhost:3000
- Sign Up: http://localhost:3000/signup
- Sign In: http://localhost:3000/signin
- Dashboard: http://localhost:3000/dashboard
- Profile: http://localhost:3000/profile

### Backend (Strapi)
- Admin: http://localhost:1337/admin
- API: http://localhost:1337/api
- Register: http://localhost:1337/api/auth/local/register
- Login: http://localhost:1337/api/auth/local

---

## 💾 Backup

### Backup de .env.local
```bash
cp frontend/.env.local frontend/.env.local.backup
```

### Backup de base de datos Strapi
```bash
cp backend/database/data.db backend/database/data.db.backup
```

---

## 🎨 Personalización Rápida

### Cambiar colores del tema
```bash
# Editar: frontend/app/globals.css
# Buscar: --primary, --secondary, etc.
```

### Cambiar textos de formularios
```bash
# Editar: frontend/components/forms/signin-form.tsx
# Editar: frontend/components/forms/signup-form.tsx
```

---

## 🚨 Comandos de Emergencia

### Matar todos los procesos de Node
```bash
# Linux/Mac:
killall -9 node

# Windows PowerShell:
Get-Process -Name node | Stop-Process -Force
```

### Reset completo
```bash
# Backend
cd backend
rm -rf node_modules .tmp database/data.db
npm install
npm run develop

# Frontend
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

---

## 📊 Verificar Estado

### Check de servicios
```bash
# Verificar si Strapi está corriendo:
curl http://localhost:1337/_health

# Verificar si Next.js está corriendo:
curl http://localhost:3000
```

### Verificar instalación de dependencias
```bash
cd frontend
npm list jose
npm list js-cookie
npm list zod
```

---

## 🎯 Workflow Diario

```bash
# 1. Abrir proyecto
cd /path/to/tinban

# 2. Iniciar Backend
cd backend
npm run develop

# 3. En otra terminal, iniciar Frontend
cd frontend
npm run dev

# 4. Abrir navegador
# http://localhost:3000

# 5. Al terminar, Ctrl+C en ambas terminales
```

---

## 📚 Recursos Adicionales

- [Next.js Docs](https://nextjs.org/docs)
- [Strapi Docs](https://docs.strapi.io)
- [Jose Docs](https://github.com/panva/jose)
- [Zod Docs](https://zod.dev)
- [Tailwind Docs](https://tailwindcss.com)

---

**Tip:** Guarda este archivo para referencia rápida. Puedes ejecutar estos comandos en cualquier momento.
