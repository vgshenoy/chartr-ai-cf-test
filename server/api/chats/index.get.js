import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user
  try {
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error fetching user:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user',
    })
  }

  // Get page and limit from query parameters
  const { page: pageString, limit: limitString, search } = getQuery(event)

  const LIMIT = 20

  const page = parseInt(pageString) || 1
  const limit = parseInt(limitString) || LIMIT
  const offset = (page - 1) * limit

  const supabase = await serverSupabaseClient(event)

  // console.log('range', offset, offset + limit - 1, search)

  let query = supabase
    .from('chat_summary')
    .select('*')

  if (search && typeof search === 'string' && search.length >= 2) {
    query = query.textSearch('title', `${search}`)
  }

  query = query.eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data: chats, error } = await query

  // console.log('chats fetched length', chats.length)

  if (error) {
    console.error('Error fetching chats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch chats',
    })
  }

  return chats
})
