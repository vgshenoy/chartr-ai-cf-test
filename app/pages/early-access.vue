<script setup>
import { z } from 'zod'
import { toReactive } from '@vueuse/core'

definePageMeta({
  layout: 'login-layout',
  middleware: ['redirect-logged-in-users'],
})

const toast = useToast()

const email = ref('')

const state = toReactive({
  email,
})

const isLoading = ref(false)
const isEmailAdded = ref(false)

const emailSchema = z.object({
  email: z.string().email('Invalid email'),
})

async function requestInvite() {
  isLoading.value = true

  try {
    const { alreadyOnWaitlist, alreadyRegistered } = await $fetch('/api/waitlist', {
      method: 'POST',
      body: {
        email: state.email,
      },
    })

    if (alreadyOnWaitlist) {
      helpText.value = 'You are already on the list :)'
      email.value = ''
    }
    else if (alreadyRegistered) {
      helpText.value = 'You are already registered, login to continue.'
      email.value = ''
    }
    else {
      isEmailAdded.value = true
    }
  }
  catch (error) {
    console.error('error', error)
    toast.add({
      title: 'Error',
      description: error.data.message,
      color: 'red',
    })
  }
  finally {
    isLoading.value = false
  }
}

const helpText = ref('')
</script>

<template>
  <div class="space-y-6">
    <div class="prose dark:prose-invert">
      <h2>
        <template v-if="!isEmailAdded">
          Get early access
        </template>
        <template v-else>
          You're on the list!
        </template>
      </h2>
      <div class="prose-sm">
        <div v-if="!isEmailAdded">
          <p>
            chartr.ai is currently in <EarlyAccessBadge />.
          </p>
          <p>
            If you already have an account, login <NuxtLink
              to="/login"
              class="text-primary"
            >
              here</NuxtLink>.
          </p>
          <p>
            If not, enter your email below to request an invite.
          </p>
        </div>
        <p v-else>
          Hang tight, an invite will be on the way very soon!
        </p>
      </div>
    </div>

    <UForm
      v-if="!isEmailAdded"
      :schema="emailSchema"
      :state="state"
      class="space-y-4"
      @submit="requestInvite"
    >
      <UFormGroup
        name="email"
        :help="helpText"
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
          v-if="!isEmailAdded"
          type="submit"
          :loading="isLoading"
        >
          Continue
        </UButton>
      </div>
    </UForm>
  </div>
</template>
