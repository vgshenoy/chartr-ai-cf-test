<script setup>
const nextChart = inject('nextChart')
const isChatLoading = inject('isChatLoading')

defineProps({
  size: {
    type: String,
    default: 'sm',
  },
  withGlow: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <UTooltip
    v-if="!isChatLoading"
    text="Next Chart"
    :popper="{
      placement: 'top',
    }"
  >
    <UButton
      icon="i-carbon-chart-multitype"
      :size="size"
      variant="solid"
      color="purple"
      class="hover:scale-110 transition-transform duration-200"
      @click="nextChart"
    />
  </UTooltip>
</template>
