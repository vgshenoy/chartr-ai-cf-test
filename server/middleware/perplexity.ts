import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

import type { H3Event } from 'h3'

export default defineEventHandler((event: H3Event) => {
  event.context.perplexity = createOpenAICompatible({
    name: 'perplexity',
    headers: {
      Authorization: `Bearer ${useRuntimeConfig(event).perplexityApiKey}`,
    },
    baseURL: 'https://api.perplexity.ai/',
  })
})
