import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText } from 'ai'

export default defineEventHandler(async (event) => {
  // return 'test'
  console.log('pplx api key', useRuntimeConfig(event).perplexityApiKey)

  const perplexity = createOpenAICompatible({
    name: 'perplexity',
    headers: {
      Authorization: `Bearer ${useRuntimeConfig(event).perplexityApiKey}`,
    },
    baseURL: 'https://api.perplexity.ai/',
  })

  const { text } = await generateText({
    model: perplexity('llama-3.1-sonar-large-128k-online'),
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  })

  return text
})
