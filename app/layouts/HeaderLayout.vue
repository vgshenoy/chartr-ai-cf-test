<script setup>
const { openModal } = useFeedback()

const header = ref(null)

const { height: headerHeight } = useElementBounding(header)

// INJECTIONS DID NOT WORK - just remove this?
provide('headerHeight', headerHeight)

const user = useSupabaseUser()

function login() {
  navigateTo('/login')
}

const route = useRoute()

function handleLogoClick() {
  // if the route is the /chat page, scroll to top
  // console.log(route.path)
  if (route.path === '/start' || route.path === '/') {
    scrollToTop()
  }
}

function scrollToTop() {
  y.value = 0
}

const { y } = useWindowScroll()
const isScrolled = ref(false)

// Use onMounted to handle scroll-based styling on client-side only
onMounted(() => {
  watch(y, (newY) => {
    isScrolled.value = newY > 0
  })
})
</script>

<template>
  <div>
    <header
      ref="header"
      class="h-16 border-gray-200 dark:border-gray-800
      bg-gray-100 dark:bg-slate-800
      grid grid-cols-[1fr_1fr] md:grid-cols-[1fr_auto_1fr] gap-x-4 py-4 px-4 sm:px-6 sticky top-0 z-10
      "
      :class="{ 'border-b-2': isScrolled }"
    >
      <div class="flex justify-start items-center gap-x-2 lg:gap-x-4">
        <NuxtLink
          to="/"
          @click="handleLogoClick"
        >
          <ChartrAiLogoSvg />
          <!-- <ChartrAiLogo /> -->
        </NuxtLink>

        <UTooltip
          v-if="user"
          text="Boards"
        >
          <UButton
            :color="$route.path === '/boards' ? 'primary' : 'gray'"
            icon="i-carbon-chart-marimekko"
            variant="ghost"
            @click="navigateTo('/boards')"
          />
        </UTooltip>

        <UTooltip
          v-if="user"
          text="Charts"
        >
          <UButton
            :color="$route.path === '/charts' ? 'primary' : 'gray'"
            icon="i-carbon-chart-multitype"
            variant="ghost"
            @click="navigateTo('/charts')"
          />
        </UTooltip>

        <UTooltip
          v-if="user && ($route.path !== '/start' || isScrolled)"
          text="New Board"
        >
          <UButton
            color="gray"
            icon="i-heroicons-plus"
            variant="ghost"
            @click="navigateTo('/start') && scrollToTop()"
          />
        </UTooltip>

        <slot name="header-left" />
      </div>

      <div
        id="app-header-middle"
        class="hidden md:flex justify-center items-center"
      >
        <slot name="header-middle" />
      </div>

      <div
        id="app-header-right"
        class="flex justify-end items-center gap-x-2 lg:gap-x-4"
      >
        <slot name="header-right" />

        <UTooltip
          v-if="user"
          text="Feedback"
        >
          <UButton
            color="gray"
            icon="i-carbon-user-speaker"
            variant="ghost"
            @click="openModal"
          />
        </UTooltip>

        <DarkModeToggle />

        <DropdownAvatar v-if="user?.email" />

        <UButton
          v-if="!user"
          variant="ghost"
          @click="login"
        >
          Login
        </UButton>

        <UButton
          v-if="!user"
          to="/login"
          color="primary"
          size="lg"
          icon="i-carbon-chart-multitype"
        >
          Start
        </UButton>

        <!-- <button
          v-if="!user"
          class="cursor-pointer"
          @click="navigateTo('/early-access')"
        >
          <EarlyAccessBadge size="sm" />
        </button> -->
      </div>
    </header>

    <slot />
  </div>
</template>
