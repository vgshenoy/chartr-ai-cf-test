import { z } from 'zod'

const cellContentSchema = z.union([
  z.array(z.string()).describe('An array of strings representing bullet points'),
  z.string(),
])

export const tableChartSchema = z.object({
  code: z.literal('table_v1'),
  headers: z.array(z.string()),
  rows: z.array(z.array(cellContentSchema)),
})

export const tableChartPrompt = `
Generate a table for the user.

ALWAYS use emoji in the table cells. DO NOT have a separate column for just emoji.

IMPORTANT: If there are multiple items in a cell, DO NOT use newline characters, use array of strings for bullet points instead.

If applicable, sort the data in a logical order (e.g., chronological, alphabetical, or by importance).

Group the data so that things are structured in a way that is easy to grasp.

Be flexible with the table structure. Categories can be in rows or columns, depending on what makes the most sense for the data.

You can use emojis to convey relative quantities in a column. Use this to add a quantitative aspect to the table almost like bars. 
Have a scale of 1-5 or 1-10 emojis. If using this scale, avoid text. If text is needed for clarity, put it in brackets in a new line.

Example: 
{
  "headers": ["Category", "Element", "Description"],
  "rows": [
    ["Deities", "🌞 Hunab Ku", ["🌟 Supreme creator god", "✨ Origin of all things"]],
    ["", "🌧️ Chac", ["💧 Rain god", "🌱 Brings fertility"]],
    ["", "🌿 Quetzalcoatl", ["🐍 Feathered serpent god", "🌪️ Wisdom and wind"]],
    ["Texts", "📚 Popol Vuh", ["📖 Sacred creation myths", "📜 Quiché Maya history"]],
    ["Practices", "🏺 Rituals", ["🔮 Ceremonies and offerings", "📅 Calendar-based events"]]
  ]
}
`
