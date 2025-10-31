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

    // Obtener conteo de submissions para cada formulario
    const formsWithCount = await Promise.all(
      (forms || []).map(async (form) => {
        const { count: submissionCount } = await supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('form_template_id', form.id)

        return {
          ...form,
          submission_count: submissionCount || 0
        }
      })
    )

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
    const { name, description, section_location, is_public = true } = body

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
    const { data: newForm, error } = await supabase
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

    if (error) {
      console.error('Error de Supabase:', error)
      return NextResponse.json(
        { error: 'Error al crear formulario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      formulario: newForm,
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
