import { streamText, convertToCoreMessages, createDataStreamResponse } from 'ai'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import { getSystemPrompt, getVariableSystemPrompt } from '~~/server/utils/charts/prompts'

export default defineEventHandler(async (event) => {
  // // throw 429 for testing
  // throw createError({
  //   statusCode: 429,
  //   statusMessage: 'Too Many Requests',
  // })

  // auth check
  let user = null
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

  // TODO: add rate limiting

  const { id } = getRouterParams(event)

  const { messages, useAlternateModel } = await readBody(event)

  const MAX_MESSAGE_COUNT = 30

  const trimmedMessages = messages.slice(-MAX_MESSAGE_COUNT)
  // console.log('trimmedMessages', JSON.stringify(trimmedMessages, null, 2))

  // const model = event.context.openai('o1-mini')
  // const model = event.context.openai('gpt-4o', {
  //   structuredOutputs: false,
  // })
  // const model = event.context.openai('gpt-4o-mini')

  // const model = event.context.anthropic('claude-3-5-sonnet-20241022', {
  //   cacheControl: true,
  // })
  // const model = event.context.anthropic('claude-3-5-haiku-20241022', {
  //   cacheControl: true,
  // })

  const model = useAlternateModel
    ? event.context.anthropic('claude-3-5-haiku-20241022', {
        cacheControl: true,
      })
    : event.context.anthropic('claude-3-7-sonnet-20250219', {
        cacheControl: true,
      })

  // const model = event.context.perplexity('llama-3.1-sonar-large-128k-online')

  // const model = event.context.google('gemini-1.5-pro', {
  //   // useSearchGrounding: true,
  // })

  // const model = event.context.google('gemini-2.0-flash')
  // const model = event.context.google('gemini-2.0-pro-exp-02-05')

  const isModelOnline = false
  // const isModelOnline = true

  // const system = createSystemPrompt({ isOnline: true })
  const system = getSystemPrompt()
  const variableSystem = getVariableSystemPrompt({ isOnline: isModelOnline })

  return createDataStreamResponse({
    headers: {
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive',
    },
    execute: async (dataStream) => {
      const result = streamText({
        model,
        maxTokens: 4000,
        messages: [
          {
            role: 'system',
            content: system,
            providerOptions: {
              anthropic: {
                cacheControl: {
                  type: 'ephemeral',
                },
              },
            },
          },
          {
            role: 'system',
            content: variableSystem,
          },
          ...convertToCoreMessages(trimmedMessages),
        ],

        tools: {
          fetchUserSuppliedYoutubeVideo: createFetchYoutubeVideoTool(event),
          fetchUserSuppliedUrl: createFetchUrlTool(event),
        },

        maxSteps: 5,

        // experimental_transform: smoothStream(),

        onError(error) {
          // Improved error logging
          console.error('Error streaming text:', {
            message: error?.message || 'Unknown error',
            name: error?.name,
            stack: error?.stack,
            details: error,
          })
        },

        async onFinish({ response, usage, providerMetadata }) {
          // Send grounding metadata as a final annotation if it exists
          // const groundingMetadata = providerMetadata?.google?.groundingMetadata
          // if (groundingMetadata) {
          //   dataStream.writeMessageAnnotation({
          //     groundingMetadata,
          //   })
          // }

          console.log('model used', response.modelId)
          console.log('usage for chat')
          const augmentedUsage = {
            ...usage,
            openaiCachedPromptTokens: providerMetadata?.openai?.cachedPromptTokens,
            anthropicCacheCreationInputTokens: providerMetadata?.anthropic?.cacheCreationInputTokens,
            anthropicCacheReadInputTokens: providerMetadata?.anthropic?.cacheReadInputTokens,
          }
          console.table(augmentedUsage)

          // TODO: save usage to db chats table, usage JSONB column
          const supabase = await serverSupabaseClient(event)
          const { error } = await supabase
            .from('chats')
            .update({
              usage: augmentedUsage,
            })
            .eq('id', id)

          if (error) {
            console.error('Error saving usage to db:', error)
          }
        },
      })

      // Merge the streamText result into the data stream
      result.mergeIntoDataStream(dataStream)
    },
    onError(error) {
      // Improved error logging in createDataStreamResponse
      console.error('Error streaming text:', {
        message: error?.message || 'Unknown error',
        name: error?.name,
        stack: error?.stack,
        details: error,
      })
    },
  })
})
