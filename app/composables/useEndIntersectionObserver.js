export function useEndIntersectionObserver(options = {}) {
  const { offset = '20%' } = options

  const endRef = ref(null)
  const isVisible = ref(false)

  useIntersectionObserver(
    endRef,
    ([{ isIntersecting }]) => {
      isVisible.value = isIntersecting
    },
    {
      rootMargin: `0px 0px ${offset} 0px`,
    },
  )

  return {
    endRef,
    isVisible,
  }
}
