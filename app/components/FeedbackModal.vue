<script setup>
const { isModalOpen } = useFeedback()
const toast = useToast()

const text = ref('')
// const npsScore = ref(null)
const selectedMood = ref(null)
// const willKeepUsing = ref(null)

const moods = [
  { id: 'sad', label: 'Sad', icon: 'i-carbon-face-dissatisfied' },
  { id: 'neutral', label: 'Neutral', icon: 'i-carbon-face-neutral' },
  { id: 'happy', label: 'Happy', icon: 'i-carbon-face-activated' },
]

// const futureUsageChoices = [
//   {
//     value: 'definitely',
//     label: 'Definitely',
//     icon: 'i-heroicons-check-circle',
//   },
//   {
//     value: 'maybe',
//     label: 'Still deciding',
//     icon: 'i-heroicons-question-mark-circle',
//   },
//   {
//     value: 'no',
//     label: 'Not for me',
//     icon: 'i-heroicons-x-circle',
//   },
// ]

const isReadyToSubmit = computed(() =>
  text.value
  || selectedMood.value,
  // || npsScore.value,
  // || willKeepUsing.value,
)

async function handleSubmit() {
  if (!isReadyToSubmit.value) {
    return
  }
  await $fetch('/api/feedback', {
    method: 'POST',
    body: {
      text: text.value,
      // npsScore: npsScore.value,
      mood: selectedMood.value.id,
      // willKeepUsing: willKeepUsing.value, // Will be null if not selected
    },
  })

  // reset form
  text.value = ''
  // npsScore.value = null
  selectedMood.value = null
  // willKeepUsing.value = null

  isModalOpen.value = false

  // Add thank you toast
  toast.add({
    title: 'Thank you for your feedback!',
    description: 'We appreciate you taking the time to help us improve. Keep the feedback coming!',
    icon: 'i-carbon-checkmark-filled',
    color: 'green',
  })
}
</script>

<template>
  <UModal
    v-model="isModalOpen"
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base">
            <div class="flex items-center gap-x-3">
              <UIcon name="i-carbon-user-speaker" />
              <div class="flex items-center gap-x-2">
                Let us know what you think! <UIcon
                  name="i-carbon-favorite-filled"
                />
              </div>
            </div>
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-carbon-close"
            class="-my-1"
            @click="isModalOpen = false"
          />
        </div>
      </template>

      <UForm
        class="space-y-8"
        :state="{}"
        @submit="handleSubmit"
      >
        <div class="prose dark:prose-invert prose-sm">
          <p>
            Hi there!
          </p>

          <p>
            As a <BetaBadge /> user, your feedback means a lot.
          </p>

          <p>
            Feel free to share <b>any kind</b> of feedback you have, <b>on the go</b>, and <b>as often</b> as you like.
          </p>

          <p>
            Just click
            <UIcon
              name="i-carbon-user-speaker"
              class="w-4 h-4"
            /> at the top right of your screen to bring up this feedback dialog.
          </p>
        </div>

        <!-- Feedback Text -->
        <UFormGroup>
          <UTextarea
            v-model="text"
            placeholder="What are your thoughts? How can we improve your experience?"
            :rows="5"
          />
        </UFormGroup>

        <!-- Mood Selection -->
        <UFormGroup>
          <div class="flex gap-2">
            <UButton
              v-for="mood in moods"
              :key="mood.label"
              :color="selectedMood?.id === mood.id ? 'primary' : 'gray'"
              variant="soft"
              class="flex-1 whitespace-nowrap"
              @click="selectedMood?.id === mood.id ? selectedMood = null : selectedMood = mood"
            >
              <div class="w-full flex items-center justify-center gap-x-2">
                <UIcon
                  :name="mood.icon"
                  class="w-6 h-6 my-1"
                />
              </div>
            </UButton>
          </div>
        </UFormGroup>

        <!-- Future Usage -->
        <!-- <UFormGroup label="Do you see yourself using chartr.ai? (optional)">
          <URadioGroup
            v-model="willKeepUsing"
            :options="futureUsageChoices"
            color="primary"
            class="mt-2"
          >
            <template #label="{ option }">
              <div class="flex items-center gap-2">
                <div>
                  <div>{{ option.label }}</div>
                </div>
                <UIcon
                  :name="option.icon"
                  class="w-5 h-5 text-gray-500"
                />
              </div>
            </template>
          </URadioGroup>
        </UFormGroup> -->
      </UForm>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="gray"
            variant="ghost"
            @click="isModalOpen = false"
          >
            Maybe Later
          </UButton>
          <UButton
            color="primary"
            :disabled="!isReadyToSubmit"
            @click="handleSubmit"
          >
            <UIcon
              name="i-carbon-send"
              class="w-4 h-4"
            /> Submit
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
