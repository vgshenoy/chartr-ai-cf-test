<script setup>
import { z } from 'zod'
import { toReactive } from '@vueuse/core'

definePageMeta({
  layout: 'login-layout',
  middleware: ['redirect-logged-in-users'],
})

const toast = useToast()

const supabase = useSupabaseClient()

useRedirectOnUserLoggedIn()

const email = useCookie('user-email', '')
const otp = ref('')

const route = useRoute()

if (route.query.email) {
  email.value = route.query.email
}

const state = toReactive({
  email,
  otp,
})

const isSignInWithEmail = ref(false)
const isEmailSent = ref(false)
const isVerified = ref(false)
const isLoading = ref(false)

const redirectTo = useRuntimeConfig().public.appUrl + '/confirm'

async function signInWithOtp() {
  isLoading.value = true
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: redirectTo,
    },
  })
  if (error) {
    if (error.code === 'signup_disabled') {
      toast.add({
        description: 'This email is not registered yet. Please request an invite first.',
        color: 'red',
      })
    }
    else {
      toast.add({
        description: error.message,
        color: 'red',
      })
    }
    isLoading.value = false
  }
  else {
    isEmailSent.value = true
    isLoading.value = false
  }
}

async function verifyOTP() {
  isLoading.value = true
  const { error } = await supabase.auth.verifyOtp({
    email: email.value,
    token: otp.value.trim(), // Trim the OTP input
    type: 'email',
  })
  if (error) {
    toast.add({
      description: error.message,
      color: 'red',
    })
    isLoading.value = false
  }
  // this should trigger the watchEffect to navigate to /chat

  // else {
  //   navigateTo('/') // Navigate to home page instead of showing success message
  // }
  // isLoading.value = false
}

const emailSchema = z.object({
  email: z.string().email('Invalid email'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
    if (error?.code === 'signup_disabled') {
      toast.add({
        description: 'This account is not registered. Please request early access first.',
        color: 'red',
      })
    }
    else if (error) {
      throw error
    }
  }
  catch (error) {
    toast.add({
      description: error.message,
      color: 'red',
    })
  }
}
</script>

<template>
  <div class="space-y-12">
    <div class="space-y-6">
      <div class="prose dark:prose-invert">
        <h2>
          Login
        </h2>
        <p class="prose-sm">
          chartr.ai is currently in <BetaBadge />.
          <!-- You can request an invite <a :href="`${useRuntimeConfig().public.appUrl}/request-invite`">here</a>. -->
        </p>

        <!-- <div
          class="prose-sm"
        >
          <p>
            If you already have an account, login below.
          </p>
          <p>
            If not, request an invite <NuxtLink
              to="/early-access"
              class="not-prose text-primary underline"
            >here</NuxtLink>.
          </p>
        </div> -->
      </div>

      <template v-if="!isSignInWithEmail">
        <div class="flex flex-col gap-y-4">
          <UButton
            icon="i-carbon-logo-google"
            class="self-start"
            @click="signInWithGoogle"
          >
            Login with Google
          </UButton>

          <UButton
            icon="i-carbon-email"
            class="self-start"
            @click="isSignInWithEmail = true"
          >
            Login with Email
          </UButton>
        </div>
      </template>

      <template v-if="isSignInWithEmail">
        <p
          v-if="isEmailSent && !isVerified"
          class="prose dark:prose-invert prose-sm"
        >
          Please enter the 6-digit OTP sent to your email <span class="underline text-primary">{{ email }}</span>
        </p>

        <UForm
          v-if="!isEmailSent"
          :schema="emailSchema"
          :state="state"
          class="space-y-4"
          @submit="signInWithOtp"
        >
          <UFormGroup
            name="email"
          >
            <UInput
              v-model="state.email"
              placeholder="Enter your email"
              autofocus
              type="email"
            />
          </UFormGroup>

          <div class="flex justify-between">
            <UButton
              type="submit"
              :loading="isLoading"
            >
              Continue
            </UButton>
          </div>
        </UForm>

        <UForm
          v-else-if="!isVerified"
          :schema="otpSchema"
          :state="state"
          class="space-y-4"
          @submit="verifyOTP"
        >
          <UFormGroup name="otp">
            <UInput
              v-model="state.otp"
              placeholder="Enter 6-digit OTP"
              autofocus
              type="tel"
              pattern="[0-9]{6}"
            />
          </UFormGroup>

          <UButton
            type="submit"
            :loading="isLoading"
          >
            Verify OTP
          </UButton>
        </UForm>
      </template>
    </div>

    <!-- footer -->
    <div class="prose prose-sm dark:prose-invert">
      <div class="text-xs text-gray-500">
        <NuxtLink
          to="/legal/terms"
        >
          Terms</NuxtLink> · <NuxtLink
          to="/legal/privacy"
        >
          Privacy</NuxtLink>
      </div>
    </div>
  </div>
</template>
