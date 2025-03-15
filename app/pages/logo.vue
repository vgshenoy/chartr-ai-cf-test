<script setup>
const sizes = ['sm', 'base', 'lg', 'xl']
</script>

<template>
  <div class="flex flex-col h-svh justify-center items-center gap-4">
    <ChartrAiLogo
      v-for="size in sizes"
      :key="size"
      :size="size"
    />
  </div>
</template>
