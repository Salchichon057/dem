import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 300

interface Params {
  params: Promise<{
    formId: string
  }>
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { formId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let viewName: string

    switch (formId) {
      case '0c1b6e6d-26aa-4d68-8a09-10855af22b77':
        viewName = 'vw_form_0c1b6e6d_statistics'
        break
      case '00e49c23-1f8a-45e0-947e-2c9bcdca0898':
        viewName = 'vw_form_00e49c23_statistics'
        break
      default:
        return NextResponse.json({
          error: 'Statistics view not configured for this form',
          message: 'Please create a statistics view for this form template'
        }, { status: 404 })
    }

    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({
        error: 'No data found'
      }, { status: 404 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching form statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
