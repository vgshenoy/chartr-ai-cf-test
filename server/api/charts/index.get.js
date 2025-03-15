import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user
  try {
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error getting user:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { chatId, page: pageStr, limit: limitStr, filter = null } = getQuery(event)

  const LIMIT = 10

  const page = parseInt(pageStr) || 1
  const limit = parseInt(limitStr) || LIMIT

  const offset = (page - 1) * limit

  const supabase = await serverSupabaseClient(event)

  // console.log('filter', {
  //   p_user_id: user.id,
  //   p_limit: limit,
  //   p_offset: offset,
  //   p_filter: filter,
  // })

  let query = supabase
    .rpc('get_user_charts', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
      p_filter: filter,
    })

  if (chatId) {
    query = query.eq('origin->>chat_id', chatId)
  }

  const { data: charts, error } = await query

  if (error) {
    console.error('Error fetching charts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch charts',
    })
  }

  return charts
})
