/**
 * SERVICIO SIMPLIFICADO DE API PARA FORMULARIOS
 * Métodos para interactuar con Supabase para operaciones CRUD de formularios
 */

import { createClient } from './server';
import type {
  FormTemplate,
  FormTemplateWithRelations,
  FormTemplateFilters,
  CreateFormTemplateInput,
  UpdateFormTemplateInput,
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
  FormSection,
  CreateFormSectionInput,
  UpdateFormSectionInput,
  FormSubmission,
  FormSubmissionWithRelations,
  SubmitFormInput,
  FormSubmissionFilters,
} from './types';

// ============================================
// FORM TEMPLATES (Plantillas de Formularios)
// ============================================

/**
 * Obtener todos los formularios con filtros opcionales
 */
export async function getFormTemplates(
  filters?: FormTemplateFilters
): Promise<FormTemplateWithRelations[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('form_templates')
    .select('*')
    .order('created_at', { ascending: false });

  // Aplicar filtros
  if (filters?.section_location) {
    query = query.eq('section_location', filters.section_location);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }
  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public);
  }
  if (filters?.created_by) {
    query = query.eq('created_by', filters.created_by);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Obtener un formulario por ID con todas sus relaciones
 */
export async function getFormTemplateById(id: string): Promise<FormTemplateWithRelations | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('form_templates')
    .select(`
      *,
      sections:form_sections(*),
      questions:questions(
        *,
        type:question_types(*),
        section:form_sections(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Ordenar secciones y preguntas
  if (data.sections) {
    data.sections.sort((a: FormSection, b: FormSection) => a.order_index - b.order_index);
  }
  if (data.questions) {
    data.questions.sort((a: Question, b: Question) => a.order_index - b.order_index);
  }

  return data;
}

/**
 * Obtener un formulario por slug
 */
export async function getFormTemplateBySlug(slug: string): Promise<FormTemplateWithRelations | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('form_templates')
    .select(`
      *,
      sections:form_sections(*),
      questions:questions(
        *,
        type:question_types(*),
        section:form_sections(*)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Ordenar secciones y preguntas
  if (data.sections) {
    data.sections.sort((a: FormSection, b: FormSection) => a.order_index - b.order_index);
  }
  if (data.questions) {
    data.questions.sort((a: Question, b: Question) => a.order_index - b.order_index);
  }

  return data;
}

/**
 * Crear un nuevo formulario
 */
export async function createFormTemplate(
  input: CreateFormTemplateInput,
  userId: string
): Promise<FormTemplate> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('form_templates')
    .insert({
      ...input,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar un formulario
 */
export async function updateFormTemplate(
  input: UpdateFormTemplateInput
): Promise<FormTemplate> {
  const supabase = await createClient();
  
  const { id, ...updateData } = input;
  
  const { data, error } = await supabase
    .from('form_templates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar un formulario
 */
export async function deleteFormTemplate(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('form_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Duplicar un formulario
 */
export async function duplicateFormTemplate(
  id: string,
  newName: string,
  newSlug: string,
  userId: string
): Promise<FormTemplate> {
  // Obtener el formulario original con todas sus relaciones
  const original = await getFormTemplateById(id);
  if (!original) throw new Error('Formulario no encontrado');

  // Crear el nuevo formulario
  const newForm = await createFormTemplate({
    slug: newSlug,
    name: newName,
    description: original.description,
    section_location: original.section_location,
    is_public: original.is_public,
  }, userId);

  // Copiar secciones
  if (original.sections && original.sections.length > 0) {
    const supabase = await createClient();
    
    const sectionsToInsert = original.sections.map((section: FormSection) => ({
      form_template_id: newForm.id,
      title: section.title,
      description: section.description,
      order_index: section.order_index,
    }));

    const { data: newSections, error: sectionsError } = await supabase
      .from('form_sections')
      .insert(sectionsToInsert)
      .select();

    if (sectionsError) throw sectionsError;

    // Copiar preguntas
    if (original.questions && original.questions.length > 0) {
      // Crear mapa de IDs antiguos a nuevos para las secciones
      const sectionIdMap = new Map<string, string>();
      original.sections.forEach((oldSection: FormSection, index: number) => {
        if (newSections[index]) {
          sectionIdMap.set(oldSection.id, newSections[index].id);
        }
      });

      const questionsToInsert = original.questions.map((question: Question) => ({
        form_template_id: newForm.id,
        section_id: question.section_id ? sectionIdMap.get(question.section_id) || null : null,
        question_type_id: question.question_type_id,
        title: question.title,
        help_text: question.help_text,
        is_required: question.is_required,
        order_index: question.order_index,
        config: question.config,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;
    }
  }

  return newForm;
}

// ============================================
// FORM SECTIONS (Secciones de Formularios)
// ============================================

/**
 * Crear una nueva sección
 */
export async function createFormSection(input: CreateFormSectionInput): Promise<FormSection> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('form_sections')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar una sección
 */
export async function updateFormSection(input: UpdateFormSectionInput): Promise<FormSection> {
  const supabase = await createClient();
  
  const { id, ...updateData } = input;
  
  const { data, error } = await supabase
    .from('form_sections')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar una sección
 */
export async function deleteFormSection(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('form_sections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// QUESTIONS (Preguntas)
// ============================================

/**
 * Crear una nueva pregunta
 */
export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('questions')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar una pregunta
 */
export async function updateQuestion(input: UpdateQuestionInput): Promise<Question> {
  const supabase = await createClient();
  
  const { id, ...updateData } = input;
  
  const { data, error } = await supabase
    .from('questions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar una pregunta
 */
export async function deleteQuestion(id: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Obtener tipos de preguntas disponibles
 */
export async function getQuestionTypes() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('question_types')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

// ============================================
// FORM SUBMISSIONS (Envíos de Formularios)
// ============================================

/**
 * Enviar un formulario
 */
export async function submitForm(
  input: SubmitFormInput,
  userId?: string
): Promise<FormSubmission> {
  const supabase = await createClient();
  
  // Crear la submission
  const { data: submission, error: submissionError } = await supabase
    .from('form_submissions')
    .insert({
      form_template_id: input.form_template_id,
      user_id: userId || null,
      status: input.status || 'completed',
    })
    .select()
    .single();

  if (submissionError) throw submissionError;

  // Insertar las respuestas
  const answersToInsert = input.answers.map(answer => ({
    submission_id: submission.id,
    question_id: answer.question_id,
    answer_value: answer.answer_value,
  }));

  const { error: answersError } = await supabase
    .from('submission_answers')
    .insert(answersToInsert);

  if (answersError) throw answersError;

  return submission;
}

/**
 * Obtener submissions con filtros
 */
export async function getFormSubmissions(
  filters?: FormSubmissionFilters
): Promise<FormSubmissionWithRelations[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('form_submissions')
    .select(`
      *,
      form_template:form_templates(*),
      user:users(*),
      answers:submission_answers(
        *,
        question:questions(*)
      )
    `)
    .order('submitted_at', { ascending: false });

  if (filters?.form_template_id) {
    query = query.eq('form_template_id', filters.form_template_id);
  }
  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.date_from) {
    query = query.gte('submitted_at', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('submitted_at', filters.date_to);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Obtener una submission por ID
 */
export async function getFormSubmissionById(id: string): Promise<FormSubmissionWithRelations | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('form_submissions')
    .select(`
      *,
      form_template:form_templates(*),
      user:users(*),
      answers:submission_answers(
        *,
        question:questions(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

/**
 * Exportar submissions a CSV
 */
export async function exportFormSubmissionsToCSV(formTemplateId: string): Promise<string> {
  const submissions = await getFormSubmissions({ form_template_id: formTemplateId });
  
  if (submissions.length === 0) {
    return '';
  }

  // Obtener todas las preguntas únicas
  const questions = new Map<string, string>();
  submissions.forEach(sub => {
    sub.answers?.forEach(answer => {
      if (answer.question) {
        questions.set(answer.question.id, answer.question.title);
      }
    });
  });

  // Crear encabezados CSV
  const headers = ['ID', 'Usuario', 'Fecha', 'Estado', ...Array.from(questions.values())];
  const csvLines = [headers.join(',')];

  // Crear filas
  submissions.forEach(sub => {
    const row = [
      sub.id,
      sub.user?.name || sub.user?.email || 'Anónimo',
      new Date(sub.submitted_at).toLocaleString(),
      sub.status,
    ];

    // Agregar respuestas en el orden de las preguntas
    Array.from(questions.keys()).forEach(questionId => {
      const answer = sub.answers?.find(a => a.question_id === questionId);
      const value = answer ? JSON.stringify(answer.answer_value) : '';
      row.push(`"${value.replace(/"/g, '""')}"`);
    });

    csvLines.push(row.join(','));
  });

  return csvLines.join('\n');
}
