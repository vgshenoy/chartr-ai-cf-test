import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  try {
    await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error getting user:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const supabase = await serverSupabaseClient(event)

  const { data: chat, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error getting chat:', error)
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found',
    })
  }

  return chat
})
