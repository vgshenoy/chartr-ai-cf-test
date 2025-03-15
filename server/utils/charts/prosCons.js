import { z } from 'zod'

export const prosConsPrompt = `
 Ensure that the pros and cons are of one entity.
 Do not mix pros and cons of different entities.
 Use emojis!

 Title should be of the form "Pros and Cons of [entity]"
`

export const prosConsSchema = z.object({
  code: z.literal('prosCons_v1'),
  pros: z.array(z.string()).describe('A list of pros. Each pro should be a concise and clear statement.'),
  cons: z.array(z.string()).describe('A list of cons. Each con should be a concise and clear statement.'),
})
