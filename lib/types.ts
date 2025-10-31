export * from './supabase/types'

// Enum para los tipos de sección de formularios
export enum FormSectionType {
  PERFIL_COMUNITARIO = 'perfil-comunitario',
  ORGANIZACIONES = 'organizaciones',
  AUDITORIAS = 'auditorias',
  COMUNIDADES = 'comunidades'
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


