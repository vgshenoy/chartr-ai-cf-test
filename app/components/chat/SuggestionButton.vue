<script setup lang="ts">
// if an object will be of the form { label: 'top 10 countries by population', icon: 'i-heroicons-chart-bar' , prompt: 'Show me a chart of the top 10 countries by population'}
interface Props {
  label: string
  icon?: string
  prompt?: string
  size?: 'sm' | 'md' | 'lg'
}

const { label, icon, prompt, size = 'sm' } = defineProps<Props>()

const emit = defineEmits(['submit'])

function handleSuggestion({ label, prompt }: { label: string, prompt?: string }) {
  // plausible event
  useTrackEvent('chat-input-suggestion-click', {
    props: {
      suggestion: label,
    },
  })

  // If prompt is provided use it, otherwise use label
  emit('submit', prompt || label)
}
</script>

<template>
  <UTooltip
    :text="prompt"
    :disabled="!prompt"
    class="max-w-full"
  >
    <UButton
      variant="soft"
      :icon="icon"
      :size="size"
      :ui="{
        size: {
          sm: 'text-xs 2xl:text-sm',
        },
      }"
      class="text-left max-w-full"
      @click="handleSuggestion({ label, prompt })"
    >
      {{ label }}
    </UButton>
  </UTooltip>
</template>
