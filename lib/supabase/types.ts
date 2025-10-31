/* eslint-disable @typescript-eslint/no-explicit-any */
export type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  role_id: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type QuestionType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  validation_schema: Record<string, any> | null;
  created_at: string;
};

export type FormTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  section_location: string | null; // Nueva columna: indica dónde se muestra en el sidebar
  version: number;
  is_active: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type FormSection = {
  id: string;
  form_template_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
};

export type Question = {
  id: string;
  form_template_id: string;
  section_id: string | null;
  question_type_id: string;
  title: string;
  help_text: string | null;
  is_required: boolean;
  order_index: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type FormAssignment = {
  id: string;
  form_template_id: string;
  user_id: string;
  can_edit: boolean;
  can_view_responses: boolean;
  notify_on_submission: boolean;
  assigned_by: string | null;
  assigned_at: string;
};

export type FormSubmission = {
  id: string;
  form_template_id: string;
  user_id: string | null;
  status: 'draft' | 'completed' | 'archived';
  ip_address: string | null;
  user_agent: string | null;
  time_spent_seconds: number | null;
  submitted_at: string;
  updated_at: string;
};

export type SubmissionAnswer = {
  id: string;
  submission_id: string;
  question_id: string;
  answer_value: Record<string, any>;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  entity_type: 'form_templates' | 'questions' | 'form_submissions' | 'submission_answers' | 'users' | 'roles' | 'form_assignments' | 'form_locations';
  entity_id: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  changes: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
};

// ============================================
// TIPOS EXTENDIDOS - Con relaciones (joins)
// ============================================

export type FormTemplateWithRelations = FormTemplate & {
  creator?: User;
  sections?: FormSection[];
  questions?: QuestionWithRelations[];
  _count?: {
    sections: number;
    questions: number;
    submissions: number;
  };
};

export type QuestionWithRelations = Question & {
  type?: QuestionType;
  section?: FormSection | null;
};

export type FormAssignmentWithUser = FormAssignment & {
  user?: User;
  assigner?: User | null;
};

export type FormSubmissionWithRelations = FormSubmission & {
  form_template?: FormTemplate;
  user?: User | null;
  answers?: SubmissionAnswerWithQuestion[];
};

export type SubmissionAnswerWithQuestion = SubmissionAnswer & {
  question?: Question;
};

// ============================================
// TIPOS PARA REQUESTS/RESPONSES DE API
// ============================================

export type CreateFormTemplateInput = {
  slug: string;
  name: string;
  description?: string | null;
  section_location?: string | null; // Ubicación en el sidebar
  is_public?: boolean;
};

export type UpdateFormTemplateInput = Partial<CreateFormTemplateInput> & {
  id: string;
};

export type CreateQuestionInput = {
  form_template_id: string;
  section_id?: string | null;
  question_type_id: string;
  title: string;
  help_text?: string | null;
  is_required?: boolean;
  order_index: number;
  config?: Record<string, any>;
};

export type UpdateQuestionInput = Partial<CreateQuestionInput> & {
  id: string;
};

export type CreateFormSectionInput = {
  form_template_id: string;
  title: string;
  description?: string | null;
  order_index: number;
};

export type UpdateFormSectionInput = Partial<CreateFormSectionInput> & {
  id: string;
};

export type SubmitFormInput = {
  form_template_id: string;
  answers: {
    question_id: string;
    answer_value: Record<string, any>;
  }[];
  status?: 'draft' | 'completed';
};

// ============================================
// TIPOS PARA FILTROS Y BÚSQUEDAS
// ============================================

export type FormTemplateFilters = {
  section_location?: string | null;
  is_active?: boolean;
  is_public?: boolean;
  created_by?: string;
  search?: string; // Búsqueda por nombre o descripción
};

export type FormSubmissionFilters = {
  form_template_id?: string;
  user_id?: string;
  status?: 'draft' | 'completed' | 'archived';
  date_from?: string;
  date_to?: string;
};

// ============================================
// TIPOS PARA PERMISOS
// ============================================

export type FormPermissions = {
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_view_responses: boolean;
  can_export: boolean;
  can_assign: boolean;
};

export type RolePermissions = {
  forms?: FormPermissions;
  users?: {
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_view: boolean;
  };
  // Agregar más permisos según sea necesario
};
