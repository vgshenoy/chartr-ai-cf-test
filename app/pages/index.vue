<script setup>
definePageMeta({
  middleware: ['redirect-logged-in-users'],
  layout: 'header-layout',
})

// defineOgImageComponent('HomeOgImage')
</script>

<template>
  <AboutChartrAi />
</template>
