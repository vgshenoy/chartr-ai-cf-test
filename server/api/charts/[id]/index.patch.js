import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    await serverSupabaseUser(event)
  }
  catch (error) {
    console.error('Error getting user:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const id = getRouterParam(event, 'id')

  const { data, isFav, visibility } = await readBody(event)

  const supabase = await serverSupabaseClient(event)

  const updateData = {}

  // Handle visibility field
  if (visibility !== undefined) {
    updateData.visibility = visibility
  }

  if (isFav !== undefined) {
    updateData.is_fav = isFav
  }
  if (data !== undefined) {
    updateData.data = data
  }

  // Then, update the chart with the new data
  const { data: chart, error } = await supabase
    .from('charts')
    .update({
      ...updateData,
      updated_at: new Date(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating chart:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }

  return chart
})
