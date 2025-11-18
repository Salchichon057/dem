# Arquitectura Técnica - Dashboard ONG

## Principio: API-First Architecture

Este proyecto implementa una **arquitectura API-First** donde toda la lógica de datos se centraliza en rutas API REST del servidor, y los componentes del cliente consumen estas APIs mediante hooks personalizados.

### Flujo de Datos

```
┌─────────────┐      ┌──────────┐      ┌─────────────┐      ┌──────────┐
│  Componente │ ───▶ │   Hook   │ ───▶ │  API Route  │ ───▶ │ Supabase │
│    (UI)     │      │ (Estado) │      │  (Lógica)   │      │   (DB)   │
└─────────────┘      └──────────┘      └─────────────┘      └──────────┘
     React             useState           Validación         PostgreSQL
     Render            useEffect          Autenticación      RLS
     Events            fetch()            Transformación     Triggers
```

### Ventajas de este Enfoque

1. **Seguridad**: Validación y autenticación centralizadas en el servidor
2. **Performance**: APIs pueden implementar caché y optimizaciones
3. **Mantenibilidad**: Lógica de datos en un solo lugar (API Routes)
4. **Escalabilidad**: Fácil migrar backend sin cambiar frontend
5. **Testabilidad**: Hooks y APIs se testean independientemente

### Responsabilidades por Capa

**Componentes (Cliente)**:
- ✅ Renderizar UI y manejar eventos
- ✅ Llamar hooks para obtener/modificar datos
- ❌ NO acceden directamente a Supabase
- ❌ NO contienen lógica de negocio

**Hooks (Cliente)**:
- ✅ Gestionar estado local (useState, useEffect)
- ✅ Llamar APIs REST (fetch)
- ✅ Manejar errores y notificaciones
- ❌ NO acceden directamente a Supabase
- ❌ NO contienen validación de negocio

**API Routes (Servidor)**:
- ✅ Validar datos de entrada
- ✅ Autenticar y autorizar
- ✅ Acceder a Supabase
- ✅ Transformar datos para el cliente
- ✅ Implementar lógica de negocio

**Supabase (Base de Datos)**:
- ✅ Almacenar y persistir datos
- ✅ Aplicar RLS (Row Level Security)
- ❌ Solo accesible desde servidor (API Routes)

## Arquitectura General

### Patrón de Arquitectura
El proyecto utiliza una **arquitectura en capas** basada en el patrón **MVC (Model-View-Controller)** adaptado para Next.js:

```
┌─────────────────────────────────────────────────┐
│                    Frontend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Pages     │  │ Components  │  │   Hooks     │ │
│  │ (App Router)│  │    (UI)     │  │ (Lógica)    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                   API Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Route      │  │ Middleware  │  │    Auth     │ │
│  │ Handlers    │  │    (Zod)    │  │  (NextAuth) │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│                Data Access Layer                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Prisma    │  │  Database   │  │   Models    │ │
│  │    ORM      │  │ PostgreSQL  │  │  (Schema)   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────┘
```

## Tecnologías por Capa

### Frontend Layer
- **Next.js 15** con App Router
- **React 19** con Server Components
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Radix UI** para componentes base

### API Layer
- **Next.js API Routes** con Route Handlers
- **NextAuth.js** para autenticación
- **Zod** para validación de datos
- **JWT** para tokens de sesión

### Data Layer
- **Prisma ORM** para abstracción de base de datos
- **PostgreSQL** como base de datos principal
- **Schema-first** approach con Prisma Schema

## Patrones de Diseño Implementados

### 1. Repository Pattern (a través de Prisma)
```typescript
// Ejemplo de uso del patrón Repository
export class ComunidadRepository {
  async findAll() {
    return await prisma.comunidadPimco.findMany()
  }
  
  async findById(id: string) {
    return await prisma.comunidadPimco.findUnique({ where: { id } })
  }
  
  async create(data: ComunidadPimcoData) {
    return await prisma.comunidadPimco.create({ data })
  }
}
```

### 2. Component Composition Pattern
```typescript
// Componentes composables y reutilizables
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### 3. Custom Hooks Pattern
```typescript
// Hooks para lógica reutilizable
export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Lógica de fetching...
  
  return { data, loading, error }
}
```

### 4. Context Pattern
```typescript
// Contexto global para autenticación
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
})
```

## Flujo de Datos

### 1. Flujo de Autenticación
```
1. Usuario → Formulario de Login
2. Formulario → API /auth/signin
3. API → Validación con NextAuth
4. NextAuth → Genera JWT
5. JWT → Almacenado en cookie
6. Usuario autenticado → Acceso a dashboard
```

### 2. Flujo CRUD
```
1. Componente → Interacción de usuario
2. Handler → Validación local
3. API Request → Endpoint correspondiente
4. API Route → Validación con Zod
5. Prisma → Operación en base de datos
6. Response → Resultado al frontend
7. Estado → Actualización en componente
```

## Estructura de Archivos Detallada

### `/app` - App Router de Next.js
```
app/
├── (auth)/              # Grupo de rutas de autenticación
├── api/                 # API Routes
│   ├── auth/            # Endpoints de autenticación
│   ├── [recurso]/       # Endpoints por recurso
│   └── route.ts         # Route handlers
├── dashboard/           # Rutas del dashboard
├── globals.css          # Estilos globales
├── layout.tsx           # Layout raíz
└── page.tsx             # Página de inicio
```

### `/components` - Componentes React
```
components/
├── ui/                  # Componentes base (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── table.tsx
│   └── ...
├── [seccion]-section.tsx # Componentes de secciones
└── shared/              # Componentes compartidos
```

### `/lib` - Utilidades y Configuraciones
```
lib/
├── auth.ts              # Configuración NextAuth
├── prisma.ts            # Cliente Prisma
├── utils.ts             # Utilidades generales
└── api.ts               # Cliente API
```

## Configuración de Base de Datos

### Esquema Prisma Principal
```prisma
// Modelo base para auditoría
model BaseModel {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Extensión para modelos específicos
model User extends BaseModel {
  email     String @unique
  password  String
  role      Role
  // ... otros campos
}
```

### Relaciones Principales
```
User ←→ Organizacion (1:N)
Organizacion ←→ Comunidad (1:N)
Comunidad ←→ Beneficiario (1:N)
ComunidadPimco ←→ EntrevistaPimco (1:N)
```

## Seguridad

### 1. Autenticación
- JWT tokens con NextAuth.js
- Cookies seguras (httpOnly, secure)
- Expiración automática de sesiones

### 2. Autorización
```typescript
// Middleware de autorización
export function withAuth(roles: Role[]) {
  return function(handler: NextApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const user = await getServerSession(req, res, authOptions)
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      
      return handler(req, res)
    }
  }
}
```

### 3. Validación de Datos
```typescript
// Esquemas Zod para validación
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MODERATOR', 'USER'])
})
```

### 4. Sanitización
- Escape de datos antes de mostrar
- Validación de entrada en cliente y servidor
- Protección contra XSS y SQL injection

## Performance

### 1. Optimizaciones de React
- Uso de React.memo para componentes pesados
- useCallback y useMemo para optimización
- Lazy loading de componentes grandes

### 2. Optimizaciones de Next.js
- Server Components por defecto
- Static Site Generation donde aplique
- Image optimization automática
- Bundle splitting automático

### 3. Optimizaciones de Base de Datos
```typescript
// Índices optimizados
model User {
  email String @unique @db.VarChar(255)
  
  @@index([role, createdAt])
  @@index([updatedAt])
}
```

### 4. Caching Strategy
- Next.js cache automático
- Prisma query caching
- Browser caching para assets estáticos

## Manejo de Errores

### 1. Error Boundaries
```typescript
class ErrorBoundary extends Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error)
  }
}
```

### 2. API Error Handling
```typescript
export async function handleApiError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Manejar errores específicos de Prisma
    switch (error.code) {
      case 'P2002':
        return { error: 'Record already exists' }
      case 'P2025':
        return { error: 'Record not found' }
    }
  }
  
  return { error: 'Internal server error' }
}
```

## Testing Strategy (Planificado)

### 1. Unit Tests
- Jest para testing de utilidades
- React Testing Library para componentes
- Vitest como alternativa rápida

### 2. Integration Tests
- Supertest para API endpoints
- Prisma test database
- Mock de servicios externos

### 3. E2E Tests
- Playwright para testing completo
- Scenarios de usuario críticos
- Testing cross-browser

## Deployment

### 1. Vercel (Recomendado)
```bash
# Deploy automático desde Git
git push origin main
```

### 2. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Variables de Entorno
```env
# Producción
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://tu-dominio.com"
```

## Monitoreo y Logging

### 1. Application Monitoring
- Console logs estructurados
- Error tracking con timestamps
- Performance monitoring

### 2. Database Monitoring
- Prisma query logging
- Slow query detection
- Connection pool monitoring

### 3. User Analytics
- Page view tracking
- User interaction metrics
- Feature usage analytics

---

**Versión:** 1.0  
**Última Actualización:** Septiembre 2025