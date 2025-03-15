import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')
  const { page: pageStr, limit: limitStr } = getQuery(event)

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username is required',
    })
  }

  const LIMIT = 10
  const page = parseInt(pageStr) || 1
  const limit = parseInt(limitStr) || LIMIT
  const offset = (page - 1) * limit

  const supabase = await serverSupabaseClient(event)

  // First get the user ID from the username
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (profileError || !profileData) {
    console.error('Error fetching profile:', profileError)
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found',
    })
  }

  // Get public and posted charts for this user
  const { data: charts, error: chartsError } = await supabase
    .from('charts_with_usernames')
    .select('*')
    .eq('user_id', profileData.id)
    .eq('visibility', 'public')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (chartsError) {
    console.error('Error fetching charts:', chartsError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch charts',
    })
  }

  // Transform chart data to match frontend expectations
  return charts.map(chart => ({
    id: chart.id,
    data: chart.data,
    isPublic: chart.is_public,
    isPosted: chart.is_posted,
    username: chart.username,
    createdAt: chart.created_at,
    updatedAt: chart.updated_at,
  }))
})
