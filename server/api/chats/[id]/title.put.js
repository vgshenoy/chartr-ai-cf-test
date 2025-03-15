import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Auth check
  try {
    await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error fetching user:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { id } = getRouterParams(event)
  const supabase = await serverSupabaseClient(event)

  // Get the title from request body
  const { title } = await readBody(event)

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  // Update the chat with the new title
  const { error: updateError } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', id)

  if (updateError) {
    console.error('Error updating chat title:', updateError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update chat title',
    })
  }

  return { title }
})
