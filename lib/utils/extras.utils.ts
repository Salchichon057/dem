import { FormSectionType } from '@/lib/types'
import { getExtrasConfig } from '@/lib/config/extras.config'

export interface BaseExtras {
  id?: string
  submission_id: string
  created_at?: string
  updated_at?: string
}

export interface VolunteerExtras extends BaseExtras {
  total_hours: number
  receives_benefit: boolean
  benefit_number: string | null
  agricultural_pounds: number
  unit_cost_q: number | null
  unit_cost_usd: number | null
  viveres_bags: number | null
  average_cost_30lbs: number | null
  picking_gtq: number | null
  picking_5lbs: number | null
  total_amount_q: number | null
  group_number: number | null
}

export interface BoardExtras extends BaseExtras {
  traffic_light: 'Rojo' | 'Amarillo' | 'Verde' | null
  recommendations: string | null
  follow_up_given: 'En proceso' | 'Completado' | 'No iniciado' | null
  follow_up_date: string | null
  concluded_result_red_or_no: string | null
  solutions: string | null
  preliminary_report: string | null
  full_report: string | null
}

export type ExtrasType = VolunteerExtras | BoardExtras

export async function fetchExtras<T extends ExtrasType>(
  sectionLocation: FormSectionType,
  submissionId: string
): Promise<T | null> {
  const config = getExtrasConfig(sectionLocation)
  
  if (!config.hasExtras || !config.apiEndpoint) {
    return null
  }

  try {
    const response = await fetch(`${config.apiEndpoint}/${submissionId}`)
    
    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch extras: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching extras:', error)
    return null
  }
}

export async function saveExtras<T extends ExtrasType>(
  sectionLocation: FormSectionType,
  data: Partial<T> & { submission_id: string }
): Promise<{ success: boolean; data?: T; error?: string }> {
  const config = getExtrasConfig(sectionLocation)
  
  if (!config.hasExtras || !config.apiEndpoint) {
    return {
      success: false,
      error: 'Este formulario no tiene campos extras',
    }
  }

  try {
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error || 'Error desconocido',
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Error saving extras:', error)
    return {
      success: false,
      error: 'Error al guardar los datos',
    }
  }
}

export async function fetchMultipleExtras<T extends ExtrasType>(
  sectionLocation: FormSectionType,
  submissionIds: string[]
): Promise<Record<string, T>> {
  const config = getExtrasConfig(sectionLocation)
  
  if (!config.hasExtras || !config.apiEndpoint) {
    return {}
  }

  const extrasMap: Record<string, T> = {}
  
  await Promise.all(
    submissionIds.map(async (submissionId) => {
      try {
        const response = await fetch(`${config.apiEndpoint}/${submissionId}`)
        if (response.ok) {
          const extras = await response.json()
          extrasMap[submissionId] = extras
        }
      } catch (error) {
        console.error(`Error fetching extras for ${submissionId}:`, error)
      }
    })
  )
  
  return extrasMap
}
