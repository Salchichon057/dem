# Guía de Instalación - Dashboard ONG

## Instalación Rápida

### 1. Prerequisitos del Sistema

**Software Requerido:**
- Node.js 18+ [Descargar](https://nodejs.org/)
- PostgreSQL 14+ [Descargar](https://www.postgresql.org/download/)
- Git [Descargar](https://git-scm.com/)

**Verificar Instalaciones:**
```bash
node --version    # Debe mostrar v18.0.0+
npm --version     # Debe mostrar 9.0.0+
psql --version    # Debe mostrar 14.0+
git --version     # Cualquier versión reciente
```

### 2. Configuración de Base de Datos

**Crear Base de Datos:**
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE dashboard_ong;

# Crear usuario (opcional)
CREATE USER dashboard_user WITH PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE dashboard_ong TO dashboard_user;

# Salir
\q
```

### 3. Clonar y Configurar Proyecto

```bash
# Clonar repositorio
git clone [URL_DEL_REPOSITORIO]
cd dashboard-ong

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env.local
```

### 4. Configurar Variables de Entorno

Editar `.env.local`:
```env
# Base de Datos
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/dashboard_ong"

# Autenticación
NEXTAUTH_SECRET="tu-secreto-super-seguro-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# JWT
JWT_SECRET="otro-secreto-para-jwt-tokens"

# Opcional: Para desarrollo
NODE_ENV="development"
```

### 5. Inicializar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Cargar datos de prueba
npx prisma db seed
```

### 6. Iniciar Aplicación

```bash
# Modo desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:3000
```

## Configuración Avanzada

### Variables de Entorno Completas

```env
# === CONFIGURACIÓN DE BASE DE DATOS ===
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/dashboard_ong"

# === AUTENTICACIÓN ===
NEXTAUTH_SECRET="secreto-super-seguro-para-nextauth-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="secreto-para-tokens-jwt-diferente-al-anterior"

# === CONFIGURACIÓN DE DESARROLLO ===
NODE_ENV="development"

# === LOGS Y DEBUG ===
# Descomentar para debug de Prisma
# DEBUG="prisma:query,prisma:info,prisma:warn"

# === CONFIGURACIÓN DE EMAILS (Futuro) ===
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="tu-email@gmail.com"
# SMTP_PASS="tu-contraseña-app"

# === CONFIGURACIÓN DE ARCHIVOS (Futuro) ===
# UPLOAD_MAX_SIZE="10485760" # 10MB
# ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"

# === CONFIGURACIÓN DE TERCEROS (Futuro) ===
# GOOGLE_MAPS_API_KEY="tu-api-key-de-google-maps"
```

### Configuración de PostgreSQL

**1. Ubuntu/Debian:**
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Cambiar contraseña de usuario postgres
sudo -u postgres psql
\password postgres
```

**2. Windows:**
- Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
- Seguir el instalador
- Recordar la contraseña del usuario postgres

**3. macOS:**
```bash
# Usando Homebrew
brew install postgresql
brew services start postgresql

# Crear usuario postgres (si no existe)
createuser -s postgres
```

### Configuración de Node.js

**Usando nvm (recomendado):**
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar en modo desarrollo con Turbopack
npm run build        # Construir para producción
npm run start        # Iniciar en modo producción
npm run lint         # Verificar código con ESLint

# Base de Datos
npx prisma studio    # Abrir interfaz gráfica de BD
npx prisma migrate dev --name nombre-migracion
npx prisma generate  # Regenerar cliente Prisma
npx prisma db push   # Push cambios sin migración
npx prisma db seed   # Cargar datos de prueba

# Utilidades
npm run type-check   # Verificar tipos TypeScript (si existe)
```

## Datos de Prueba

El sistema incluye un seed script que crea:

### Usuario Administrador
- **Email:** admin@dashboard-ong.com
- **Contraseña:** admin123456
- **Rol:** ADMIN

### Usuario Moderador
- **Email:** moderador@dashboard-ong.com
- **Contraseña:** mod123456
- **Rol:** MODERATOR

### Usuario Regular
- **Email:** usuario@dashboard-ong.com
- **Contraseña:** user123456
- **Rol:** USER

### Datos de Ejemplo
- 5 organizaciones de prueba
- 10 comunidades PIMCO
- 15 beneficiarios
- 20 entrevistas PIMCO
- Datos estadísticos de Guatemala

## Verificación de Instalación

### 1. Verificar Base de Datos
```bash
# Conectar a la base de datos
psql -U postgres -d dashboard_ong

# Verificar tablas
\dt

# Verificar datos
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "ComunidadPimco";
```

### 2. Verificar Aplicación
1. Abrir http://localhost:3000
2. Iniciar sesión con usuario admin
3. Navegar por las diferentes secciones
4. Verificar que no hay errores en consola

### 3. Verificar API
```bash
# Test endpoint público
curl http://localhost:3000/api/health

# Test con autenticación (después de login)
curl -b cookies.txt http://localhost:3000/api/usuarios
```

## Solución de Problemas

### Error: "connect ECONNREFUSED"
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Iniciar si está detenido
sudo systemctl start postgresql
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# Usar puerto diferente
PORT=3001 npm run dev

# O matar proceso en puerto 3000
sudo lsof -ti:3000 | xargs kill -9
```

### Error de Permisos en PostgreSQL
```sql
-- Conectar como superusuario
sudo -u postgres psql

-- Dar permisos completos
GRANT ALL PRIVILEGES ON DATABASE dashboard_ong TO tu_usuario;
GRANT ALL ON SCHEMA public TO tu_usuario;
```

## Configuración para Producción

### 1. Variables de Entorno
```env
NODE_ENV="production"
DATABASE_URL="postgresql://usuario:contraseña@host:5432/dashboard_ong"
NEXTAUTH_SECRET="secreto-produccion-muy-seguro"
NEXTAUTH_URL="https://tu-dominio.com"
```

### 2. Optimizaciones
```bash
# Build optimizado
npm run build

# Verificar que no hay errores
npm run lint
```

### 3. Monitoreo
- Configurar logs de aplicación
- Monitorear uso de base de datos
- Configurar backups automáticos

## Actualizaciones

### Actualizar Dependencias
```bash
# Verificar actualizaciones
npm outdated

# Actualizar dependencias
npm update

# Actualizar Prisma
npm install @prisma/client@latest prisma@latest
npx prisma generate
```

### Migrar Base de Datos
```bash
# En desarrollo
npx prisma migrate dev

# En producción
npx prisma migrate deploy
```

## Soporte

### Logs de Debug
```bash
# Habilitar logs detallados
DEBUG="*" npm run dev

# Solo logs de Prisma
DEBUG="prisma:*" npm run dev
```

### Recursos de Ayuda
- Documentación en `/docs`
- GitHub Issues para reportar problemas
- Logs en `/logs` (si existe)

---

**Versión:** 1.0  
**Última Actualización:** Septiembre 2025  
**Tiempo de Instalación Estimado:** 15-30 minutos