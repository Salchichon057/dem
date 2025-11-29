/**
 * Community Profile Link
 * Links between communities table and Community Profile section
 */
export interface CommunityProfileLink {
  id: string
  community_id: string
  added_by: string | null
  added_at: string
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Input for creating a new community profile link
 */
export interface CreateCommunityProfileLinkInput {
  community_id: string
  notes?: string
}

/**
 * Input for updating a community profile link
 */
export interface UpdateCommunityProfileLinkInput {
  is_active?: boolean
  notes?: string
}

/**
 * Community with profile link status
 * Extends Community with information about whether it's linked to Community Profile
 */
export interface CommunityWithProfileLink {
  id: string
  villages: string | null
  department: string
  municipality: string
  status: 'activa' | 'inactiva' | 'suspendida'
  leader_name: string | null
  leader_phone: string | null
  total_families: number | null
  is_linked: boolean // Whether this community is in Community Profile
  link_id: string | null // ID of the community_profile_link record if linked
  linked_at: string | null // When it was added to Community Profile
}
