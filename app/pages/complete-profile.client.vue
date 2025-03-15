<script setup>
import { z } from 'zod'
import { toReactive } from '@vueuse/core'

definePageMeta({
  layout: 'header-layout',
})

const toast = useToast()

const profile = inject('profile')

// Form state
const form = ref({
  username: profile.value?.username || '',
  fullName: profile.value?.fullName || '',
})

const state = toReactive({
  username: form.value.username,
  fullName: form.value.fullName,
})

const isUsernameTaken = ref(false)

// Form validation schema
const formSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .refine(val => !val.includes(' '), 'Username cannot contain spaces'),
  fullName: z.string().min(1, 'Full name is required'),
})

// Form submission handler
async function onSubmit() {
  isUsernameTaken.value = false

  // Trim both fields
  state.username = state.username.trim()
  state.fullName = state.fullName.trim()

  try {
    const updatedProfile = await $fetch('/api/users/profile', {
      method: 'PUT',
      body: {
        username: state.username,
        fullName: state.fullName,
      },
    })

    profile.value = updatedProfile
    const redirectPath = useCookie('check-profile-redirect-path').value
    useCookie('check-profile-redirect-path').value = null

    navigateTo(redirectPath || '/', {
      external: true,
    })
  }
  catch (err) {
    if (err.statusCode === 409) {
      isUsernameTaken.value = true
    }
    else {
      toast.add({
        title: 'Error',
        description: err.message,
        color: 'red',
      })
    }
  }
}
</script>

<template>
  <UContainer class="max-w-sm">
    <div class="my-6">
      <div class="prose prose-sm dark:prose-invert">
        <h2>
          Welcome! Your chartr.ai account has been created.
        </h2>
        <p>
          <UIcon name="i-carbon-user-profile" /> Before you can continue, we need you to complete your profile.
        </p>
      </div>
    </div>

    <UForm
      class="space-y-4"
      :schema="formSchema"
      :state="state"
      @submit="onSubmit"
    >
      <UFormGroup
        label="Full Name"
        name="fullName"
      >
        <UInput
          v-model="state.fullName"
          placeholder="John Doe"
        />
        <template #help>
          <p class="text-xs">
            Just for our records, not visible to others.
          </p>
        </template>
      </UFormGroup>

      <UFormGroup
        label="Username"
        name="username"
      >
        <UInput
          v-model="state.username"
          placeholder="johndoe"
          icon="i-carbon-at"
        />
        <template #help>
          <p
            v-if="isUsernameTaken"
            class="text-xs text-purple-500"
          >
            This username is already taken.
          </p>
          <p
            v-else
            class="text-xs"
          >
            Your handle on chartr.ai if you share publicly
          </p>
        </template>
      </UFormGroup>

      <div class="flex justify-end">
        <UButton
          type="submit"
          color="primary"
          label="Continue"
        />
      </div>
    </UForm>
  </UContainer>
</template>
