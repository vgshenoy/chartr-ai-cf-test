import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  event.context.google = createGoogleGenerativeAI({
    apiKey: useRuntimeConfig(event).geminiApiKey,
  })
})
