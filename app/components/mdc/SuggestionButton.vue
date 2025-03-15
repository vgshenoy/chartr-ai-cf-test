<script setup lang="ts">
import SuggestionButton from '@/components/chat/SuggestionButton.vue'

defineProps<{
  label?: string
  icon?: string
  prompt?: string
}>()

const handleSuggestion = inject('handleSuggestion', () => {})
</script>

<template>
  <!-- label could be undefined if streaming -->
  <SuggestionButton
    v-if="label"
    :label="label"
    :icon="icon"
    :prompt="prompt"
    class="my-1 mr-2"
    @submit="handleSuggestion"
  />
</template>
