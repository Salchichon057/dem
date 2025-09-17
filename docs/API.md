# API Documentation - Dashboard ONG

## Visión General de la API

La API del Dashboard ONG está construida con Next.js App Router y proporciona endpoints RESTful para la gestión completa de organizaciones no gubernamentales.

### Base URL
```
Desarrollo: http://localhost:3000/api
Producción: https://tu-dominio.com/api
```

### Autenticación
Todos los endpoints (excepto los públicos) requieren autenticación JWT via cookies de sesión.

```typescript
// Headers requeridos
{
  "Content-Type": "application/json",
  "Cookie": "next-auth.session-token=..."
}
```

## Endpoints de Autenticación

### POST /api/auth/signin
Autenticar usuario y crear sesión.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clr1234567890",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "USER"
  },
  "token": "jwt-token-aqui"
}
```

### POST /api/auth/signup
Registrar nuevo usuario.

**Request Body:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "name": "Nuevo Usuario",
  "role": "USER"
}
```

### POST /api/auth/signout
Cerrar sesión del usuario.

**Response:** `200 OK`

## Endpoints de Usuarios

### GET /api/usuarios
Obtener lista de usuarios (Solo ADMIN/MODERATOR).

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `role` (opcional): Filtrar por rol

**Response:**
```json
{
  "users": [
    {
      "id": "clr1234567890",
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "role": "USER",
      "estado": "activo",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

### POST /api/usuarios
Crear nuevo usuario (Solo ADMIN).

**Request Body:**
```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "name": "Nuevo Usuario",
  "apellidos": "Apellidos Usuario",
  "telefono": "+502 1234-5678",
  "role": "USER",
  "organizacion": "ONG Ejemplo"
}
```

### PUT /api/usuarios/[id]
Actualizar usuario existente.

**Request Body:** (Mismos campos que POST, todos opcionales)

### DELETE /api/usuarios/[id]
Eliminar usuario (Solo ADMIN).

**Response:** `200 OK`

## Endpoints de Organizaciones

### GET /api/organizaciones
Obtener lista de organizaciones.

**Response:**
```json
{
  "organizaciones": [
    {
      "id": "org123456789",
      "nombre": "ONG Ejemplo",
      "tipo": "Fundación",
      "telefono": "+502 1234-5678",
      "email": "contacto@ongejemplo.org",
      "direccion": "Ciudad de Guatemala",
      "estado": "activa",
      "fechaRegistro": "2025-01-01"
    }
  ]
}
```

### POST /api/organizaciones
Crear nueva organización.

**Request Body:**
```json
{
  "nombre": "Nueva ONG",
  "tipo": "Fundación",
  "telefono": "+502 1234-5678",
  "email": "contacto@nuevaong.org",
  "direccion": "Dirección completa",
  "descripcion": "Descripción de la organización",
  "estado": "activa"
}
```

## Endpoints de Comunidades

### GET /api/comunidades
Obtener comunidades del programa Ruta de Alimentos.

**Response:**
```json
{
  "comunidades": [
    {
      "id": "com123456789",
      "fechaInscripcion": "2025-01-17",
      "departamento": "Guatemala",
      "municipio": "Guatemala",
      "aldeas": "Aldea Central",
      "lider": "María González",
      "numeroLider": "1234-5678",
      "activa": true,
      "cantidadFamilias": 150,
      "cantidadFamRA": 80
    }
  ]
}
```

### POST /api/comunidades
Crear nueva comunidad.

### PUT /api/comunidades/[id]
Actualizar comunidad existente.

### DELETE /api/comunidades/[id]
Eliminar comunidad.

## Endpoints de Comunidades PIMCO

### GET /api/comunidades-pimco
Obtener comunidades del programa PIMCO.

**Response:**
```json
{
  "comunidades": [
    {
      "id": "pimco123456789",
      "departamento": "Guatemala",
      "municipio": "San Juan Sacatepéquez",
      "aldeas": "Aldea Central",
      "caseriosQueAtienden": "Caserío 1, Caserío 2",
      "qtyCaseriosQueAtienden": 2,
      "liderNumero": "María González / 1234-5678",
      "comiteComunitario": "Activo",
      "activa": true,
      "cantidadFamiliasEnComunidad": 100,
      "cantidadFamEnRA": 75,
      "_count": {
        "entrevistas": 5
      }
    }
  ]
}
```

### POST /api/comunidades-pimco
Crear nueva comunidad PIMCO.

**Request Body:**
```json
{
  "departamento": "Guatemala",
  "municipio": "San Juan Sacatepéquez",
  "aldeas": "Aldea Central",
  "caseriosQueAtienden": "Caserío 1, Caserío 2",
  "qtyCaseriosQueAtienden": 2,
  "ubicacionGoogleMaps": "https://maps.google.com/...",
  "liderNumero": "María González / 1234-5678",
  "comiteComunitario": "Activo",
  "activa": true,
  "cantidadFamiliasEnComunidad": 100,
  "cantidadFamEnRA": 75,
  "fotografiaReferencia": "https://...",
  "motivoSuspencionOBaja": ""
}
```

### PUT /api/comunidades-pimco/[id]
Actualizar comunidad PIMCO.

### DELETE /api/comunidades-pimco/[id]
Eliminar comunidad PIMCO.

## Endpoints de Entrevistas PIMCO

### GET /api/entrevistas-pimco
Obtener entrevistas del programa PIMCO.

**Query Parameters:**
- `comunidadId` (opcional): Filtrar por comunidad
- `departamento` (opcional): Filtrar por departamento
- `municipio` (opcional): Filtrar por municipio

**Response:**
```json
{
  "entrevistas": [
    {
      "id": "ent123456789",
      "codigoEntrevista": "PIMCO-2025-001",
      "fechaEntrevista": "2025-01-17",
      "nombreCompleto": "Ana María López",
      "edad": 35,
      "genero": "Femenino",
      "departamento": "Guatemala",
      "municipio": "San Juan Sacatepéquez",
      "comunidad": {
        "aldeas": "Aldea Central"
      }
    }
  ]
}
```

### POST /api/entrevistas-pimco
Crear nueva entrevista.

## Endpoints de BD Estadísticas PIMCO

### GET /api/pimco-bd-estadisticas
Obtener datos de la base de datos estadística PIMCO.

**Query Parameters:**
- `page` (opcional): Número de página
- `limit` (opcional): Elementos por página
- `departamento` (opcional): Filtrar por departamento
- `municipio` (opcional): Filtrar por municipio
- `search` (opcional): Búsqueda por texto

**Response:**
```json
{
  "encuestas": [
    {
      "id": "est123456789",
      "codigoEncuesta": "EST-PIMCO-2025-001",
      "fechaEncuesta": "2025-01-17",
      "nombreCompleto": "Juan Carlos Pérez",
      "edad": 42,
      "genero": "Masculino",
      "departamento": "Guatemala",
      "municipio": "San Juan Sacatepéquez",
      "comunidad": "Aldea Central",
      "estadoCivil": "Casado",
      "escolaridad": "Primaria completa",
      "ocupacion": "Agricultor",
      // ... más de 300 campos adicionales
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "estadisticas": {
    "totalEncuestas": 150,
    "porGenero": {
      "Masculino": 75,
      "Femenino": 75
    },
    "porDepartamento": {
      "Guatemala": 100,
      "Sacatepéquez": 50
    }
  }
}
```

### POST /api/pimco-bd-estadisticas
Crear nueva encuesta estadística.

**Request Body:** (Objeto con más de 300 campos)

## Endpoints de Beneficiarios

### GET /api/beneficiarios
Obtener lista de beneficiarios.

### POST /api/beneficiarios
Crear nuevo beneficiario.

### PUT /api/beneficiarios/[id]
Actualizar beneficiario.

### DELETE /api/beneficiarios/[id]
Eliminar beneficiario.

## Endpoints de Estadísticas

### GET /api/estadisticas
Obtener estadísticas generales del sistema.

**Response:**
```json
{
  "resumen": {
    "totalUsuarios": 125,
    "totalOrganizaciones": 25,
    "totalComunidades": 75,
    "totalBeneficiarios": 1500
  },
  "crecimiento": {
    "usuariosNuevosMes": 15,
    "comunidadesNuevasMes": 5,
    "beneficiariosNuevosMes": 100
  },
  "porDepartamento": {
    "Guatemala": 800,
    "Sacatepéquez": 400,
    "Chimaltenango": 300
  }
}
```

### GET /api/estadisticas-pimco
Obtener estadísticas específicas del programa PIMCO.

## Códigos de Estado HTTP

### Exitosos
- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Operación exitosa sin contenido

### Errores del Cliente
- `400 Bad Request` - Datos de entrada inválidos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos suficientes
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto con recurso existente

### Errores del Servidor
- `500 Internal Server Error` - Error interno del servidor
- `503 Service Unavailable` - Servicio no disponible

## Formato de Errores

Todos los errores siguen un formato consistente:

```json
{
  "error": "Descripción del error",
  "code": "ERROR_CODE",
  "details": {
    "field": "valor inválido"
  },
  "timestamp": "2025-01-17T10:30:00Z"
}
```

## Validación de Datos

### Esquemas Zod Utilizados

```typescript
// Usuario
const UserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  name: z.string().min(2, "Mínimo 2 caracteres"),
  role: z.enum(["ADMIN", "MODERATOR", "USER"])
})

// Comunidad PIMCO
const ComunidadPimcoSchema = z.object({
  departamento: z.string().min(1, "Departamento requerido"),
  municipio: z.string().min(1, "Municipio requerido"),
  aldeas: z.string().min(1, "Aldeas requeridas"),
  qtyCaseriosQueAtienden: z.number().min(0),
  activa: z.boolean()
})
```

## Rate Limiting

### Límites por Endpoint
- Autenticación: 5 intentos por minuto por IP
- API general: 100 requests por minuto por usuario
- Uploads: 10 requests por minuto por usuario

## Paginación

### Parámetros Estándar
```
?page=1&limit=10&sort=createdAt&order=desc
```

### Response de Paginación
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Versionado de API

Actualmente en versión 1.0. Futuras versiones incluirán header:
```
Accept: application/vnd.dashboard-ong.v2+json
```

---

**Versión de API:** 1.0  
**Última Actualización:** Septiembre 2025