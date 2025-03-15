import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error authenticating user:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { id } = getRouterParams(event)
  const supabase = await serverSupabaseClient(event)

  const { messages } = await readBody(event)

  const { data: chat, error } = await supabase
    .from('chats')
    .update({ messages })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating chat:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update chat',
    })
  }

  return chat
})
