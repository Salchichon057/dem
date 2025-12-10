export * from './supabase/types'
export * from './types/community'

// Enum para los tipos de sección de formularios
export enum FormSectionType {
  PERFIL_COMUNITARIO = 'perfil-comunitario',
  ORGANIZACIONES = 'organizaciones',
  AUDITORIAS = 'auditorias',
  COMUNIDADES = 'comunidades',
  VOLUNTARIADO = 'voluntariado',
  ABRAZANDO_LEYENDAS = 'abrazando-leyendas'
}

// Mapper: section_location -> tabla de submissions correspondiente
export const SUBMISSION_TABLES_MAP: Record<FormSectionType, { submissions: string; answers: string }> = {
  [FormSectionType.ORGANIZACIONES]: {
    submissions: 'organizations_submissions',
    answers: 'organizations_answers'
  },
  [FormSectionType.AUDITORIAS]: {
    submissions: 'audits_submissions',
    answers: 'audits_answers'
  },
  [FormSectionType.PERFIL_COMUNITARIO]: {
    submissions: 'community_profile_submissions',
    answers: 'community_profile_answers'
  },
  [FormSectionType.VOLUNTARIADO]: {
    submissions: 'volunteer_submissions',
    answers: 'volunteer_answers'
  },
  [FormSectionType.COMUNIDADES]: {
    submissions: 'communities_submissions',
    answers: 'communities_answers'
  },
  [FormSectionType.ABRAZANDO_LEYENDAS]: {
    submissions: 'embracing_legends_submissions',
    answers: 'embracing_legends_answers'
  }
}

export interface QuestionConfig {
  options?: Array<string | { text: string; value?: string }> 
  rows?: Array<{ text: string }>
  columns?: Array<{ text: string }>
  min?: number
  max?: number
  step?: number
  minLabel?: string
  maxLabel?: string
  maxLength?: number
  allowedTypes?: string[]
  imageUrl?: string
  videoUrl?: string
  maxSize?: number
}

export interface CreateFormInput {
  name: string
  description?: string
  slug: string
  is_public: boolean
  section_location?: FormSectionType // Ahora usa el enum
  sections: CreateSectionInput[]
}

export interface CreateSectionInput {
  title: string
  description?: string | null
  order_index: number
  questions: CreateQuestionInputBuilder[]
}

export interface CreateQuestionInputBuilder {
  title: string
  help_text?: string | null
  is_required: boolean
  order_index: number
  question_type_id: string
  config: QuestionConfig
}

export interface SubmitFormInput {
  formId: string
  answers: Array<{
    questionId: string
    answerValue: string | number | boolean | string[] | Record<string, string> | null
  }>
  timeSpentSeconds?: number
}


export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface FormListResponse {
  forms: Array<{
    id: string
    name: string
    description: string | null
    slug: string
    section_location: FormSectionType | null // Ahora usa el enum
    is_active: boolean
    is_public: boolean
    created_at: string
    updated_at: string
    submission_count: number
  }>
  total: number
}

// Tipo para formulario completo con preguntas y secciones
export interface FormTemplateWithQuestions {
  id: string
  slug: string
  name: string
  description: string | null
  section_location: FormSectionType | null
  version: number
  is_active: boolean
  is_public: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  sections: Array<{
    id: string
    form_template_id: string
    title: string
    description: string | null
    order_index: number
    created_at: string
    questions: Array<{
      id: string
      form_template_id: string
      section_id: string
      question_type_id: string
      title: string
      help_text: string | null
      is_required: boolean
      order_index: number
      config: QuestionConfig
      created_at: string
      updated_at: string
      question_types: {
        id: string
        code: string
        name: string
        description: string | null
        validation_schema: Record<string, unknown> | null
        created_at: string
      }
    }>
  }>
  questions: Array<{
    id: string
    form_template_id: string
    section_id: string
    question_type_id: string
    title: string
    help_text: string | null
    is_required: boolean
    order_index: number
    config: QuestionConfig
    created_at: string
    updated_at: string
    question_types: {
      id: string
      code: string
      name: string
      description: string | null
      validation_schema: Record<string, unknown> | null
      created_at: string
    }
    form_sections?: {
      id: string
      form_template_id: string
      title: string
      description: string | null
      order_index: number
      created_at: string
    } | null
  }>
}

// Tipo para pregunta con relaciones
export interface QuestionWithRelations {
  id: string
  form_template_id: string
  section_id: string
  question_type_id: string
  title: string
  help_text: string | null
  is_required: boolean
  order_index: number
  config: QuestionConfig
  created_at: string
  updated_at: string
  question_types: {
    id: string
    code: string
    name: string
    description: string | null
    validation_schema: Record<string, unknown> | null
    created_at: string
  }
  form_sections?: {
    id: string
    form_template_id: string
    title: string
    description: string | null
    order_index: number
    created_at: string
  } | null
}

// =====================================================
// BENEFICIARIES TYPES
// =====================================================

export interface Beneficiary {
  id: string
  name: string
  age: number
  gender: 'Masculino' | 'Femenino'
  dpi: string | null
  program: string
  photo_url: string | null
  admission_date: string // ISO date string
  is_active: boolean
  department: string
  municipality: string
  village: string | null
  address: string | null
  google_maps_url: string | null
  personal_contact: string | null
  personal_number: string | null
  community_contact: string | null
  community_number: string | null
  bag: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

export interface CreateBeneficiaryInput {
  name: string
  age: number
  gender: 'Masculino' | 'Femenino'
  dpi?: string
  program: string
  photo_url?: string
  admission_date: string
  is_active?: boolean
  department: string
  municipality: string
  village?: string
  address?: string
  google_maps_url?: string
  personal_contact?: string
  personal_number?: string
  community_contact?: string
  community_number?: string
  bag?: string
}

export interface UpdateBeneficiaryInput extends Partial<CreateBeneficiaryInput> {
  id: string
}

export interface BeneficiaryFilters {
  department?: string
  municipality?: string
  program?: string
  is_active?: boolean
  search?: string // Para buscar por nombre
}

export interface DepartmentDetails {
  total: number
  masculino: number
  femenino: number
  programs: Record<string, number> // Desglose dinámico por programa
}

export interface BeneficiaryStats {
  total: number
  active: number
  inactive: number
  by_gender: {
    masculino: number
    femenino: number
  }
  by_department: Record<string, number>
  by_department_details: Record<string, DepartmentDetails>
  by_program: Record<string, number>
  average_age: number
  by_bag?: Record<string, number>
}

// ============================================
// VOLUNTEERS TYPES
// ============================================

export interface Volunteer {
  id: string
  name: string
  volunteer_type: 'Individual' | 'Comunidad' | 'ONG Aliada'
  organization: string | null
  shift: 'Diurno' | 'Nocturno'
  entry_time: string
  exit_time: string
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
  department: string | null
  municipality: string | null
  village: string | null
  work_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

export interface VolunteerFilters {
  volunteer_type?: string
  organization?: string
  shift?: string
  is_active?: boolean
  work_date?: string
  search?: string
}

export interface VolunteerStats {
  total: number
  active: number
  inactive: number
  total_hours: number
  total_with_benefit: number
  by_type: Record<string, number>
  by_organization: Record<string, number>
  by_shift: Record<string, number>
  by_date: Record<string, {
    volunteers: number
    hours: number
  }>
}

// ============================================
// BOARD EXTRAS (AUDIT TRACKING) TYPES
// ============================================

export type TrafficLightStatus = 'Rojo' | 'Amarillo' | 'Verde'
export type ConcludedStatus = 'Sí' | 'No'

export interface BoardExtra {
  id: string
  submission_id: string
  traffic_light: TrafficLightStatus | null
  recommendations: string | null
  follow_up_given: string | null
  follow_up_date: string | null
  concluded_result_red_or_no: ConcludedStatus | null
  solutions: string | null
  preliminary_report: string | null
  full_report: string | null
  created_at: string
  updated_at: string
  audits_submissions?: {
    submitted_at: string
  }
}

export interface MonthlyTrafficLightData {
  month: string
  red: number
  yellow: number
  green: number
}

export interface BoardExtraStats {
  total: number
  red: number
  yellow: number
  green: number
  undefined: number
  by_month: MonthlyTrafficLightData[]
  follow_up: {
    sin_datos: number
    no_iniciado: number
    en_proceso: number
    completado: number
  }
  concluded: {
    yes: number
    no: number
    undefined: number
  }
}

