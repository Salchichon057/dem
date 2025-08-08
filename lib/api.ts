/**
 * Utilidades para llamadas a la API
 * Este archivo contiene todas las funciones para interactuar con las APIs del dashboard
 */

// Tipos de datos actualizados para Prisma
export interface Organizacion {
  id: string
  nombre: string
  descripcion?: string
  logo?: string
  estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA'
  direccion?: string
  telefono?: string
  email?: string
  sitioWeb?: string
  createdAt: string
  updatedAt: string
  miembros?: OrganizacionMiembro[]
  _count?: {
    formularios: number
    plantillas: number
  }
}

export interface OrganizacionMiembro {
  id: string
  userId: string
  organizacionId: string
  rol: 'ADMIN' | 'EDITOR' | 'MIEMBRO' | 'INVITADO'
  fechaIngreso: string
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface NuevaOrganizacion {
  nombre: string
  descripcion?: string
  direccion?: string
  telefono?: string
  email?: string
  sitioWeb?: string
}

export interface Usuario {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Estadistica {
  totalOrganizaciones: number
  organizacionesActivas: number
  organizacionesPendientes: number
  totalUsuarios: number
  crecimientoMensual: number
}

export interface Plantilla {
  id: number
  nombre: string
  descripcion: string
  contenido: string
  categoria: string
  fechaCreacion: string
  activa: boolean
}

export interface NuevaPlantilla {
  nombre: string
  descripcion: string
  contenido: string
  categoria: string
}

export interface Formulario {
  id: number
  titulo: string
  descripcion: string
  campos: CampoFormulario[]
  organizacionId: number
  fechaCreacion: string
  activo: boolean
}

export interface CampoFormulario {
  id: string
  tipo: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox'
  etiqueta: string
  requerido: boolean
  opciones?: string[]
}

export interface NuevoFormulario {
  titulo: string
  descripcion: string
  campos: CampoFormulario[]
  organizacionId: number
}

// Configuración base para las llamadas
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-dominio.com/api' 
  : '/api'

/**
 * Función helper para hacer llamadas HTTP con manejo de errores
 */
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth-token')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// ===== ORGANIZACIONES API =====

/**
 * Obtener todas las organizaciones
 */
export async function obtenerOrganizaciones(): Promise<Organizacion[]> {
  try {
    const data = await apiCall<{ organizaciones: Organizacion[] }>('/organizaciones')
    return data.organizaciones || []
  } catch (error) {
    console.error('Error obteniendo organizaciones:', error)
    throw error
  }
}

/**
 * Crear una nueva organización
 */
export async function crearOrganizacion(organizacion: NuevaOrganizacion): Promise<Organizacion> {
  try {
    const data = await apiCall<{ organizacion: Organizacion }>('/organizaciones', {
      method: 'POST',
      body: JSON.stringify(organizacion),
    })
    return data.organizacion
  } catch (error) {
    console.error('Error creando organización:', error)
    throw error
  }
}

/**
 * Actualizar una organización existente
 */
export async function actualizarOrganizacion(
  id: string, 
  organizacion: Partial<NuevaOrganizacion>
): Promise<Organizacion> {
  try {
    const data = await apiCall<{ organizacion: Organizacion }>(`/organizaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(organizacion),
    })
    return data.organizacion
  } catch (error) {
    console.error('Error actualizando organización:', error)
    throw error
  }
}

/**
 * Eliminar una organización
 */
export async function eliminarOrganizacion(id: string): Promise<void> {
  try {
    await apiCall(`/organizaciones/${id}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Error eliminando organización:', error)
    throw error
  }
}

/**
 * Cambiar estado de una organización (Activa/Inactiva)
 */
export async function cambiarEstadoOrganizacion(
  id: string, 
  estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA'
): Promise<Organizacion> {
  try {
    const data = await apiCall<{ organizacion: Organizacion }>(`/organizaciones/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    })
    return data.organizacion
  } catch (error) {
    console.error('Error cambiando estado de organización:', error)
    throw error
  }
}

// ===== ESTADÍSTICAS API =====

/**
 * Obtener estadísticas del dashboard
 */
export async function obtenerEstadisticas(): Promise<Estadistica> {
  try {
    const data = await apiCall<Estadistica>('/estadisticas')
    return data
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    throw error
  }
}

// ===== USUARIOS API =====

/**
 * Obtener perfil del usuario actual
 */
export async function obtenerPerfilUsuario(): Promise<Usuario> {
  try {
    const data = await apiCall<{ user: Usuario }>('/auth/verify')
    return data.user
  } catch (error) {
    console.error('Error obteniendo perfil de usuario:', error)
    throw error
  }
}

/**
 * Actualizar perfil del usuario
 */
export async function actualizarPerfilUsuario(
  datos: Partial<{ name: string; email: string }>
): Promise<Usuario> {
  try {
    const data = await apiCall<{ user: Usuario }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(datos),
    })
    return data.user
  } catch (error) {
    console.error('Error actualizando perfil de usuario:', error)
    throw error
  }
}

/**
 * Cambiar contraseña del usuario
 */
export async function cambiarContrasena(
  contrasenaActual: string,
  contrasenaNueva: string
): Promise<void> {
  try {
    await apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: contrasenaActual,
        newPassword: contrasenaNueva,
      }),
    })
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    throw error
  }
}

// ===== PLANTILLAS API =====

/**
 * Obtener todas las plantillas
 */
export async function obtenerPlantillas(): Promise<Plantilla[]> {
  try {
    const data = await apiCall<{ plantillas: Plantilla[] }>('/plantillas')
    return data.plantillas || []
  } catch (error) {
    console.error('Error obteniendo plantillas:', error)
    throw error
  }
}

/**
 * Crear una nueva plantilla
 */
export async function crearPlantilla(plantilla: NuevaPlantilla): Promise<Plantilla> {
  try {
    const data = await apiCall<{ plantilla: Plantilla }>('/plantillas', {
      method: 'POST',
      body: JSON.stringify(plantilla),
    })
    return data.plantilla
  } catch (error) {
    console.error('Error creando plantilla:', error)
    throw error
  }
}

// ===== FORMULARIOS API =====

/**
 * Obtener todos los formularios
 */
export async function obtenerFormularios(): Promise<Formulario[]> {
  try {
    const data = await apiCall<{ formularios: Formulario[] }>('/formularios')
    return data.formularios || []
  } catch (error) {
    console.error('Error obteniendo formularios:', error)
    throw error
  }
}

/**
 * Crear un nuevo formulario
 */
export async function crearFormulario(formulario: NuevoFormulario): Promise<Formulario> {
  try {
    const data = await apiCall<{ formulario: Formulario }>('/formularios', {
      method: 'POST',
      body: JSON.stringify(formulario),
    })
    return data.formulario
  } catch (error) {
    console.error('Error creando formulario:', error)
    throw error
  }
}

// ===== MANEJO DE ERRORES =====

/**
 * Función helper para manejar errores de API de manera consistente
 */
export function manejarErrorApi(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'Ha ocurrido un error inesperado'
}

/**
 * Verificar si el usuario está autenticado
 */
export function estaAutenticado(): boolean {
  return !!localStorage.getItem('auth-token')
}

/**
 * Limpiar datos de autenticación
 */
export function limpiarAutenticacion(): void {
  localStorage.removeItem('auth-token')
  document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
}
