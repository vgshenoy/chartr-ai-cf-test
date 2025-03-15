import { generateText } from 'ai'

export default defineEventHandler(async (event) => {
  const { text, providerMetadata } = await generateText({
    model: event.context.google('gemini-1.5-pro', {
      useSearchGrounding: true,
    }),
    prompt: `
    How has the 2024 f1 season played out - storytell it to me.
    `,
  })

  return {
    text,
    providerMetadata,
  }
})
