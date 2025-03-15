<script setup>
defineProps({
  title: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: 'Something went wrong.',
  },
})
</script>

<template>
  <div
    class="not-prose group w-full px-4 py-3 rounded-lg transition-all duration-400 shadow bg-red-100 dark:bg-red-950/50 ring-1 ring-red-200 dark:ring-red-700"
  >
    <div class="flex items-center gap-3">
      <div class="flex-shrink-0 flex items-center justify-center text-red-500 dark:text-red-400">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="h-7 w-7 opacity-50"
        />
      </div>

      <div class="min-w-0 flex-1 flex flex-col items-start space-y-0.5">
        <div
          v-if="title"
          class="w-full text-left text-red-900 dark:text-red-100 text-xs sm:text-sm 2xl:text-base"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </div>
        <div class="text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
