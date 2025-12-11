# 🎯 Tinban

Proyecto full-stack con frontend en Next.js y backend en Strapi.

## 📁 Estructura del Proyecto

```
tinban/
├── frontend/          # Next.js + TypeScript
│   ├── app/          # App Router de Next.js
│   ├── components/   # Componentes React
│   ├── lib/          # Utilidades
│   └── public/       # Archivos estáticos
├── backend/           # Strapi CMS + TypeScript
│   ├── src/          # API y controladores
│   ├── config/       # Configuración de Strapi
│   ├── database/     # Archivos de base de datos
│   └── public/       # Archivos públicos
└── README.md
```

## 🚀 Instalación

### Prerequisitos

- Node.js 18+ 
- npm o yarn

### Backend (Strapi)

```bash
cd backend
npm install
cp .env.example .env  # Configurar variables de entorno
npm run develop
```

El panel de administración de Strapi estará disponible en **http://localhost:1337/admin**

### Frontend (Next.js)

```bash
cd frontend
npm install
# Configurar variables de entorno si es necesario
npm run dev
```

El frontend estará disponible en **http://localhost:3000**

## ⚙️ Variables de Entorno

### Backend (`backend/.env`)

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# URLs
# En desarrollo
FRONTEND_URL=http://localhost:3000
# En producción
# FRONTEND_URL=https://tu-dominio.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=your-strapi-api-token
```

## 🛠️ Tecnologías

### Frontend
- ⚡ Next.js 15
- ⚛️ React 19
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🔐 Autenticación con JWT

### Backend
- 🚀 Strapi v4
- 📘 TypeScript
- 💾 SQLite (desarrollo)
- 🔐 Sistema de autenticación integrado

## 📝 Comandos Útiles

### Backend

```bash
npm run develop    # Modo desarrollo con auto-reload
npm run start      # Modo producción
npm run build      # Build para producción
npm run strapi     # CLI de Strapi
```

### Frontend

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm run start      # Servidor de producción
npm run lint       # Linter
```

## 🔧 Desarrollo

### Primer uso - Backend

1. Inicia el backend en modo desarrollo
2. Accede a http://localhost:1337/admin
3. Crea tu cuenta de administrador
4. Configura los Content-Types necesarios
5. Configura los permisos de API en Settings > Users & Permissions

### Primer uso - Frontend

1. Configura las variables de entorno
2. Inicia el servidor de desarrollo
3. La aplicación se conectará automáticamente al backend

## 📚 Documentación

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👤 Autor

**degszz**
- GitHub: [@degszz](https://github.com/degszz)

---

⭐️ Si este proyecto te fue útil, no olvides darle una estrella
