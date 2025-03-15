import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollToEnd({
  enabled = true, // maybe ref
} = {}) {
  const containerRef = ref(null)
  const endRef = ref(null)
  const enabledRef = toRef(enabled)

  const observer = ref(null)

  function scrollToEnd() {
    if (endRef.value) {
      endRef.value.scrollIntoView({ behavior: 'smooth' })
    }
  }

  onMounted(() => {
    // for initial scroll to end
    scrollToEnd()

    observer.value = new MutationObserver(() => {
      if (!enabledRef.value) {
        return
      }
      scrollToEnd()
    })

    if (containerRef.value) {
      observer.value.observe(containerRef.value, {
        childList: true,
        subtree: true,
      })
    }
  })

  onUnmounted(() => {
    if (observer.value) {
      observer.value.disconnect()
    }
  })

  return {
    containerRef,
    endRef,
    enabled,
    scrollToEnd,
  }
}
