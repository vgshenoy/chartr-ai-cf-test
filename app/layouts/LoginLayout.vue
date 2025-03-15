<script setup>
const route = useRoute()
</script>

<template>
  <div>
    <UContainer
      class="flex justify-center min-h-screen"
    >
      <div class="w-full max-w-sm">
        <div class="flex justify-between mt-20 mb-12">
          <NuxtLink to="/">
            <ChartrAiLogoSvg height="40" />
          </NuxtLink>
          <div class="flex items-center gap-4">
            <DarkModeToggle />
            <UButton
              v-if="route.path !== '/login'"
              variant="ghost"
              @click="navigateTo('/login')"
            >
              Login
            </UButton>
          </div>
        </div>

        <slot />
      </div>
    </UContainer>

    <ChartrAiFooter />
  </div>
</template>
