import { getQuery } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let user
  try {
    user = await serverSupabaseUser(event)
  }
  catch (error) {
    throw createError({ statusCode: 401, message: error.message })
  }

  const supabase = await serverSupabaseClient(event)

  const { page: pageString, limit: limitString } = getQuery(event)

  const LIMIT = 10
  const page = parseInt(pageString) || 1
  const limit = parseInt(limitString) || LIMIT
  const offset = (page - 1) * limit

  // console.log({
  //   p_user_id: user.id,
  //   p_offset: offset,
  //   p_limit: limit,
  // })

  const { data, error } = await supabase.rpc('get_gallery_charts', {
    p_user_id: user.id,
    p_offset: offset,
    p_limit: limit,
  })

  if (error) {
    console.log(error)
    throw createError({ statusCode: 500, statusMessage: 'Internal server error' })
  }

  return data
})
