import { ref, onMounted } from 'vue'

export function usePhysicalKeyboard() {
  const isPhysicalKeyboard = ref(false)

  function checkForPhysicalKeyboard() {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      isPhysicalKeyboard.value = true
    }
  }

  onMounted(() => {
    checkForPhysicalKeyboard()
  })

  return {
    isPhysicalKeyboard,
  }
}
