import { createOpenAI } from '@ai-sdk/openai'
import type { H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  event.context.openai = createOpenAI({
    apiKey: useRuntimeConfig(event).openaiApiKey,
    compatibility: 'strict', // use with openai api and not for openai type apis
    // baseURL: 'https://gateway.ai.cloudflare.com/v1/9164163573e7ee00b5c6833df7f00ccd/charted-out/openai',
    // baseURL: 'https://vigneshenoy.com',
  })
})
