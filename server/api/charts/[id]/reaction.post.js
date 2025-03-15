import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user
  try {
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    throw createError({ statusCode: 401, message: error.message })
  }

  const chartId = getRouterParam(event, 'id')
  const { reaction } = await readBody(event)

  const supabase = await serverSupabaseClient(event)

  const { error } = await supabase
    .from('user_chart_reactions')
    .upsert({
      user_id: user.id,
      chart_id: chartId,
      reaction_type: reaction,
    })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
