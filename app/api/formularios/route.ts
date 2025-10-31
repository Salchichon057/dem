/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'
import { FormSectionType } from '@/lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Usando anon key

// Validar que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno de Supabase:', {
    supabaseUrl: supabaseUrl ? '✓' : '✗',
    supabaseAnonKey: supabaseAnonKey ? '✓' : '✗'
  })
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
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el parámetro section_location
    const searchParams = req.nextUrl.searchParams
    const sectionLocation = searchParams.get('section_location')

    // Validar que sea un tipo válido si se proporciona
    if (sectionLocation && !Object.values(FormSectionType).includes(sectionLocation as FormSectionType)) {
      return NextResponse.json(
        { error: `Tipo de sección inválido. Debe ser uno de: ${Object.values(FormSectionType).join(', ')}` },
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

    console.log('🔍 Query Supabase:', {
      table: 'form_templates',
      filters: {
        is_active: true,
        is_public: true,
        section_location: sectionLocation || 'all'
      }
    })

    const { data: forms, error } = await query

    if (error) {
      console.error('❌ Error de Supabase al obtener formularios:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        sectionLocation,
        userId: user.id
      })
      
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
        { error: 'Error al obtener formularios', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Formularios obtenidos:', forms?.length || 0)

    // Obtener conteo de submissions para cada formulario usando una query agregada
    // Intentar primero con count directo de form_submissions
    const formIds = (forms || []).map(f => f.id)
    
    let submissionCounts: Record<string, number> = {}
    
    if (formIds.length > 0) {
      try {
        // Intentar obtener el conteo directamente desde form_submissions
        // Esto puede fallar si RLS no permite acceso
        const { data: submissions, error: subError } = await supabase
          .from('form_submissions')
          .select('form_template_id')
          .in('form_template_id', formIds)

        if (subError) {
          console.warn('⚠️ No se puede acceder a form_submissions con anon key:', subError.message)
          console.log('💡 Tip: Necesitas crear una política RLS en form_submissions que permita contar (SELECT) para anon role')
        } else if (submissions) {
          // Contar manualmente los submissions por form_template_id
          submissionCounts = submissions.reduce((acc, sub) => {
            acc[sub.form_template_id] = (acc[sub.form_template_id] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          console.log('📊 Conteo de submissions por formulario:', submissionCounts)
        }
      } catch (err) {
        console.error('❌ Error al obtener submissions:', err)
      }
    }

    const formsWithCount = (forms || []).map(form => ({
      ...form,
      submission_count: submissionCounts[form.id] || 0
    }))

    console.log('✅ Formularios con conteo:', formsWithCount.map(f => ({ 
      name: f.name, 
      count: f.submission_count 
    })))

    return NextResponse.json({ 
      forms: formsWithCount,
      total: formsWithCount.length 
    })

  } catch (error) {
    console.error('Error al obtener formularios:', error)
    return NextResponse.json(
      { error: 'Error al obtener formularios' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, description, section_location, is_public = true, sections = [] } = body

    // DEBUG: Imprimir datos recibidos
    console.log('📥 POST /api/formularios - Datos recibidos:')
    console.log('- name:', name)
    console.log('- description:', description)
    console.log('- section_location:', section_location)
    console.log('- is_public:', is_public)
    console.log('- sections:', JSON.stringify(sections, null, 2))
    console.log('- user.id:', user.id)

    // TEMPORAL: Usar UUID fijo porque el auth está generando CUIDs
    const userId = '4157e293-5629-4369-bcdb-5a0197596e3c'

    // Validar campos requeridos
    if (!name || !section_location) {
      return NextResponse.json(
        { error: 'Nombre y section_location son requeridos' },
        { status: 400 }
      )
    }

    // Validar que sea un tipo válido
    if (!Object.values(FormSectionType).includes(section_location as FormSectionType)) {
      return NextResponse.json(
        { error: `Tipo de sección inválido. Debe ser uno de: ${Object.values(FormSectionType).join(', ')}` },
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
        created_by: userId, // Usar userId hardcodeado
        version: 1,
        is_active: true
      })
      .select()
      .single()

    if (formError) {
      console.error('Error de Supabase al crear formulario:', formError)
      return NextResponse.json(
        { error: 'Error al crear formulario', details: formError.message },
        { status: 500 }
      )
    }

    console.log('✅ Formulario creado:', newForm.id, newForm.name)

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
          console.error('Error al crear sección:', sectionError)
          // Intentar eliminar el formulario si falló la creación de secciones
          await supabase.from('form_templates').delete().eq('id', newForm.id)
          return NextResponse.json(
            { error: 'Error al crear secciones del formulario', details: sectionError.message },
            { status: 500 }
          )
        }

        console.log('✅ Sección creada:', newSection.id, newSection.title)

        // Crear preguntas de la sección
        if (section.questions && section.questions.length > 0) {
          const questionsToInsert = section.questions.map((q: any) => ({
            form_template_id: newForm.id,
            section_id: newSection.id,
            question_type_id: q.question_type_id,
            title: q.title,
            help_text: q.help_text || null,
            is_required: q.is_required || false,
            order_index: q.order_index,
            config: q.config || {}
          }))

          const { error: questionsError } = await supabase
            .from('questions')
            .insert(questionsToInsert)

          if (questionsError) {
            console.error('Error al crear preguntas:', questionsError)
            // Intentar eliminar el formulario si falló la creación de preguntas
            await supabase.from('form_templates').delete().eq('id', newForm.id)
            return NextResponse.json(
              { error: 'Error al crear preguntas del formulario', details: questionsError.message },
              { status: 500 }
            )
          }

          console.log(`✅ ${questionsToInsert.length} preguntas creadas para sección ${newSection.title}`)
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      data: newForm,
      message: 'Formulario creado exitosamente' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear formulario:', error)
    return NextResponse.json(
      { error: 'Error al crear formulario' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

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
    if (section_location && !Object.values(FormSectionType).includes(section_location as FormSectionType)) {
      return NextResponse.json(
        { error: `Tipo de sección inválido. Debe ser uno de: ${Object.values(FormSectionType).join(', ')}` },
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
      console.error('Error de Supabase:', error)
      return NextResponse.json(
        { error: 'Error al actualizar formulario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      formulario: updatedForm,
      message: 'Formulario actualizado exitosamente' 
    })

  } catch (error) {
    console.error('Error al actualizar formulario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar formulario' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

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
      console.error('Error de Supabase:', error)
      return NextResponse.json(
        { error: 'Error al eliminar formulario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Formulario eliminado exitosamente' 
    })

  } catch (error) {
    console.error('Error al eliminar formulario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar formulario' },
      { status: 500 }
    )
  }
}
