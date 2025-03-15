import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user
  try {
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error getting user:', error)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = await serverSupabaseClient(event)

  const {
    data: profile,
    error,
  } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }

  return profile
})
