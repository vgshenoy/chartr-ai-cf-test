import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')

  const { messages } = await readBody(event)

  const client = await serverSupabaseClient(event)

  const { data, error: insertError } = await client.from('chats')
    .insert({
      messages,
    })
    .select()

  if (insertError) {
    console.error('Error inserting chat:', insertError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create chat',
    })
  }

  const id = data[0].id

  return { id }
})
