<script setup>
const isChatLoading = inject('isChatLoading', false)

defineProps({
  size: {
    type: String,
    default: 'base',
  },
})
</script>

<template>
  <div
    v-if="isChatLoading"
    class="inline-flex h-6 items-center space-x-0.5 dark:invert"
  >
    <div class="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div class="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div class="h-1 w-1 bg-primary rounded-full animate-bounce" />
  </div>
</template>
