/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'
// import { FormSectionType } from '@/lib/types' // Temporalmente comentado para debug

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Usando anon key

// Validar que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
}

// Crear cliente con anon key (respeta RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const { error: authError } = await withAuth()
    if (authError) return authError

    // Obtener el parámetro section_location o section
    const searchParams = req.nextUrl.searchParams
    const sectionLocation = searchParams.get('section_location') || searchParams.get('section')

    // Validar que sea un tipo válido si se proporciona
    const validSections = ['perfil-comunitario', 'organizaciones', 'auditorias', 'comunidades', 'voluntariado', 'abrazando-leyendas']
    if (sectionLocation && !validSections.includes(sectionLocation)) {
      return NextResponse.json(
        { error: `Tipo de sección inválido. Debe ser uno de: ${validSections.join(', ')}` },
        { status: 400 }
      )
    }

    // Construir query: solo formularios activos (soft delete)
    // IMPORTANTE: La política RLS "Allow all access to form_templates" permite acceso público
    // pero la política "anon_read_public_form_templates" requiere is_public = true
    let query = supabase
      .from('form_templates')
      .select(`
        id,
        name,
        description,
        slug,
        section_location,
        is_active,
        is_public,
        created_at,
        updated_at,
        version
      `)
      .eq('is_active', true) // Solo formularios activos
      .eq('is_public', true) // Solo formularios públicos (requerido por RLS anon)
      .order('created_at', { ascending: false })

    if (sectionLocation) {
      query = query.eq('section_location', sectionLocation)
    }
    const { data: forms, error } = await query

    if (error) {
      // Si es error de permisos, dar más información
      if (error.code === '42501') {
        return NextResponse.json(
          { 
            error: 'Error de permisos en Supabase',
            details: 'Verifica que los formularios tengan is_public = true en la base de datos',
            supabaseError: error.message
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error al obtener formularios' },
        { status: 500 }
      )
    }
    // Obtener conteo de submissions para cada formulario usando el helper
    // const formIds = (forms || []).map(f => f.id)
    
    const submissionCounts: Record<string, number> = {}
    
    // Temporalmente deshabilitado para debug
    /* 
    if (formIds.length > 0) {
      try {
        // Usar el helper que distribuye las queries según section_location
        const { getAllSubmissionsCounts } = await import('@/lib/supabase/submissions')
        submissionCounts = await getAllSubmissionsCounts(formIds)
      } catch {
      }
    }
    */

    const formsWithCount = (forms || []).map(form => ({
      ...form,
      submission_count: submissionCounts[form.id] || 0
    }))

    return NextResponse.json({ 
      forms: formsWithCount,
      total: formsWithCount.length 
    })

  } catch {
    return NextResponse.json(
      { error: 'Error al obtener formularios' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const { user, error: authError } = await withAuth()
    if (authError) return authError

    const body = await req.json()
    const { name, description, section_location, is_public = true, sections = [] } = body

    // Validar campos requeridos
    if (!name || !section_location) {
      return NextResponse.json(
        { error: 'Nombre y section_location son requeridos' },
        { status: 400 }
      )
    }

    // Validar que sea un tipo válido
    if (!['perfil-comunitario', 'organizaciones', 'auditorias', 'comunidades', 'voluntariado', 'abrazando-leyendas'].includes(section_location)) {
      return NextResponse.json(
        { error: `Tipo de sección inválido. Debe ser uno de: ${['perfil-comunitario', 'organizaciones', 'auditorias', 'comunidades', 'voluntariado', 'abrazando-leyendas'].join(', ')}` },
        { status: 400 }
      )
    }

    // Generar slug desde el nombre
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      + '-' + Date.now() // Agregar timestamp para unicidad

    // Crear formulario
    const { data: newForm, error: formError } = await supabase
      .from('form_templates')
      .insert({
        name,
        slug,
        description: description || null,
        section_location,
        is_public,
        created_by: user.id,
        version: 1,
        is_active: true
      })
      .select()
      .single()

    if (formError) {
      return NextResponse.json(
        { error: 'Error al crear formulario', details: formError.message },
        { status: 500 }
      )
    }
    // Crear secciones y preguntas si se proporcionaron
    if (sections && sections.length > 0) {
      for (const section of sections) {
        // Crear sección
        const { data: newSection, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_template_id: newForm.id,
            title: section.title,
            description: section.description || null,
            order_index: section.order_index
          })
          .select()
          .single()

        if (sectionError) {
          // Intentar eliminar el formulario si falló la creación de secciones
          await supabase.from('form_templates').delete().eq('id', newForm.id)
          return NextResponse.json(
            { error: 'Error al crear secciones del formulario', details: sectionError.message },
            { status: 500 }
          )
        }
        // Crear preguntas de la sección
        if (section.questions && section.questions.length > 0) {
          const questionsToInsert = section.questions.map((q: any) => {
            return {
              form_template_id: newForm.id,
              section_id: newSection.id,
              question_type_id: q.question_type_id,
              title: q.title,
              help_text: q.help_text || null,
              is_required: q.is_required || false,
              order_index: q.order_index,
              config: q.config || {}
            }
          })

          const { error: questionsError } = await supabase
            .from('questions')
            .insert(questionsToInsert)

          if (questionsError) {
            // Intentar eliminar el formulario si falló la creación de preguntas
            await supabase.from('form_templates').delete().eq('id', newForm.id)
            return NextResponse.json(
              { error: 'Error al crear preguntas del formulario', details: questionsError.message },
              { status: 500 }
            )
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      data: newForm,
      message: 'Formulario creado exitosamente' 
    }, { status: 201 })

  } catch {
    return NextResponse.json(
      { error: 'Error al crear formulario' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verificar autenticación
    const { error: authError } = await withAuth()
    if (authError) return authError

    const body = await req.json()
    const { id, name, description, section_location, is_public, is_active } = body

    // Validar campos requeridos
    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Validar tipo de sección si se proporciona
    if (section_location && !['perfil-comunitario', 'organizaciones', 'auditorias', 'comunidades', 'voluntariado', 'abrazando-leyendas'].includes(section_location)) {
      return NextResponse.json(
        { error: `Tipo de sección inválido. Debe ser uno de: ${['perfil-comunitario', 'organizaciones', 'auditorias', 'comunidades', 'voluntariado', 'abrazando-leyendas'].join(', ')}` },
        { status: 400 }
      )
    }

    // Construir objeto de actualización solo con campos proporcionados
    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (section_location !== undefined) updates.section_location = section_location
    if (is_public !== undefined) updates.is_public = is_public
    if (is_active !== undefined) updates.is_active = is_active

    // Actualizar formulario
    const { data: updatedForm, error } = await supabase
      .from('form_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar formulario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      formulario: updatedForm,
      message: 'Formulario actualizado exitosamente' 
    })

  } catch {
    return NextResponse.json(
      { error: 'Error al actualizar formulario' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verificar autenticación
    const { error: authError } = await withAuth()
    if (authError) return authError

    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')

    // Validar campos requeridos
    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      )
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    const { error } = await supabase
      .from('form_templates')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Error al eliminar formulario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Formulario eliminado exitosamente' 
    })

  } catch {
    return NextResponse.json(
      { error: 'Error al eliminar formulario' },
      { status: 500 }
    )
  }
}




