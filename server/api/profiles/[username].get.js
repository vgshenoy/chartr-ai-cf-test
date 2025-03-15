import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username is required',
    })
  }

  const supabase = await serverSupabaseClient(event)

  // Get profile by username
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, website, updated_at')
    .eq('username', username)
    .single()

  if (error || !profile) {
    console.error('Error fetching profile:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found',
    })
  }

  // Transform profile data to match frontend expectations
  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    website: profile.website,
    updatedAt: profile.updated_at,
    createdAt: profile.updated_at, // Using updated_at as a fallback since created_at might not be available
  }
})
