#!/usr/bin/env node

/**
 * Script de verificación de autenticación
 * Ejecuta: node verify-auth.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando implementación de autenticación...\n');

const requiredFiles = [
  'lib/definitions.ts',
  'lib/session.ts',
  'lib/dal.ts',
  'lib/actions/auth-actions.ts',
  'lib/services/auth-service.ts',
  'components/auth/logout-button.tsx',
  'components/forms/signin-form.tsx',
  'components/forms/signup-form.tsx',
  'components/forms/strapi-errors.tsx',
  'app/(auth)/layout.tsx',
  'app/(auth)/signin/page.tsx',
  'app/(auth)/signup/page.tsx',
  'app/dashboard/page.tsx',
  'app/profile/page.tsx',
  'middleware.ts',
  '.env.local'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('✅ Todos los archivos están presentes!\n');
  
  console.log('📋 Próximos pasos:');
  console.log('1. npm install');
  console.log('2. Configura NEXTAUTH_SECRET en .env.local');
  console.log('3. Inicia Strapi: cd ../backend && npm run develop');
  console.log('4. Habilita sign-ups en Strapi Admin');
  console.log('5. Inicia Next.js: npm run dev');
  console.log('6. Visita: http://localhost:3000/signup\n');
} else {
  console.log('❌ Faltan algunos archivos. Revisa la instalación.\n');
}

// Verificar package.json
console.log('='.repeat(50));
console.log('📦 Verificando package.json...\n');

try {
  const packageJson = require('./package.json');
  const requiredDeps = ['jose', 'js-cookie', 'zod'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - NO INSTALADO`);
      allFilesExist = false;
    }
  });
  
  console.log('\n');
} catch (error) {
  console.log('❌ Error al leer package.json\n');
}

// Verificar .env.local
console.log('='.repeat(50));
console.log('🔐 Verificando .env.local...\n');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  if (envContent.includes('NEXT_PUBLIC_STRAPI_URL')) {
    console.log('✅ NEXT_PUBLIC_STRAPI_URL configurado');
  } else {
    console.log('❌ Falta NEXT_PUBLIC_STRAPI_URL');
  }
  
  if (envContent.includes('NEXTAUTH_SECRET')) {
    if (envContent.includes('your-super-secret-key')) {
      console.log('⚠️  NEXTAUTH_SECRET usa valor por defecto - CÁMBIALO!');
    } else {
      console.log('✅ NEXTAUTH_SECRET configurado');
    }
  } else {
    console.log('❌ Falta NEXTAUTH_SECRET');
  }
  
  console.log('\n');
} catch (error) {
  console.log('❌ No se pudo leer .env.local\n');
}

console.log('='.repeat(50));
console.log('🎉 Verificación completa!\n');
