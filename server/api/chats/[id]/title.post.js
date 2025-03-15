import { convertToCoreMessages, generateObject } from 'ai'
import { z } from 'zod'

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // auth check
  let user
  try {
    user = await serverSupabaseUser(event)
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

  // Fetch the chat messages for the chat id provided
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .select('messages')
    .eq('id', id)
    .single()

  if (chatError) {
    console.error('Error fetching chat:', chatError)
    throw createError({
      statusCode: 404,
      statusMessage: 'Chat not found',
    })
  }

  const trimmedMessages = chatData.messages.slice(-30) // just to prevent token abuse

  // Generate a title for the chat
  const { object, usage, experimental_providerMetadata } = await generateObject({
    model: event.context.openai('gpt-4o-mini'),
    // model: event.context.openai('gpt-4o', {
    //   structuredOutputs: false,
    // }),
    system: `
    Generate a short and concise title for this chat based on the user message. 
    Use a sensible emoji in the title if it makes sense. Put it at the beginning of the title.
    `,
    schema: z.object({
      title: z.string(),
    }),
    messages: convertToCoreMessages(trimmedMessages),
    maxTokens: 100,
  })

  console.log('usage for chat title')
  console.table({
    ...usage,
    cachedPromptTokens: experimental_providerMetadata?.openai?.cachedPromptTokens,
  })

  const title = object.title

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
