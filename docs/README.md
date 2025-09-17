# Dashboard ONG - Documentación

## Descripción General

Dashboard ONG es una aplicación web integral diseñada para la gestión y administración de organizaciones no gubernamentales. La plataforma proporciona herramientas completas para la gestión de comunidades, beneficiarios, organizaciones, estadísticas y programas especializados como PIMCO.

## Tecnologías Utilizadas

### Frontend
- **Next.js 15.2.4** - Framework de React para aplicaciones web modernas
- **React 19.0.0** - Biblioteca de interfaz de usuario
- **TypeScript** - Superset de JavaScript con tipado estático
- **Tailwind CSS 4.1.11** - Framework de CSS utilitario
- **Radix UI** - Componentes de interfaz accesibles y primitivos
- **Lucide React** - Librería de iconos
- **Recharts** - Librería de gráficos para React
- **Sonner** - Sistema de notificaciones toast

### Backend y Base de Datos
- **Prisma 6.15.0** - ORM moderno para TypeScript y Node.js
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js 4.24.11** - Solución completa de autenticación para Next.js
- **bcryptjs** - Librería para hash de contraseñas
- **jsonwebtoken** - Implementación de JSON Web Tokens

### Herramientas de Desarrollo
- **ESLint** - Linter para JavaScript/TypeScript
- **Turbopack** - Bundler de alta velocidad para desarrollo

## Estructura del Proyecto

```
dashboard-ong/
├── app/                          # App Router de Next.js
│   ├── api/                      # Rutas API
│   │   ├── auth/                 # Autenticación
│   │   ├── beneficiarios/        # Gestión de beneficiarios
│   │   ├── comunidades/          # Gestión de comunidades generales
│   │   ├── comunidades-pimco/    # Gestión de comunidades PIMCO
│   │   ├── entrevistas-pimco/    # Entrevistas del programa PIMCO
│   │   ├── estadisticas/         # Estadísticas generales
│   │   ├── estadisticas-pimco/   # Estadísticas PIMCO
│   │   ├── organizaciones/       # Gestión de organizaciones
│   │   ├── pimco-bd-estadisticas/ # Base de datos estadísticas PIMCO
│   │   └── usuarios/             # Gestión de usuarios
│   ├── admin/                    # Panel de administración
│   ├── dashboard/                # Dashboard principal
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página de inicio
├── components/                   # Componentes React reutilizables
│   ├── ui/                       # Componentes de interfaz básicos
│   └── [componentes-seccion].tsx # Componentes de secciones específicas
├── contexts/                     # Contextos de React
├── hooks/                        # Hooks personalizados
├── lib/                          # Utilidades y configuraciones
├── prisma/                       # Esquema y migraciones de base de datos
├── public/                       # Archivos estáticos
└── docs/                         # Documentación del proyecto
```

## Características Principales

### 1. Sistema de Autenticación
- Registro e inicio de sesión de usuarios
- Roles y permisos (ADMIN, MODERATOR, USER)
- Gestión de sesiones con NextAuth.js
- Protección de rutas basada en roles

### 2. Gestión de Usuarios
- CRUD completo de usuarios
- Asignación de roles y permisos
- Perfiles de usuario con información detallada
- Estados de activación/desactivación

### 3. Gestión de Organizaciones
- Registro y administración de organizaciones
- Información de contacto y detalles organizacionales
- Clasificación por tipos y estados

### 4. Gestión de Comunidades
- **Comunidades Generales**: Sistema completo para administrar comunidades del programa Ruta de Alimentos
- **Comunidades PIMCO**: Gestión especializada para el programa PIMCO con campos específicos
- Información demográfica detallada
- Geolocalización y mapas de referencia
- Estados de actividad y seguimiento

### 5. Gestión de Beneficiarios
- Registro de beneficiarios con información personal
- Seguimiento de programas y servicios recibidos
- Clasificación por edad, género y otros criterios
- Historial de participación

### 6. Sistema de Estadísticas
- **Estadísticas Generales**: Métricas y análisis de programas generales
- **Estadísticas PIMCO**: Análisis específico del programa PIMCO
- **BD Estadísticas PIMCO**: Base de datos completa de encuestas con más de 300 campos
- Visualizaciones gráficas con Recharts
- Filtros por departamento, municipio y otros criterios

### 7. Programa PIMCO Especializado
- Gestión completa de comunidades PIMCO
- Sistema de entrevistas y encuestas
- Base de datos estadística comprehensive con:
  - Información demográfica detallada
  - Datos de consumo de alimentos
  - Información de salud y nutrición
  - Datos socioeconómicos
  - Información agrícola
- Análisis y reportes especializados

## Modelos de Base de Datos

### Principales Entidades

#### User
- Gestión de usuarios del sistema
- Roles y permisos
- Información de perfil

#### Organizacion
- Entidades organizacionales
- Información de contacto
- Estados y clasificaciones

#### Comunidad
- Comunidades del programa Ruta de Alimentos
- Información demográfica
- Datos de ubicación y contacto

#### ComunidadPimco
- Comunidades específicas del programa PIMCO
- Campos especializados para PIMCO
- Relación con entrevistas

#### EntrevistaPimco
- Sistema de encuestas PIMCO
- Más de 300 campos de datos
- Información JSON para consumo de alimentos
- Datos demográficos, de salud y agricultura

#### Beneficiario
- Registro de beneficiarios
- Información personal y de contacto
- Seguimiento de programas

## Componentes Principales

### Componentes de Administración
- `admin-beneficiarios-section.tsx` - Gestión de beneficiarios
- `admin-comunidades-section.tsx` - Administración de comunidades
- `admin-organizaciones-section.tsx` - Gestión de organizaciones
- `admin-usuarios-section.tsx` - Administración de usuarios

### Componentes PIMCO
- `pimco-comunidades-section.tsx` - Gestión de comunidades PIMCO
- `pimco-entrevistas-section.tsx` - Sistema de entrevistas
- `pimco-bd-estadisticas-section.tsx` - Base de datos estadística
- `pimco-graficas-estadisticas-section.tsx` - Visualizaciones

### Componentes de Interfaz
- `app-sidebar.tsx` - Navegación lateral con menús anidados
- `dashboard-content.tsx` - Contenido principal del dashboard
- `auth-wrapper.tsx` - Wrapper de autenticación

### Componentes UI Base
- Componentes Radix UI personalizados
- Sistema de design consistente
- Componentes accesibles y reutilizables

## Configuración del Proyecto

### Variables de Entorno Requeridas
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/dashboard_ong"
NEXTAUTH_SECRET="tu-secreto-super-seguro"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="tu-jwt-secreto"
```

### Scripts de Desarrollo
```bash
# Desarrollo con Turbopack
npm run dev

# Construcción para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Abrir Prisma Studio
npx prisma studio
```

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd dashboard-ong
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
```bash
# Configurar PostgreSQL
# Crear base de datos 'dashboard_ong'
# Configurar variables de entorno

# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

## Características Técnicas Destacadas

### 1. Sistema de Navegación Multi-nivel
- Sidebar con menús anidados
- Navegación jerárquica para diferentes secciones
- Estado persistente de navegación

### 2. Gestión de Estado
- Context API para autenticación
- Estados locales optimizados
- Hooks personalizados para lógica reutilizable

### 3. Validación y Seguridad
- Validación de datos con Zod
- Autenticación JWT
- Protección de rutas
- Hash de contraseñas con bcrypt

### 4. Interfaz Responsive
- Design system basado en Tailwind CSS
- Componentes adaptables a diferentes pantallas
- Optimización para mobile y desktop

### 5. Performance
- Next.js App Router para optimización
- Turbopack para desarrollo rápido
- Lazy loading de componentes
- Optimización de imágenes

## Funcionalidades por Rol

### Administrador (ADMIN)
- Acceso completo a todas las funcionalidades
- Gestión de usuarios y roles
- Configuración del sistema
- Acceso a estadísticas avanzadas

### Moderador (MODERATOR)
- Gestión de contenido
- Moderación de datos
- Acceso a reportes
- Gestión limitada de usuarios

### Usuario (USER)
- Acceso a dashboard básico
- Visualización de datos permitidos
- Funcionalidades limitadas de edición

## Integración PIMCO

El sistema incluye una integración completa para el programa PIMCO (Programa Integral de Mejoramiento de Cultivos y Oportunidades) que incluye:

### Base de Datos Estadística Comprehensive
- Más de 300 campos de datos estructurados
- Información demográfica detallada por grupos de edad y género
- Datos de consumo de alimentos en formato JSON
- Información de salud, nutrición y prácticas agrícolas
- Datos socioeconómicos y de infraestructura

### Sistema de Filtros Avanzados
- Filtros por departamento y municipio
- Búsquedas por múltiples criterios
- Paginación optimizada para grandes volúmenes de datos

### Visualizaciones y Reportes
- Gráficos interactivos con Recharts
- Estadísticas resumidas en tiempo real
- Exportación de datos en múltiples formatos

## Contribución y Desarrollo

### Estándares de Código
- TypeScript estricto
- ESLint configurado
- Componentes funcionales con hooks
- Nomenclatura consistente en español

### Estructura de Commits
- Commits descriptivos en español
- Separación lógica de funcionalidades
- Versionado semántico

### Testing (En desarrollo)
- Tests unitarios para componentes
- Tests de integración para APIs
- Tests e2e para flujos críticos

## Soporte y Mantenimiento

### Logs y Monitoreo
- Console logs para debugging
- Error handling consistente
- Notificaciones de usuario con Sonner

### Backup y Seguridad
- Backup regular de base de datos
- Encriptación de contraseñas
- Tokens JWT seguros
- Validación de entrada de datos

## Roadmap Futuro

### Funcionalidades Planificadas
- Sistema de notificaciones en tiempo real
- Módulo de reportes avanzados
- Integración con APIs externas
- Sistema de auditoría completo
- Dashboard de analytics avanzado
- Módulo de documentos y archivos

### Mejoras Técnicas
- Implementación de tests automatizados
- Optimización de performance
- PWA (Progressive Web App)
- Internacionalización (i18n)
- Dark mode
- Sistema de themes

---

**Versión de Documentación:** 1.0  
**Última Actualización:** Septiembre 2025  
**Autor:** Equipo de Desarrollo Dashboard ONG