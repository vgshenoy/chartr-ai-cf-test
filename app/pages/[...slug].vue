<script setup>
definePageMeta({
  layout: 'header-layout',
  middleware: [
    function (to) {
      // Remove the leading slash and decode the URL
      const urlString = to.fullPath.substring(1)

      // Check if it looks like a URL (basic check for http/https or www)
      if (urlString.match(/^(https?:\/\/|www\.)/i)) {
        return navigateTo(`/boards/new?q=${encodeURIComponent(urlString)}`, { replace: true })
      }
    },
  ],
})
</script>

<template>
  <UContainer>
    <main class="mt-12 max-w-none prose prose-sm md:prose-base dark:prose-invert" />
  </UContainer>
</template>
