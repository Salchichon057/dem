import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withAuth } from '@/lib/auth-server'

/**
 * GET /api/community-profile-links
 * Get all community profile links (communities linked to Community Profile)
 * Query params:
 * - active_only: boolean - Only return active links (default: true)
 * - include_community: boolean - Include full community data (default: true)
 */
export async function GET(request: Request) {
    const auth = await withAuth()
    if (auth.error) return auth.error

    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        const activeOnly = searchParams.get('active_only') !== 'false'
        const includeCommunity = searchParams.get('include_community') !== 'false'

        let query = supabase
            .from('community_profile_links')
            .select(includeCommunity
                ? `
          *,
          communities:community_id (
            id,
            registration_date,
            department,
            municipality,
            villages,
            hamlets_served,
            hamlets_count,
            google_maps_url,
            leader_name,
            leader_phone,
            is_in_leaders_group,
            community_committee,
            status,
            inactive_reason,
            total_families,
            families_in_ra,
            early_childhood_women,
            early_childhood_men,
            childhood_3_5_women,
            childhood_3_5_men,
            youth_6_10_women,
            youth_6_10_men,
            adults_11_18_women,
            adults_11_18_men,
            adults_19_60_women,
            adults_19_60_men,
            seniors_61_plus_women,
            seniors_61_plus_men,
            pregnant_women,
            lactating_women,
            placement_type,
            has_whatsapp_group,
            termination_date,
            termination_reason,
            classification,
            storage_capacity,
            placement_methods,
            photo_reference_url,
            created_at,
            updated_at
          )
        `
                : '*'
            )
            .order('added_at', { ascending: false })

        if (activeOnly) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching community profile links:', error)
            return NextResponse.json(
                { error: 'Error al cargar vínculos de perfil comunitario', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            links: data || [],
            total: data?.length || 0
        })

    } catch (error) {
        console.error('Unexpected error in GET /api/community-profile-links:', error)
        return NextResponse.json(
            { error: 'Error inesperado al cargar vínculos' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/community-profile-links
 * Link communities to Community Profile
 * Body: { community_ids: string[], notes?: string }
 */
export async function POST(request: Request) {
    const auth = await withAuth()
    if (auth.error) return auth.error

    try {
        const supabase = await createClient()
        const body = await request.json()

        const { community_ids, notes } = body

        if (!community_ids || !Array.isArray(community_ids) || community_ids.length === 0) {
            return NextResponse.json(
                { error: 'Se requiere al menos un community_id' },
                { status: 400 }
            )
        }

        // Verificar que las comunidades existen
        const { data: existingCommunities, error: communitiesError } = await supabase
            .from('communities')
            .select('id')
            .in('id', community_ids)

        if (communitiesError) {
            console.error('Error checking communities:', communitiesError)
            return NextResponse.json(
                { error: 'Error al verificar comunidades' },
                { status: 500 }
            )
        }

        if (existingCommunities.length !== community_ids.length) {
            return NextResponse.json(
                { error: 'Algunas comunidades no existen' },
                { status: 400 }
            )
        }

        // Verificar si ya existen vínculos para evitar duplicados
        const { data: existingLinks } = await supabase
            .from('community_profile_links')
            .select('community_id, is_active')
            .in('community_id', community_ids)

        const existingLinkIds = new Set(existingLinks?.map(l => l.community_id) || [])
        const newCommunityIds = community_ids.filter(id => !existingLinkIds.has(id))

        // Reactivar vínculos existentes inactivos
        const inactiveLinks = existingLinks?.filter(l => !l.is_active).map(l => l.community_id) || []
        if (inactiveLinks.length > 0) {
            const { error: reactivateError } = await supabase
                .from('community_profile_links')
                .update({
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .in('community_id', inactiveLinks)

            if (reactivateError) {
                console.error('Error reactivating links:', reactivateError)
            }
        }

        // Crear nuevos vínculos
        if (newCommunityIds.length > 0) {
            const linksToInsert = newCommunityIds.map(community_id => ({
                community_id,
                added_by: auth.user!.id,
                notes: notes || null,
                is_active: true
            }))

            const { error: insertError } = await supabase
                .from('community_profile_links')
                .insert(linksToInsert)

            if (insertError) {
                console.error('Error creating community profile links:', insertError)
                return NextResponse.json(
                    { error: 'Error al crear vínculos', details: insertError.message },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json({
            success: true,
            message: `${community_ids.length} comunidad(es) vinculada(s) exitosamente`,
            linked: community_ids.length,
            new: newCommunityIds.length,
            reactivated: inactiveLinks.length
        })

    } catch (error) {
        console.error('Unexpected error in POST /api/community-profile-links:', error)
        return NextResponse.json(
            { error: 'Error inesperado al crear vínculos' },
            { status: 500 }
        )
    }
}
