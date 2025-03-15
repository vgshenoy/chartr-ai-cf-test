<script setup>
defineProps({
  tooltipText: {
    type: String,
    default: null,
  },
})
defineOptions({
  inheritAttrs: false,
})

const breakpoints = useMyBreakpoints()
const smAndLarger = breakpoints.greaterOrEqual('sm')
// Use ref with an initial value to avoid hydration mismatch
const size = ref('sm')

const isExporting = inject('isExporting')

// Update size in onMounted to ensure client-side only
onMounted(() => {
  watchEffect(() => {
    size.value = smAndLarger.value ? 'md' : 'sm'
  })
})
</script>

<template>
  <UTooltip
    :text="tooltipText"
    :class="{
      invisible: isExporting,
    }"
  >
    <UButton
      v-bind="{
        variant: 'ghost',
        color: 'gray',
        ...$attrs,
      }"
      :size="size"
    />
  </UTooltip>
</template>
