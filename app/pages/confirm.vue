<script setup>
useRedirectOnUserLoggedIn()
</script>

<template>
  <div class="flex flex-col items-center space-y-4 justify-center min-h-svh">
    <NuxtLink to="/">
      <ChartrAiLogoSvg />
    </NuxtLink>
    <div class="prose dark:prose-invert text-sm">
      Logging in...
    </div>
  </div>
</template>
