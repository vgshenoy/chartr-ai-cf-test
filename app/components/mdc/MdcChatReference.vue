<script setup>
defineProps({
  title: {
    type: String,
    default: null,
  },
  text: {
    type: String,
    default: null,
  },
  withRemoveButton: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove'])
</script>

<template>
  <div
    v-if="title || text"
    class="pl-3 pr-8 py-2 text-sm text-gray-500 border-l-2 border-gray-400 group relative"
  >
    <UButton
      v-if="withRemoveButton"
      icon="i-heroicons-x-mark"
      color="gray"
      variant="ghost"
      size="sm"
      class="absolute top-1/2 -translate-y-1/2 right-0"
      @click.stop="emit('remove')"
    />
    <p
      v-if="title"
      class="font-medium text-gray-700 dark:text-gray-300"
    >
      {{ title }}
    </p>
    <p
      v-if="text"
      class="line-clamp-2 mt-0.5"
    >
      {{ text }}
    </p>
  </div>
</template>
