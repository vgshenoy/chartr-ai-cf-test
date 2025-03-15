import { createSystemPrompt } from '../server/utils/charts/create-system-prompt.js'

console.log(process.env.SUPABASE_SERVICE_KEY)

const prompt = createSystemPrompt()
console.log(prompt)
