/**
 * Tipos para Communities (Comunidades)
 * Basado en la tabla communities y comunidades.md
 */

// Enum para el estado de las comunidades
export enum CommunityStatus {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
  SUSPENDIDA = 'suspendida'
}

// Enum para clasificación de tamaño
export enum CommunityClassification {
  PEQUENA = 'Pequeña',
  MEDIANA = 'Mediana',
  GRANDE = 'Grande'
}

export interface Community {
  // Identificador
  id: string
  
  // Información básica
  registration_date: string | null
  
  // Ubicación
  department: string
  municipality: string
  villages: string | null
  hamlets_served: string | null
  hamlets_count: number | null
  google_maps_url: string | null
  
  // Liderazgo
  leader_name: string | null
  leader_phone: string | null
  is_in_leaders_group: boolean
  community_committee: string | null
  
  // Estado
  status: 'activa' | 'inactiva' | 'suspendida'
  inactive_reason: string | null
  
  // Familias
  total_families: number | null
  families_in_ra: number | null
  
  // Demografía
  early_childhood_women: number
  early_childhood_men: number
  childhood_3_5_women: number
  childhood_3_5_men: number
  youth_6_10_women: number
  youth_6_10_men: number
  adults_11_18_women: number
  adults_11_18_men: number
  adults_19_60_women: number
  adults_19_60_men: number
  seniors_61_plus_women: number
  seniors_61_plus_men: number
  
  // Salud
  pregnant_women: number
  lactating_women: number
  
  // Operación
  placement_type: string | null
  has_whatsapp_group: boolean
  classification: 'Pequeña' | 'Mediana' | 'Grande' | null
  storage_capacity: string | null
  placement_methods: string | null
  
  // Baja
  termination_date: string | null
  termination_reason: string | null
  
  // Foto
  photo_reference_url: string | null
  
  // Auditoría
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

export interface CommunityFilters {
  department?: string
  municipality?: string
  status?: 'activa' | 'inactiva' | 'suspendida'
  classification?: string
  search?: string
}

export interface CreateCommunityInput {
  registration_date?: string
  department: string
  municipality: string
  villages?: string
  hamlets_served?: string
  hamlets_count?: number
  google_maps_url?: string
  leader_name?: string
  leader_phone?: string
  is_in_leaders_group?: boolean
  community_committee?: string
  status?: 'activa' | 'inactiva' | 'suspendida'
  inactive_reason?: string
  total_families?: number
  families_in_ra?: number
  early_childhood_women?: number
  early_childhood_men?: number
  childhood_3_5_women?: number
  childhood_3_5_men?: number
  youth_6_10_women?: number
  youth_6_10_men?: number
  adults_11_18_women?: number
  adults_11_18_men?: number
  adults_19_60_women?: number
  adults_19_60_men?: number
  seniors_61_plus_women?: number
  seniors_61_plus_men?: number
  pregnant_women?: number
  lactating_women?: number
  placement_type?: string
  has_whatsapp_group?: boolean
  classification?: 'Pequeña' | 'Mediana' | 'Grande'
  storage_capacity?: string
  placement_methods?: string
  termination_date?: string
  termination_reason?: string
  photo_reference_url?: string
}

export interface UpdateCommunityInput extends Partial<CreateCommunityInput> {
  id: string
}

export interface CommunityStats {
  total: number
  active: number
  inactive: number
  suspended: number
  by_department: { department: string; count: number }[]
  by_classification: { classification: string; count: number }[]
  total_families: number
  total_families_in_ra: number
}
