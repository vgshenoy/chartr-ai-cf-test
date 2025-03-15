import { z } from 'zod'

export const timelinePrompt = `
Ensure the order of the timeline is correct, with the most recent events coming last.

OPTIONAL: Each event can have a precise, machine readable date.
IMPORTANT: The date should be in an ISO 8601 format.
IMPORTANT: The format should be consistent over all events, since arithmetic may be done on date differences.

OPTIONAL: Each event can have a description, especially if telling a story.
`

export const timelineSchema = z.object({
  code: z.literal('timeline_v1'),
  timeline: z.array(z.object({
    date: z.string().optional().describe(`
      The date/time of the event in ISO 8601 format Eg. 2024, 2024-11-14, 2024-11-14T12:00. 
      You can use negative years to indicate BCE, eg. -24 for 24 BCE.
      Should be precise, not for human consumption, needs to be machine parseable.
    `),
    dateLabel: z.string().describe('Date label - human friendly, no need to be a date'),
    label: z.string().describe('The label of the event, use emoji at the start'),
    description: z.string().optional().describe('The description of the event, can use markdown'),
  })),
})
