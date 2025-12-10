import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('vw_communities_statistics')
      .select('*')
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({
        error: 'No data found'
      }, { status: 404 })
    }

    return NextResponse.json({
      totalCommunities: Math.round(data.total_communities || 0),
      activeCommunities: Math.round(data.active_count || 0),
      inactiveCommunities: Math.round(data.inactive_count || 0),
      suspendedCommunities: Math.round(data.suspended_count || 0),
      totalBeneficiaries: Math.round(data.total_beneficiaries || 0),
      byAgeGender: [
        { age: '0-2', mujeres: Math.round(data.female_0_2 || 0), hombres: Math.round(data.male_0_2 || 0) },
        { age: '3-5', mujeres: Math.round(data.female_3_5 || 0), hombres: Math.round(data.male_3_5 || 0) },
        { age: '6-10', mujeres: Math.round(data.female_6_10 || 0), hombres: Math.round(data.male_6_10 || 0) },
        { age: '11-18', mujeres: Math.round(data.female_11_18 || 0), hombres: Math.round(data.male_11_18 || 0) },
        { age: '19-60', mujeres: Math.round(data.female_19_60 || 0), hombres: Math.round(data.male_19_60 || 0) },
        { age: '60+', mujeres: Math.round(data.female_60_plus || 0), hombres: Math.round(data.male_60_plus || 0) }
      ],
      totalFamilies: Math.round(data.total_families || 0),
      familiesInRa: Math.round(data.families_in_ra || 0),
      pregnant: Math.round(data.pregnant_women || 0),
      lactating: Math.round(data.lactating_women || 0)
    })

  } catch (error) {
    console.error('Error fetching communities statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
