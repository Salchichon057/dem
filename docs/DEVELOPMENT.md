# Manual de Desarrollo - Dashboard ONG

## Configuración del Entorno de Desarrollo

### Prerequisitos

1. **Node.js 18+**
   ```bash
   # Verificar versión
   node --version
   npm --version
   ```

2. **PostgreSQL 14+**
   ```bash
   # Verificar instalación
   psql --version
   ```

3. **Git**
   ```bash
   git --version
   ```

### Instalación Inicial

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd dashboard-ong
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar archivo de ejemplo
   cp .env.example .env.local
   
   # Editar variables
   nano .env.local
   ```

4. **Configurar base de datos**
   ```bash
   # Crear base de datos
   createdb dashboard_ong
   
   # Ejecutar migraciones
   npx prisma migrate dev
   
   # Generar cliente Prisma
   npx prisma generate
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## Estructura de Desarrollo

### Flujo de Trabajo Git

```bash
# 1. Crear rama para nueva feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push de la rama
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request
# 5. Merge después de review
```

### Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## Guías de Desarrollo

### 1. Creación de Componentes

#### Estructura de Componente Base
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MiComponenteProps {
  titulo: string
  datos?: any[]
}

export function MiComponente({ titulo, datos = [] }: MiComponenteProps) {
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Lógica de inicialización
  }, [])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenido del componente */}
      </CardContent>
    </Card>
  )
}
```

#### Convenciones para Componentes
- Usar PascalCase para nombres de componentes
- Exportar como named export
- Definir interfaces para props
- Usar TypeScript estricto
- Incluir JSDoc para componentes complejos

### 2. Creación de API Routes

#### Template para API Route
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Esquema de validación
const CreateSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido')
})

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.miModelo.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error en GET:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateSchema.parse(body)
    
    const result = await prisma.miModelo.create({
      data: validatedData
    })
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error en POST:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

### 3. Manejo de Estado

#### Custom Hook para API
```typescript
import { useState, useEffect, useCallback } from 'react'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(endpoint: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Error en la petición')
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [endpoint])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch: fetchData }
}
```

### 4. Formularios y Validación

#### Template de Formulario
```typescript
import { useState } from 'react'
import { z } from 'zod'

const FormSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido')
})

type FormData = z.infer<typeof FormSchema>

export function MiFormulario() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validar datos
      const validatedData = FormSchema.parse(formData)
      setErrors({})
      
      setLoading(true)
      
      // Enviar datos
      const response = await fetch('/api/mi-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })
      
      if (!response.ok) throw new Error('Error al enviar')
      
      // Manejar éxito
      console.log('Datos enviados exitosamente')
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<FormData> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormData] = err.message
          }
        })
        setErrors(fieldErrors)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## Base de Datos

### Flujo de Migraciones

1. **Modificar schema.prisma**
   ```prisma
   model NuevoModelo {
     id        String   @id @default(cuid())
     nombre    String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Crear migración**
   ```bash
   npx prisma migrate dev --name agregar-nuevo-modelo
   ```

3. **Generar cliente**
   ```bash
   npx prisma generate
   ```

### Seeds de Datos

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear datos de prueba
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@ejemplo.com',
        password: 'hashedPassword',
        name: 'Administrador',
        role: 'ADMIN'
      }
    ]
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Ejecutar seeds:
```bash
npx prisma db seed
```

## Testing

### Setup de Testing (Futuro)

1. **Instalar dependencias**
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom
   ```

2. **Configurar Jest**
   ```javascript
   // jest.config.js
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     moduleNameMapping: {
       '^@/(.*)$': '<rootDir>/$1'
     }
   }
   ```

3. **Test de componente**
   ```typescript
   import { render, screen } from '@testing-library/react'
   import { MiComponente } from '@/components/MiComponente'
   
   describe('MiComponente', () => {
     test('renderiza correctamente', () => {
       render(<MiComponente titulo="Test" />)
       expect(screen.getByText('Test')).toBeInTheDocument()
     })
   })
   ```

## Debugging

### Herramientas de Debug

1. **React Developer Tools**
   - Instalar extensión de navegador
   - Inspeccionar componentes y estado

2. **Prisma Studio**
   ```bash
   npx prisma studio
   ```

3. **Next.js Debugger**
   ```typescript
   // Usar debugger; en el código
   debugger;
   console.log('Debug info:', variable);
   ```

### Logs Estructurados

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data)
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error)
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data)
  }
}
```

## Performance

### Optimizaciones de React

```typescript
import { memo, useCallback, useMemo } from 'react'

// Memoizar componentes pesados
const ComponentePesado = memo(function ComponentePesado({ data }) {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }))
  }, [data])
  
  const handleClick = useCallback((id: string) => {
    // Manejar click
  }, [])
  
  return <div>{/* Renderizado */}</div>
})
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const ComponentePesado = lazy(() => import('./ComponentePesado'))

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ComponentePesado />
    </Suspense>
  )
}
```

## Deployment

### Build Local

```bash
# Verificar build
npm run build

# Iniciar en modo producción
npm start
```

### Variables de Entorno para Producción

```env
NODE_ENV=production
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://tu-dominio.com"
```

### Vercel Deployment

1. **Conectar repositorio a Vercel**
2. **Configurar variables de entorno**
3. **Deploy automático en push a main**

### Docker Deployment

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

## Troubleshooting

### Problemas Comunes

1. **Error de Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Conflictos de dependencias**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Errores de TypeScript**
   ```bash
   npm run type-check
   ```

4. **Problemas de build**
   ```bash
   npm run lint
   npm run build
   ```

### Logs de Debug

```typescript
// Habilitar logs de Prisma
// En .env
DEBUG="prisma:query"

// Logs de Next.js
// En next.config.ts
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

## Recursos Útiles

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Radix UI Docs](https://www.radix-ui.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tools
- [Prisma Studio](https://www.prisma.io/studio)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Next.js DevTools](https://nextjs.org/docs/app/api-reference/next-config-js/devIndicators)

---

**Versión:** 1.0  
**Última Actualización:** Septiembre 2025