import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user
  try {
    // auth check with supabase
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error getting user:', error)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { text, mood } = await readBody(event)

  const supabase = await serverSupabaseClient(event)

  // insert feedback into supabase
  const { error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: user.id,
      feedback: {
        text,
        mood,
      },
    })

  if (error) {
    console.error('Error inserting feedback:', error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }

  return 'Feedback submitted successfully'
})
