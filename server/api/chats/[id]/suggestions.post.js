import { convertToCoreMessages, generateObject } from 'ai'

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

import { suggestionsPrompt, suggestionsSchema } from '~~/server/utils/charts/suggestions'

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
      message: 'Unauthorized',
    })
  }

  const id = getRouterParam(event, 'id')
  const { messages } = await readBody(event)

  const MAX_MESSAGE_COUNT = 30
  const trimmedMessages = messages.slice(-MAX_MESSAGE_COUNT) // just to prevent token abuse

  const { object, usage, providerMetadata } = await generateObject({
    model: event.context.openai('gpt-4o-mini'),
    // model: event.context.openai('gpt-4o', {
    //   structuredOutputs: false,
    // }),
    system: suggestionsPrompt,
    messages: convertToCoreMessages(trimmedMessages),
    schema: suggestionsSchema,
    maxTokens: 200,
  })

  console.log('usage for chat suggestions')
  console.table({
    ...usage,
    cachedPromptTokens: providerMetadata?.openai?.cachedPromptTokens,
  })

  // save the suggestions to the database
  // no need to wait for this to finish so use event.waitUntil

  async function saveSuggestions() {
    if (id === 'new') {
      return
    }

    const supabase = await serverSupabaseClient(event)
    await supabase
      .from('chats')
      .update({
        suggestions: object.suggestions,
      })
      .eq('id', id)
  }

  event.waitUntil(saveSuggestions())

  return object
})
