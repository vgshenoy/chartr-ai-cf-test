<template>
  <div class="mb-2">
    <button
      class="flex w-full justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left text-sm font-medium"
      @click="isExpanded = !isExpanded"
    >
      <span>Message {{ index + 1 }} ({{ message.role }})</span>
      <Icon
        :name="isExpanded ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
        class="h-5 w-5"
      />
    </button>
    <div
      v-show="isExpanded"
      class="px-4 pt-4 pb-2 text-sm prose"
    >
      <pre>{{ message }}</pre>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const isExpanded = ref(false)
</script>
