<script setup>
defineProps({
  error: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-svh">
    <div class="prose dark:prose-invert">
      <h1 class="text-center">
        {{ error.statusCode }}
      </h1>

      <p class="text-center">
        Oops! Nothing to see here.
      </p>

      <div class="text-center not-prose">
        <UButton to="/">
          Go back home
        </UButton>
      </div>
    </div>
  </div>
</template>
