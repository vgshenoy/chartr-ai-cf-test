import Panzoom from '@panzoom/panzoom'

export function usePanZoom(elementRef, { enable = true, allowWheelWithMetaOnly = false } = {}) {
  let panzoomInstance = null
  const enableRef = toRef(enable)

  onMounted(() => {
    initPanZoom()
  })

  function initPanZoom() {
    if (elementRef.value && enableRef.value) {
      panzoomInstance = Panzoom(elementRef.value, {
        maxScale: 10,
        minScale: 0.25,
        step: 0.2,
      })

      if (!allowWheelWithMetaOnly) {
        addWheelEvent()
      }
    }
  }

  const { meta, meta_0 } = useMagicKeys()

  watch(meta_0, (newValue) => {
    if (newValue) {
      if (panzoomInstance) {
        panzoomInstance.reset()
      }
    }
  })

  watch(meta, (newValue) => {
    if (!allowWheelWithMetaOnly) {
      return
    }

    if (newValue) {
      addWheelEvent()
    }
    else {
      removeWheelEvent()
    }
  })

  function addWheelEvent() {
    if (!panzoomInstance) {
      initPanZoom()
    }

    if (elementRef.value && panzoomInstance) {
      elementRef.value.addEventListener('wheel', panzoomInstance.zoomWithWheel)
    }
  }

  function removeWheelEvent() {
    if (elementRef.value && panzoomInstance) {
      elementRef.value.removeEventListener('wheel', panzoomInstance.zoomWithWheel)
    }
  }

  function cleanup() {
    if (panzoomInstance) {
      removeWheelEvent()
      panzoomInstance.reset()
      panzoomInstance.destroy()
      panzoomInstance = null
    }
  }

  onBeforeUnmount(cleanup)

  watch(enableRef, (newValue) => {
    // console.log('enableRef', newValue)
    if (panzoomInstance) {
      cleanup()
    }
    if (newValue) {
      initPanZoom()
    }
  })

  function resetZoom() {
    if (panzoomInstance) {
      panzoomInstance.reset()
    }
  }

  function zoomIn() {
    if (panzoomInstance) {
      panzoomInstance.zoomIn()
    }
  }

  function zoomOut() {
    if (panzoomInstance) {
      panzoomInstance.zoomOut()
    }
  }

  function panUp(amount = 100) {
    if (panzoomInstance) {
      panzoomInstance.pan(0, -amount, { relative: true, animate: true })
    }
  }

  function panDown(amount = 100) {
    if (panzoomInstance) {
      panzoomInstance.pan(0, amount, { relative: true, animate: true })
    }
  }

  function panLeft(amount = 100) {
    if (panzoomInstance) {
      panzoomInstance.pan(-amount, 0, { relative: true, animate: true })
    }
  }

  function panRight(amount = 100) {
    if (panzoomInstance) {
      panzoomInstance.pan(amount, 0, { relative: true, animate: true })
    }
  }

  return {
    resetZoom,
    zoomIn,
    zoomOut,
    panUp,
    panDown,
    panLeft,
    panRight,
  }
}
