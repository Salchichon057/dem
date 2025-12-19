/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/client'
import { SUBMISSION_TABLES_MAP } from '@/lib/types'

/**
 * Helper para manejar submissions en las tablas correctas según section_location
 * Usa el mapper SUBMISSION_TABLES_MAP
 */

interface SubmissionData {
  form_template_id: string
  user_id: string | null
  submitted_at?: string
  updated_at?: string
}

interface AnswerData {
  submission_id: string
  question_id: string
  answer_value: Record<string, any>
  created_at?: string
}

/**
 * Obtiene los nombres de las tablas según el section_location
 */
export function getSubmissionTables(sectionLocation: string) {
  const tables = SUBMISSION_TABLES_MAP[sectionLocation]
  
  if (!tables) {
    throw new Error(`No se encontró tabla de submissions para section_location: ${sectionLocation}`)
  }
  
  return tables
}

/**
 * Crea una nueva submission en la tabla correspondiente
 */
export async function createSubmission(
  sectionLocation: string,
  data: SubmissionData
) {
  const supabase = createClient()
  const { submissions } = getSubmissionTables(sectionLocation)
  
  const { data: submission, error } = await supabase
    .from(submissions)
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return submission
}

/**
 * Crea múltiples answers en la tabla correspondiente
 */
export async function createAnswers(
  sectionLocation: string,
  answers: AnswerData[]
) {
  const supabase = createClient()
  const { answers: answersTable } = getSubmissionTables(sectionLocation)
  
  const { data, error } = await supabase
    .from(answersTable)
    .insert(answers)
    .select()
  
  if (error) {
    throw error
  }
  return data
}

/**
 * Obtiene submissions de un formulario específico
 */
export async function getSubmissionsByFormId(
  sectionLocation: string,
  formTemplateId: string
) {
  const supabase = createClient()
  const { submissions } = getSubmissionTables(sectionLocation)
  
  const { data, error } = await supabase
    .from(submissions)
    .select('*')
    .eq('form_template_id', formTemplateId)
    .order('submitted_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Obtiene las respuestas de una submission específica
 */
export async function getAnswersBySubmissionId(
  sectionLocation: string,
  submissionId: string
) {
  const supabase = createClient()
  const { answers } = getSubmissionTables(sectionLocation)
  
  const { data, error } = await supabase
    .from(answers)
    .select('*')
    .eq('submission_id', submissionId)
  
  if (error) throw error
  return data
}

/**
 * Cuenta submissions para un formulario específico
 */
export async function countSubmissionsByFormId(
  sectionLocation: string,
  formTemplateId: string
): Promise<number> {
  const supabase = createClient()
  const { submissions } = getSubmissionTables(sectionLocation)
  
  const { count, error } = await supabase
    .from(submissions)
    .select('*', { count: 'exact', head: true })
    .eq('form_template_id', formTemplateId)
  
  if (error) throw error
  return count || 0
}

/**
 * Cuenta submissions para múltiples formularios
 * Retorna un objeto con form_template_id como key y count como value
 */
export async function countSubmissionsByFormIds(
  sectionLocation: string,
  formTemplateIds: string[]
): Promise<Record<string, number>> {
  const supabase = createClient()
  const { submissions } = getSubmissionTables(sectionLocation)
  
  const { data, error } = await supabase
    .from(submissions)
    .select('form_template_id')
    .in('form_template_id', formTemplateIds)
  
  if (error) throw error
  
  // Contar manualmente los submissions por form_template_id
  const counts = (data || []).reduce((acc, sub) => {
    acc[sub.form_template_id] = (acc[sub.form_template_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return counts
}

/**
 * Elimina una submission y sus respuestas (CASCADE automático por FK)
 */
export async function deleteSubmission(
  sectionLocation: string,
  submissionId: string
) {
  const supabase = createClient()
  const { submissions } = getSubmissionTables(sectionLocation)
  
  const { error } = await supabase
    .from(submissions)
    .delete()
    .eq('id', submissionId)
  
  if (error) throw error
  return true
}

/**
 * Obtiene conteos de submissions agrupados por section_location
 * Útil para obtener estadísticas generales
 */
export async function getAllSubmissionsCounts(
  formTemplateIds: string[]
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  
  // Obtener todos los formularios con sus section_locations
  const supabase = createClient()
  const { data: forms } = await supabase
    .from('form_templates')
    .select('id, section_location')
    .in('id', formTemplateIds)
  
  if (!forms) return counts
  
  // Agrupar por section_location
  const formsBySection: Record<string, string[]> = {}
  
  for (const form of forms) {
    if (!form.section_location) continue
    
    if (!formsBySection[form.section_location]) {
      formsBySection[form.section_location] = []
    }
    formsBySection[form.section_location].push(form.id)
  }
  
  // Contar para cada section_location
  for (const [sectionLocation, ids] of Object.entries(formsBySection)) {
    try {
      const sectionCounts = await countSubmissionsByFormIds(
        sectionLocation,
        ids
      )
      
      // Agregar al total
      for (const [formId, count] of Object.entries(sectionCounts)) {
        counts[formId] = count
      }
    } catch {
    }
  }
  
  return counts
}


