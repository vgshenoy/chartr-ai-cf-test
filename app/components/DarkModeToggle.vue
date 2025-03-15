<script setup>
const colorMode = useColorMode()
const props = defineProps({
  mode: {
    type: String,
    default: 'compact', // 'compact' or 'expanded'
  },
})

const modeIcon = computed(() => {
  switch (colorMode.preference) {
    case 'system': return 'i-carbon-screen'
    case 'light': return 'i-carbon-sun'
    case 'dark': return 'i-carbon-moon'
    default: return 'i-carbon-window-black-saturation'
  }
})

const toggleColorMode = () => {
  switch (colorMode.preference) {
    case 'system':
      colorMode.preference = 'light'
      break
    case 'light':
      colorMode.preference = 'dark'
      break
    case 'dark':
    default:
      colorMode.preference = 'system'
      break
  }
}

const setColorMode = (mode) => {
  colorMode.preference = mode
}
</script>

<template>
  <ClientOnly>
    <!-- Compact mode - single button that cycles through options -->
    <template v-if="props.mode === 'compact'">
      <UTooltip>
        <template #text>
          {{ colorMode.preference }} mode (click to toggle)
        </template>
        <UButton
          :icon="modeIcon"
          color="gray"
          variant="ghost"
          aria-label="Theme"
          @click="toggleColorMode"
        />
      </UTooltip>
    </template>

    <!-- Expanded mode - three buttons with active one highlighted -->
    <template v-else>
      <div class="flex space-x-1">
        <UTooltip text="System theme">
          <UButton
            icon="i-carbon-screen"
            :color="colorMode.preference === 'system' ? 'primary' : 'gray'"
            :variant="colorMode.preference === 'system' ? 'solid' : 'ghost'"
            aria-label="System theme"
            @click="setColorMode('system')"
          />
        </UTooltip>
        <UTooltip text="Light theme">
          <UButton
            icon="i-carbon-sun"
            :color="colorMode.preference === 'light' ? 'primary' : 'gray'"
            :variant="colorMode.preference === 'light' ? 'solid' : 'ghost'"
            aria-label="Light theme"
            @click="setColorMode('light')"
          />
        </UTooltip>
        <UTooltip text="Dark theme">
          <UButton
            icon="i-carbon-moon"
            :color="colorMode.preference === 'dark' ? 'primary' : 'gray'"
            :variant="colorMode.preference === 'dark' ? 'solid' : 'ghost'"
            aria-label="Dark theme"
            @click="setColorMode('dark')"
          />
        </UTooltip>
      </div>
    </template>
  </ClientOnly>
</template>
