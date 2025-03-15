<script setup>
useSeoMeta({
  title: 'Contact | chartr.ai',
})

definePageMeta({
  layout: 'header-layout',
})
</script>

<template>
  <div class="flex flex-col items-center gap-y-16 justify-center min-h-[calc(100vh-4rem)]">
    <!-- <ChartrAiLogoSvg height="60" /> -->
    <p class="prose dark:prose-invert prose-xl">
      Reach us at <NuxtLink
        to="mailto:hello@chartr.ai"
        class="text-primary"
      >
        hello@chartr.ai
      </NuxtLink>
    </p>
  </div>
</template>
