import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user
  try {
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    throw createError({ statusCode: 401, message: error.message })
  }

  const chartId = getRouterParam(event, 'id')

  const supabase = await serverSupabaseClient(event)

  const { error } = await supabase
    .from('user_favorites')
    .insert({
      user_id: user.id,
      chart_id: chartId,
    })

  if (error) throw createError({ statusCode: 400, message: error.message })

  return { success: true }
})
