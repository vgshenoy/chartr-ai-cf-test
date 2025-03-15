import { createClient } from '@supabase/supabase-js'
import { camelCase } from 'scule'

// Initialize the Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Function to fetch chats
async function fetchChats() {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .limit(1000)

    if (error) throw error

    return data
  }
  catch (error) {
    console.error('Error fetching chats:', error.message)
    return []
  }
}

async function main() {
  const chats = await fetchChats()

  console.log(chats.length)

  for (const chat of chats) {
    for (const message of chat.messages) {
      if (message.toolInvocations) {
        for (const invocation of message.toolInvocations) {
          if (invocation.toolName.startsWith('draw_chart')) {
            let newToolName = camelCase(invocation.toolName)

            // // Special case for mermaid_mindmap
            if (newToolName.startsWith('drawChartMermaid')) {
              newToolName = 'drawChartMermaid'
            }

            invocation.toolName = newToolName

            // update the record in supabase with the new tool name
            await supabase
              .from('chats')
              .update({
                messages: chat.messages,
              })
              .eq('id', chat.id)
          }

          // Remove this block as it's no longer needed
          // if (invocation.toolName.startsWith('drawChart')) {
          //   console.log('Chart tool used NEW:', invocation.toolName)
          // }
        }
      }
    }
  }
}

main()
