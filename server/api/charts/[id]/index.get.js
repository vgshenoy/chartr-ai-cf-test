import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const supabase = await serverSupabaseClient(event)

  let user = null
  let error = null
  let chart = null

  try {
    user = await serverSupabaseUser(event)
  }
  catch {
    // User is not authenticated
    console.log('Not an authenticated user')
  }
  finally {
    if (user) {
      // If user is authenticated, use the get_user_charts function
      // This will return the chart if the user is the owner or if it's in their favorites
      const { data, error: chartError } = await supabase
        .rpc('get_user_charts', {
          p_user_id: user.id,
          p_limit: 1,
          p_offset: 0,
          p_filter: id,
        })
        .single()

      chart = data
      error = chartError
    }
    else {
      // If user is not authenticated, they can only see public or unlisted charts
      const { data, error: chartError } = await supabase
        .from('charts_with_usernames')
        .select('id, data, updated_at, username, visibility')
        .eq('id', id)
        .not('visibility', 'eq', 'private')
        .single()

      chart = data
      error = chartError
    }
  }

  if (error) {
    console.error('Error fetching chart:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Chart not found or you do not have permission to view it',
    })
  }

  // console.log('chart', JSON.stringify(chart, null, 2))

  return chart
})
