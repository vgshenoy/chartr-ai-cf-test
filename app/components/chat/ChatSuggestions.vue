<script setup>
import SuggestionButton from '~/components/chat/SuggestionButton.vue'

defineProps({
  suggestions: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submit'])

function handleSubmit(text) {
  emit('submit', text)
}
</script>

<template>
  <div
    class="max-w-2xl flex flex-wrap items-center gap-x-2 gap-y-2"
  >
    <SuggestionButton
      v-for="suggestion in suggestions"
      :key="typeof suggestion === 'string' ? suggestion : suggestion.label"
      :label="typeof suggestion === 'string' ? suggestion : suggestion.label"
      :icon="typeof suggestion === 'object' ? suggestion.icon : undefined"
      :prompt="typeof suggestion === 'object' ? suggestion.prompt : undefined"
      @submit="handleSubmit"
    />
  </div>
</template>
