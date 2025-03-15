import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'

interface PanZoomOptions {
  minZoom?: number
  maxZoom?: number
  zoomOnScroll?: boolean
  zoomOnPinch?: boolean
  panOnScroll?: boolean
  panOnScrollMode?: 'free' | 'horizontal' | 'vertical'
  panOnDrag?: boolean
  preventScrolling?: boolean
}

interface FitViewOptions {
  padding?: number
  duration?: number
  includeHiddenNodes?: boolean
}

interface ElementBounds {
  x: number
  y: number
  width: number
  height: number
}

export function usePanZoom(container: HTMLElement, options: PanZoomOptions = {}) {
  const {
    minZoom = 0.1,
    maxZoom = 4,
    zoomOnScroll = true,
    zoomOnPinch = true,
    panOnScroll = false,
    panOnScrollMode = 'free',
    panOnDrag = true,
    preventScrolling = true,
  } = options

  const zoom = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const isPanning = ref(false)

  let zoomBehavior: d3.ZoomBehavior<HTMLElement, unknown>

  // Initialize zoom behavior
  onMounted(() => {
    zoomBehavior = d3.zoom<HTMLElement, unknown>()
      .scaleExtent([minZoom, maxZoom])
      .on('zoom', (event) => {
        const { x, y, k } = event.transform
        zoom.value = k
        translateX.value = x
        translateY.value = y
      })

    // Apply zoom behavior to container
    const selection = d3.select(container)
    selection.call(zoomBehavior)

    // Configure zoom/pan options
    if (!zoomOnScroll) {
      selection.on('wheel.zoom', null)
    }

    if (!panOnDrag) {
      selection.on('mousedown.zoom', null)
    }

    if (preventScrolling) {
      selection.on('wheel', (event) => {
        event.preventDefault()
      })
    }

    // Handle pan on scroll
    if (panOnScroll) {
      selection.on('wheel', (event) => {
        event.preventDefault()
        const delta = event.deltaY

        switch (panOnScrollMode) {
          case 'horizontal':
            translateX.value += delta
            break
          case 'vertical':
            translateY.value += delta
            break
          default:
            translateX.value += delta
            translateY.value += delta
        }

        selection.call(
          zoomBehavior.transform,
          d3.zoomIdentity.translate(translateX.value, translateY.value).scale(zoom.value),
        )
      })
    }
  })

  // Clean up event listeners
  onBeforeUnmount(() => {
    if (zoomBehavior) {
      d3.select(container).on('.zoom', null)
    }
  })

  // Helper to get element bounds including all children
  function getElementBounds(element: HTMLElement): ElementBounds {
    const bounds = element.getBoundingClientRect()
    const containerBounds = container.getBoundingClientRect()

    return {
      x: bounds.left - containerBounds.left,
      y: bounds.top - containerBounds.top,
      width: bounds.width,
      height: bounds.height,
    }
  }

  // Reset transform to initial state
  function resetTransform(duration = 0) {
    d3.select(container)
      .transition()
      .duration(duration)
      .call(
        zoomBehavior.transform,
        d3.zoomIdentity,
      )
  }

  // Set specific transform values
  function setTransform(x: number, y: number, scale: number, duration = 0) {
    d3.select(container)
      .transition()
      .duration(duration)
      .call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(x, y).scale(scale),
      )
  }

  // Fit view to container bounds
  function fitView(options: FitViewOptions = {}) {
    const {
      padding = 0.1,
      duration = 0,
      includeHiddenNodes = false,
    } = options

    const bounds = container.getBoundingClientRect()
    const containerWidth = bounds.width
    const containerHeight = bounds.height

    const scale = Math.min(
      containerWidth / (containerWidth * (1 + padding)),
      containerHeight / (containerHeight * (1 + padding)),
    )

    setTransform(
      (containerWidth - containerWidth * scale) / 2,
      (containerHeight - containerHeight * scale) / 2,
      scale,
      duration,
    )
  }

  // Fit view to specific element
  function fitToElement(element: HTMLElement, options: FitViewOptions = {}) {
    const {
      padding = 0.1,
      duration = 0,
    } = options

    const elementBounds = getElementBounds(element)
    const containerBounds = container.getBoundingClientRect()

    // Calculate the scale needed to fit the element
    const scaleX = containerBounds.width / (elementBounds.width * (1 + padding))
    const scaleY = containerBounds.height / (elementBounds.height * (1 + padding))
    const scale = Math.min(scaleX, scaleY)

    // Calculate center position
    const centerX = elementBounds.x + elementBounds.width / 2
    const centerY = elementBounds.y + elementBounds.height / 2

    // Calculate the transform to center the element
    const x = (containerBounds.width / 2) - (centerX * scale)
    const y = (containerBounds.height / 2) - (centerY * scale)

    setTransform(x, y, scale, duration)
  }

  // Fit view to multiple elements
  function fitToElements(elements: HTMLElement[], options: FitViewOptions = {}) {
    const {
      padding = 0.1,
      duration = 0,
    } = options

    // Get combined bounds of all elements
    const bounds = elements.reduce((acc, element) => {
      const elementBounds = getElementBounds(element)

      return {
        x: Math.min(acc.x, elementBounds.x),
        y: Math.min(acc.y, elementBounds.y),
        width: Math.max(acc.width, elementBounds.x + elementBounds.width),
        height: Math.max(acc.height, elementBounds.y + elementBounds.height),
      }
    }, { x: Infinity, y: Infinity, width: -Infinity, height: -Infinity })

    bounds.width -= bounds.x
    bounds.height -= bounds.y

    const containerBounds = container.getBoundingClientRect()

    // Calculate the scale needed to fit all elements
    const scaleX = containerBounds.width / (bounds.width * (1 + padding))
    const scaleY = containerBounds.height / (bounds.height * (1 + padding))
    const scale = Math.min(scaleX, scaleY)

    // Calculate center position
    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2

    // Calculate the transform to center the elements
    const x = (containerBounds.width / 2) - (centerX * scale)
    const y = (containerBounds.height / 2) - (centerY * scale)

    setTransform(x, y, scale, duration)
  }

  return {
    // State
    zoom,
    translateX,
    translateY,
    isPanning,

    // Methods
    resetTransform,
    setTransform,
    fitView,
    fitToElement,
    fitToElements,
  }
}
