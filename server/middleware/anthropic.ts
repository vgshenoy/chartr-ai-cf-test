import { createAnthropic } from '@ai-sdk/anthropic'
import type { H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  event.context.anthropic = createAnthropic({
    apiKey: useRuntimeConfig(event).anthropicApiKey,
  })
})
