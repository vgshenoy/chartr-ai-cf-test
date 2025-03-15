const EVERY_X_INTERACTIONS = 5
const MIN_TIME_BETWEEN_MODALS = 1000 * 60 * 60 * 24 // do not show modal more than once per day

export function useFeedback() {
  const isModalOpen = useState('isFeedbackModalOpen', () => false)

  const meaningfulInteractions = useLocalStorage('meaningfulInteractions', 0)

  const lastOpenTime = useLocalStorage('lastTimeFeedbackModalOpened', null)

  function openModal({ delayInMs } = {}) {
    const openModalAction = () => {
      isModalOpen.value = true
      lastOpenTime.value = new Date().toISOString()
    }

    if (!delayInMs) {
      openModalAction()
    }
    else {
      setTimeout(openModalAction, delayInMs)
    }
  }

  const isReadyToOpen = computed(() => {
    return lastOpenTime.value === null
      ? true
      : (new Date().getTime() - new Date(lastOpenTime.value).getTime()) > MIN_TIME_BETWEEN_MODALS
  })

  function trackMeaningfulInteraction() {
    meaningfulInteractions.value += 1

    if (
      meaningfulInteractions.value % EVERY_X_INTERACTIONS === 0
      && isReadyToOpen.value
    ) {
      openModal({ delayInMs: 10000 })
    }
  }

  return {
    isModalOpen,
    openModal,
    trackMeaningfulInteraction,
  }
}
