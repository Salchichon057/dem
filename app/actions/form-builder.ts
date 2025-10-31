'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-server'
import { revalidatePath } from 'next/cache'
import type { 
  QuestionType, 
  CreateFormInput
} from '@/lib/types'

export async function getQuestionTypes(): Promise<QuestionType[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('question_types')
      .select('id, code, name, description, validation_schema, created_at')
      .order('name', { ascending: true })

    if (error) throw error

    return data || []
  } catch {
    return []
  }
}

export async function createFormWithSections(
  formData: CreateFormInput, 
  sectionLocation?: string
) {
  try {
    const supabase = await createClient()
    
    // Obtener usuario actual desde JWT de la app (NO Supabase Auth)
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: 'Usuario no autenticado' }
    }

    // Verificar/crear usuario en public.users si no existe
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingUser && !userCheckError) {
      // Obtener rol de editor
      const { data: editorRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'editor')
        .single()

      // Insertar usuario en public.users
      const { error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role_id: editorRole?.id,
          is_active: true
        })

      if (insertUserError) {
        return { 
          success: false, 
          message: `Error: Usuario no existe en la base de datos. Por favor contacta al administrador. (${insertUserError.message})`
        }
      }
    }

    // Validar slug único
    const { data: existingForm } = await supabase
      .from('form_templates')
      .select('id')
      .eq('slug', formData.slug)
      .single()

    if (existingForm) {
      return { success: false, message: 'El slug ya está en uso. Elige uno diferente.' }
    }

    // 1. Crear el formulario CON section_location
    const { data: newForm, error: formError } = await supabase
      .from('form_templates')
      .insert({
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        is_public: formData.is_public,
        section_location: sectionLocation || formData.section_location, // ← NUEVO
        created_by: user.id
      })
      .select('id')
      .single()

    if (formError) throw formError

    // 2. Crear secciones y preguntas
    for (const section of formData.sections) {
      // Crear sección
      const { data: newSection, error: sectionError } = await supabase
        .from('form_sections')
        .insert({
          form_template_id: newForm.id,
          title: section.title,
          description: section.description,
          order_index: section.order_index
        })
        .select('id')
        .single()

      if (sectionError) throw sectionError

      // Crear preguntas de la sección
      if (section.questions.length > 0) {
        const questionsToInsert = section.questions.map(q => ({
          form_template_id: newForm.id,
          section_id: newSection.id,
          question_type_id: q.question_type_id,
          title: q.title,
          help_text: q.help_text,
          is_required: q.is_required,
          order_index: q.order_index,
          config: q.config
        }))

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert)

        if (questionsError) throw questionsError
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/forms')

    return { 
      success: true, 
      message: 'Formulario creado exitosamente',
      formId: newForm.id
    }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al crear el formulario' 
    }
  }
}

export async function validateSlug(slug: string, excludeFormId?: string) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('form_templates')
      .select('id')
      .eq('slug', slug)

    // Excluir el formulario actual al editar
    if (excludeFormId) {
      query = query.neq('id', excludeFormId)
    }

    const { data, error } = await query.single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error
    }

    return { available: !data }
  } catch {
    return { available: false }
  }
}

export async function getFormForEdit(formId: string) {
  try {
    // Server-side: obtener token de cookies
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      console.error('❌ No auth token found')
      return null
    }

    // Usar API REST en lugar de Supabase directo
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/formularios/${formId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error(`❌ Error al obtener formulario: ${response.status} ${response.statusText}`)
      return null
    }

    const form = await response.json()
    
    if (!form) return null

    return {
      ...form,
      sections: form.sections || []
    }
  } catch (error) {
    console.error('❌ Error en getFormForEdit:', error)
    return null
  }
}

export async function updateFormWithSections(
  formId: string, 
  formData: CreateFormInput,
  sectionLocation?: string
) {
  try {
    const supabase = await createClient()
    
    // Obtener usuario actual desde JWT de la app (NO Supabase Auth)
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: 'Usuario no autenticado' }
    }

    // Verificar/crear usuario en public.users si no existe
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingUser && !userCheckError) {
      // Obtener rol de editor
      const { data: editorRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'editor')
        .single()

      // Insertar usuario en public.users
      const { error: insertUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role_id: editorRole?.id,
          is_active: true
        })

      if (insertUserError) {
        return { 
          success: false, 
          message: `Error: Usuario no existe en la base de datos. Por favor contacta al administrador. (${insertUserError.message})`
        }
      }
    }

    // Validar slug único (excluyendo el formulario actual)
    const { data: existingForm } = await supabase
      .from('form_templates')
      .select('id')
      .eq('slug', formData.slug)
      .neq('id', formId)
      .maybeSingle()

    if (existingForm) {
      return { success: false, message: 'El slug ya está en uso. Elige uno diferente.' }
    }

    // 1. Actualizar el formulario CON section_location
    const { error: formError } = await supabase
      .from('form_templates')
      .update({
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        is_public: formData.is_public,
        section_location: sectionLocation || formData.section_location, // ← NUEVO
        updated_at: new Date().toISOString()
      })
      .eq('id', formId)

    if (formError) {
      throw formError
    }

    // 2. Verificar si hay respuestas asociadas ANTES de intentar eliminar
    const { count: submissionsCount, error: countError } = await supabase
      .from('form_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('form_template_id', formId)

    if (countError) {
      throw countError
    }

    if (submissionsCount && submissionsCount > 0) {
      return {
        success: false,
        message: `Este formulario tiene ${submissionsCount} respuesta${submissionsCount > 1 ? 's' : ''} asociada${submissionsCount > 1 ? 's' : ''}.\n\nNo puedes editar un formulario que ya tiene respuestas porque se perderían los datos y afectaría el análisis.\n\n💡 Opciones:\n• Crea un nuevo formulario\n• Duplica este formulario\n• Marca este como inactivo`,
        hasSubmissions: true,
        submissionsCount
      }
    }

    // 3. Eliminar preguntas y secciones existentes (solo si NO hay respuestas)
    const { error: deleteQuestionsError } = await supabase
      .from('questions')
      .delete()
      .eq('form_template_id', formId)

    if (deleteQuestionsError) {
      throw deleteQuestionsError
    }

    const { error: deleteSectionsError } = await supabase
      .from('form_sections')
      .delete()
      .eq('form_template_id', formId)

    if (deleteSectionsError) {
      throw deleteSectionsError
    }

    // 4. Crear nuevas secciones y preguntas
    for (const section of formData.sections) {
      // Crear sección
      const { data: newSection, error: sectionError } = await supabase
        .from('form_sections')
        .insert({
          form_template_id: formId,
          title: section.title,
          description: section.description,
          order_index: section.order_index
        })
        .select('id')
        .single()

      if (sectionError) {
        throw sectionError
      }

      // Crear preguntas de la sección
      if (section.questions.length > 0) {
        const questionsToInsert = section.questions.map(q => ({
          form_template_id: formId,
          section_id: newSection.id,
          question_type_id: q.question_type_id,
          title: q.title,
          help_text: q.help_text,
          is_required: q.is_required,
          order_index: q.order_index,
          config: q.config
        }))

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert)

        if (questionsError) {
          throw questionsError
        }
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/forms')
    revalidatePath(`/forms/${formData.slug}`)

    return { 
      success: true, 
      message: 'Formulario actualizado exitosamente',
      formId
    }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al actualizar el formulario' 
    }
  }
}
