export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';

// Utilidades
export { hasSupabaseEnvVars } from './utils';

// Tipos principales
export type {
  Role,
  User,
  QuestionType,
  FormTemplate,
  FormSection,
  Question,
  FormAssignment,
  FormSubmission,
  SubmissionAnswer,
  AuditLog,
  FormTemplateWithRelations,
  FormAssignmentWithUser,
  FormSubmissionWithRelations,
  SubmissionAnswerWithQuestion,
  CreateFormTemplateInput,
  UpdateFormTemplateInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateFormSectionInput,
  UpdateFormSectionInput,
  SubmitFormInput,
  FormTemplateFilters,
  FormSubmissionFilters,
  FormPermissions,
  RolePermissions,
} from './types';

// Funciones de API
export {
  // Form Templates
  getFormTemplates,
  getFormTemplateById,
  getFormTemplateBySlug,
  createFormTemplate,
  updateFormTemplate,
  deleteFormTemplate,
  duplicateFormTemplate,
  
  // Form Sections
  createFormSection,
  updateFormSection,
  deleteFormSection,
  
  // Questions
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionTypes,
  
  // Form Submissions
  submitForm,
  getFormSubmissions,
  getFormSubmissionById,
  exportFormSubmissionsToCSV,
} from './forms';

