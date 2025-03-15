export default defineEventHandler(async (event) => {
  // console.log('event.path', event.path)

  // if (!publicPaths.includes(event.path)) {
  //   try {
  //     const user = await serverSupabaseUser(event)
  //     event.context.user = user
  //   }
  //   catch (error) {
  //     console.error('Error getting user:', error)
  //     throw createError({
  //       statusCode: 401,
  //       statusMessage: 'Unauthorized',
  //     })
  //   }
  // }
})
