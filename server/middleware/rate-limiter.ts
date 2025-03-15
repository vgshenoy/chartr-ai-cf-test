import { serverSupabaseUser } from '#supabase/server'

// Routes that should be rate limited
const RATE_LIMITED_ROUTES = [
  {
    method: 'POST',
    pattern: /^\/api\/chats\/[^\/]+$/, // Matches /api/chats/{id} exactly
  },
]

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const method = event.method

  // Check if the route should be rate limited
  const shouldRateLimit = RATE_LIMITED_ROUTES.some(route =>
    route.method === method && route.pattern.test(path),
  )
  if (!shouldRateLimit) return

  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // const rateLimiterUrl = 'http://localhost:8787'
  const rateLimiterUrl = 'https://rate-limiter.chartr.ai'

  try {
    await $fetch(`${rateLimiterUrl}?userId=${user.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
  catch (error) {
    console.error('Rate limiter error:', error)
    throw createError({
      statusCode: 429,
      message: 'Rate limit exceeded',
    })
  }
})
