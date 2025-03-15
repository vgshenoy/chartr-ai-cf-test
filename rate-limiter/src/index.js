export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')

      if (!userId) {
        return new Response('Missing required parameters', { status: 400 })
      }

      console.log('rate limit check by userId', userId)

      const { success } = await env.MY_RATE_LIMITER.limit({
        key: userId,
      })

      if (!success) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Rate limit exceeded for user ${userId}`,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
    catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    }
  },
}
