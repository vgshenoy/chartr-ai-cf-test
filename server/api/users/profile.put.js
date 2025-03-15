import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { fullName, username } = await readBody(event)
  let user
  try {
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const supabase = await serverSupabaseClient(event)

  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName.trim(),
      username: username.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('Profile update error:', error)
    if (error.code === '23505' && error.message.includes('username')) {
      throw createError({
        statusCode: 409,
      })
    }
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return updatedProfile
})
