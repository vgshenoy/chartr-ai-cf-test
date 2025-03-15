<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array,
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
})

const highlightedCode = ref('')

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const { codeToHtml } = await import('https://esm.sh/shiki@1.0.0')
    const lang = props.language || (props.class && props.class.match(/language-(\w+)/)?.[1]) || 'plaintext'

    highlightedCode.value = await codeToHtml(props.code, {
      lang,
      theme: 'github-dark', // You can change this to any theme you prefer
    })
  }
})
</script>

<template>
  <div
    class="max-w-full"
    v-html="highlightedCode || code"
  />
</template>

<style scoped>
pre code .line {
  display: block;
}
</style>
