import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-server'

const SECTION_TO_TABLE: Record<string, string> = {
  'organizaciones': 'organizations_submissions',
  'auditorias': 'audits_submissions',
  'comunidades': 'communities_submissions',
  'voluntariado': 'volunteer_submissions',
  'perfil-comunitario': 'community_profile_submissions',
  'abrazando-leyendas': 'embracing_legends_submissions'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { supabase, error: authError } = await withAuth()
    if (authError) return authError

    const { formId } = await params

    const { data: formTemplate, error: formError } = await supabase
      .from('form_templates')
      .select('section_location')
      .eq('id', formId)
      .single()

    if (formError || !formTemplate) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const submissionsTable = SECTION_TO_TABLE[formTemplate.section_location]
    if (!submissionsTable) {
      return NextResponse.json({ error: 'Tabla no encontrada' }, { status: 400 })
    }

    const { count, error: countError } = await supabase
      .from(submissionsTable)
      .select('*', { count: 'exact', head: true })
      .eq('form_template_id', formId)

    if (countError) {
      return NextResponse.json({ error: 'Error al contar registros' }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Error en GET /api/submissions/[formId]/count:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
