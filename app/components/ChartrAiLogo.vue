<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'base',
    validator: value => ['sm', 'base', 'lg', 'xl'].includes(value),
  },
})

const sizeClasses = computed(() => {
  return {
    'text-2xs': props.size === 'sm',
    'text-2xs sm:text-xs': props.size === 'base',
    'text-xs sm:text-sm': props.size === 'lg',
    'text-sm sm:text-base': props.size === 'xl',
  }
})

const paddingClasses = computed(() => {
  return {
    'px-1.5 py-0.5  ': props.size === 'sm',
    'px-1.5 py-1': props.size === 'base',
    'px-2 py-1.5': props.size === 'lg',
    'px-2.5 py-2': props.size === 'xl',
  }
})
</script>

<template>
  <div :class="sizeClasses">
    <div
      id="logo__bars-wrapper"
      class="flex"
    >
      <div
        id="logo__charted-bar"
        class="my-2 rounded-l-md bg-gradient-to-r from-purple-400 to-purple-900 text-gray-100 font-bold flex flex-col justify-center"
        :class="paddingClasses"
      >
        <span>
          charted
        </span>
      </div>

      <div class="w-0.5 h-full bg-gray-400 rounded-lg" />

      <div
        id="logo__out-bar"
        class="my-2 rounded-r-md bg-gradient-to-r from-green-500 to-green-900 text-gray-100 font-bold flex flex-col justify-center"
        :class="paddingClasses"
      >
        <span>
          out
        </span>
      </div>
    </div>
  </div>
</template>
