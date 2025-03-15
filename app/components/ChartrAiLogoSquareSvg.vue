<script setup>
const props = defineProps({
  height: {
    type: String,
    default: '2rem',
  },
})

const viewBoxWidth = 38
const viewBoxHeight = 38

const computedWidth = computed(() => {
  if (props.height === '100%') {
    return `${viewBoxWidth / viewBoxHeight * 100}%`
  }
  const numericHeight = parseFloat(props.height)
  const aspectRatio = viewBoxWidth / viewBoxHeight // width / height from viewBox
  const unit = props.height.replace(/[\d.]/g, '')
  return `${numericHeight * aspectRatio}${unit}`
})
</script>

<template>
  <svg
    :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
    :width="computedWidth"
    :height="height"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="opacity-80 dark:opacity-100"
  >
    <path
      d="M19 15h8c5.523 0 10 4.477 10 10v3a9 9 0 1 1-18 0V15Z"
      fill="url(#paint0_linear_189_25)"
    />
    <path
      d="M1 10a9 9 0 0 1 18 0v13h-8C5.477 23 1 18.523 1 13v-3Z"
      fill="url(#paint1_linear_189_25)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_189_25"
        x1="19"
        y1="26"
        x2="37"
        y2="26"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#14532D" />
        <stop
          offset="1"
          stop-color="#1BBB55"
        />
      </linearGradient>
      <linearGradient
        id="paint1_linear_189_25"
        x1="1"
        y1="12"
        x2="19"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#581C87" />
        <stop
          offset="1"
          stop-color="#8E4BD4"
        />
      </linearGradient>
    </defs>
  </svg>
</template>
