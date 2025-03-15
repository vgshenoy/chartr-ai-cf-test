import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { chatId, toolCallId, visibility = 'private', data, createdAt } = await readBody(event)

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

  const supabase = await serverSupabaseClient(event)

  // insert chart in charts
  const { data: chart, error } = await supabase
    .from('charts')
    .insert({
      user_id: user.id,
      data,
      origin: {
        chat_id: chatId,
        tool_call_id: toolCallId,
      },
      visibility,
      created_at: createdAt,
      updated_at: createdAt,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error inserting chart:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }

  return chart
})
