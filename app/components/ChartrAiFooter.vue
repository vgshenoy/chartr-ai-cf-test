<template>
  <UContainer>
    <footer class="py-8">
      <nav
        class="
        flex flex-col gap-4 items-center md:flex-row md:justify-between
        text-gray-500 dark:text-gray-400
        text-sm
      "
      >
        <div class="flex gap-8">
          <NuxtLink to="/legal/terms">
            Terms
          </NuxtLink>
          <NuxtLink to="/legal/privacy">
            Privacy
          </NuxtLink>
          <NuxtLink to="/contact">
            Contact
          </NuxtLink>
        </div>

        <div>
          <UButton
            to="https://instagram.com/chartr.ai"
            color="gray"
            variant="ghost"
            icon="i-carbon-logo-instagram"
            size="lg"
          />
          <UButton
            to="mailto:hello@chartr.ai"
            color="gray"
            variant="ghost"
            size="lg"
            icon="i-carbon-email"
          />
        </div>
      </nav>
    </footer>
  </UContainer>
</template>
