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
      case 'f036d9ff-e51a-46ca-8744-6f8187966f5b':
        viewName = 'vw_form_f036d9ff_statistics'
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

    // Transform data for organizations forms
    if (formId === '0c1b6e6d-26aa-4d68-8a09-10855af22b77' || formId === '00e49c23-1f8a-45e0-947e-2c9bcdca0898') {
      const transformed = {
        totalOrganizations: data.total_organizations || 0,
        withLegal: data.with_legal_representation || 0,
        withoutLegal: data.without_legal_representation || 0,
        totalBeneficiaries: data.total_beneficiaries || 0,
        totalFamilies: data.total_families || 0,
        pregnant: data.pregnant_women || 0,
        lactating: data.lactating_women || 0,
        byAgeGender: [
          { age: '0-2', mujeres: Math.round(data.female_0_2 || 0), hombres: Math.round(data.male_0_2 || 0) },
          { age: '3-5', mujeres: Math.round(data.female_3_5 || 0), hombres: Math.round(data.male_3_5 || 0) },
          { age: '6-10', mujeres: Math.round(data.female_6_10 || 0), hombres: Math.round(data.male_6_10 || 0) },
          { age: '11-18', mujeres: Math.round(data.female_11_18 || 0), hombres: Math.round(data.male_11_18 || 0) },
          { age: '19-60', mujeres: Math.round(data.female_19_60 || 0), hombres: Math.round(data.male_19_60 || 0) },
          { age: '60+', mujeres: Math.round(data.female_60_plus || 0), hombres: Math.round(data.male_60_plus || 0) }
        ]
      }
      return NextResponse.json(transformed)
    }

    // Transform data for volunteer form
    if (formId === 'f036d9ff-e51a-46ca-8744-6f8187966f5b') {
      const byTypeObj = data.by_type || {}
      const byShiftObj = data.by_shift || {}
      
      const transformed = {
        totalVolunteers: data.total_volunteers || 0,
        byType: Object.entries(byTypeObj).map(([type, count]) => ({
          type,
          count: Number(count)
        })),
        byShift: Object.entries(byShiftObj).map(([shift, count]) => ({
          shift,
          count: Number(count)
        })),
        averageHours: Number(data.average_hours || 0),
        volunteersWithBenefit: data.volunteers_with_benefit || 0,
        totalAgriculturalPounds: Number(data.total_agricultural_pounds || 0),
        totalViveresBags: Number(data.total_viveres_bags || 0),
        totalAmountQ: Number(data.total_amount_q || 0)
      }
      return NextResponse.json(transformed)
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
