import { z } from 'zod'

import { sendWaitlistEmail } from '~~/server/utils/email'
import { serverSupabaseClient } from '#supabase/server'

const emailSchema = z.object({
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, emailSchema.parse)

  const supabase = await serverSupabaseClient(event)

  // TODO: check if user already registered

  // const supabaseAdmin = await serverSupabaseServiceRole(event)
  // // Check if user already registered
  // const { data: users, error: authError } = await supabaseAdmin.from('auth.users').select('id').eq('email', email)

  // console.log('users', users)

  // if (authError) {
  //   console.error('Error checking existing users:', authError)
  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: 'Failed to check existing users',
  //   })
  // }

  // if (users.length > 0) {
  //   return {
  //     alreadyRegistered: true,
  //   }
  // }

  // Proceed with waitlist insertion
  const { error } = await supabase.from('waitlist').insert({ email })

  if (error) {
    if (error.code === '23505') {
      return {
        alreadyOnWaitlist: true,
      }
    }
    else {
      // some other error
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to request invite',
      })
    }
  }

  // inserted into waitlist, now send email

  // do I need to use useRuntimeConfig here? since only on server.
  await sendWaitlistEmail(email, useRuntimeConfig(event).resendApiKey)

  return {
    success: true,
  }
})
