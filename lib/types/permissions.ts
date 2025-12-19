export type SectionKey = 
  | 'pimco-comunidades'
  | 'pimco-estadistica'
  | 'pimco-formularios'
  | 'pimco-diagnostico-comunitario'
  | 'organizaciones-estadistica'
  | 'organizaciones-formularios'
  | 'comunidades-lista'
  | 'comunidades-estadistica'
  | 'comunidades-formularios'
  | 'comunidades-plantillas'
  | 'auditorias-estadistica'
  | 'auditorias-formularios'
  | 'auditorias-tablero-consolidado'
  | 'auditorias-semaforo'
  | 'abrazando-leyendas'
  | 'voluntariado-estadistica'
  | 'voluntariado-formularios'
  | 'voluntariado-tablero'
  | 'admin-panel'

export interface RolePermissions {
  forms: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  users: {
    manage: boolean
  }
  submissions: {
    view_all: boolean
    delete: boolean
    export: boolean
  }
}

export interface UserSectionPermission {
  id: string
  user_id: string
  section_key: SectionKey
  created_at: string
  created_by: string | null
}

export interface Role {
  id: string
  name: 'admin' | 'editor' | 'viewer'
  description: string
  permissions: RolePermissions
  created_at: string
}

export interface UserWithPermissions {
  id: string
  email: string
  name: string | null
  role: Role
  allowedSections: SectionKey[]
  is_active: boolean
}

export const SECTION_GROUPS = {
  'Perfil Comunitario - PIMCO': [
    'pimco-comunidades',
    'pimco-estadistica',
    'pimco-formularios',
    'pimco-diagnostico-comunitario'
  ],
  'Organizaciones': [
    'organizaciones-estadistica',
    'organizaciones-formularios'
  ],
  'Comunidades': [
    'comunidades-lista',
    'comunidades-estadistica',
    'comunidades-formularios',
    'comunidades-plantillas'
  ],
  'Auditorías': [
    'auditorias-estadistica',
    'auditorias-formularios',
    'auditorias-tablero-consolidado',
    'auditorias-semaforo'
  ],
  'Abrazando Leyendas': [
    'abrazando-leyendas'
  ],
  'Voluntariado': [
    'voluntariado-estadistica',
    'voluntariado-formularios',
    'voluntariado-tablero'
  ]
} as const

export const SECTION_LABELS: Record<SectionKey, string> = {
  'pimco-comunidades': 'PIMCO - Comunidades',
  'pimco-estadistica': 'PIMCO - Estadística',
  'pimco-formularios': 'PIMCO - Formularios',
  'pimco-diagnostico-comunitario': 'PIMCO - Diagnóstico Comunitario',
  'organizaciones-estadistica': 'Organizaciones - Estadística',
  'organizaciones-formularios': 'Organizaciones - Formularios',
  'comunidades-lista': 'Comunidades - Lista',
  'comunidades-estadistica': 'Comunidades - Estadística',
  'comunidades-formularios': 'Comunidades - Formularios',
  'comunidades-plantillas': 'Comunidades - Plantillas',
  'auditorias-estadistica': 'Auditorías - Estadística',
  'auditorias-formularios': 'Auditorías - Formularios',
  'auditorias-tablero-consolidado': 'Auditorías - Tablero Consolidado',
  'auditorias-semaforo': 'Auditorías - Semáforo',
  'abrazando-leyendas': 'Abrazando Leyendas',
  'voluntariado-estadistica': 'Voluntariado - Estadística',
  'voluntariado-formularios': 'Voluntariado - Formularios',
  'voluntariado-tablero': 'Voluntariado - Tablero',
  'admin-panel': 'Panel de Admin'
}
