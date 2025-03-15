import mermaid from 'mermaid'
import chroma from 'chroma-js'

const THROTTLE_DELAY = 75

export function useMermaid({
  markup, // maybeRef
  isStreaming, // ref
  handleFlowchartAdjustedOrientation,
  isMessageLoading, // ref
}) {
  const xlAndLarger = useMyBreakpoints().greaterOrEqual('xl')
  const mermaidContainerRef = ref(null)

  const isDebug = inject('isDebug', false)

  const isUsingMaxWidth = inject('isUsingMaxWidth', ref(false))

  const colorMode = useColorMode()
  const markupRef = toRef(markup)
  const error = ref(null)

  const isRendering = inject('isMermaidRendering', ref(false))

  const isInitialRender = ref(true)

  const flowchartAdjustedOrientation = ref(null)

  function initializeMermaid() {
    mermaid.initialize({
      theme: colorMode.value === 'dark' ? 'dark' : 'default',
      themeVariables: {
        // fontFamily: 'JetBrains Mono, monospace',
        fontFamily: 'inherit',
        fontSize: xlAndLarger.value ? '14px' : '12px',
      },
      flowchart: {
        useMaxWidth: isUsingMaxWidth.value,
        htmlLabels: true,
        subGraphTitleMargin: {
          top: 5,
          bottom: 20,
        },
        padding: 8,
        nodeSpacing: 50,
        rankSpacing: 50,
      },
      sequence: {
        useMaxWidth: isUsingMaxWidth.value,
      },
      state: {
        useMaxWidth: isUsingMaxWidth.value,
      },
      mindmap: {
        useMaxWidth: isUsingMaxWidth.value,
      },
    })
  }

  function reInitialize() {
    initializeMermaid()
  }

  const adjustedMarkup = computed(() => {
    // First replace escaped newlines with actual newlines
    let ret = markupRef.value.replace(/\\n/g, '\n')
    ret = ret.replace(/<NL>/g, '\n')

    // Remove spaces before newlines
    ret = ret.replace(/\s+\n/g, '\n')

    // Apply orientation adjustment if needed
    if (flowchartAdjustedOrientation.value && ret.startsWith('flowchart')) {
      ret = ret.replace(/flowchart (LR|TD)/, `flowchart ${flowchartAdjustedOrientation.value}`)
    }

    // Then split into lines and handle streaming
    const lines = ret.split('\n')

    ret = isStreaming.value
      ? lines.length > 3
        ? lines.slice(0, -2).join('\n')
        : ''
      : ret

    // Add class definition for flowcharts
    if (ret.startsWith('flowchart')) {
      ret = `${ret}\nclassDef default text-align:left;`
    }

    if (colorMode.value === 'dark') {
      ret = ret
        .replace(/fill:#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g, (match, hexcode) => {
          // Expand 3-digit hex to 6-digit if needed
          const fullHex = hexcode.length === 3
            ? hexcode.split('').map(c => c + c).join('')
            : hexcode
          return `fill:${chroma(fullHex).darken(3)}`
        })
        .replace(/stroke:#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g, (match, hexcode) => {
          const fullHex = hexcode.length === 3
            ? hexcode.split('').map(c => c + c).join('')
            : hexcode
          return `stroke:${chroma(fullHex).brighten(1.5)}`
        })
        .replace(/color:#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g, (match, hexcode) => {
          const fullHex = hexcode.length === 3
            ? hexcode.split('').map(c => c + c).join('')
            : hexcode
          return `color:${chroma(fullHex).brighten(1.5)}`
        })
    }
    return ret
  })

  async function parse() {
    return await mermaid.parse(adjustedMarkup.value)
  }

  const id = useId()

  const resetMinDimensions = useDebounceFn(() => {
    if (mermaidContainerRef.value) {
      mermaidContainerRef.value.style.minHeight = ''
      mermaidContainerRef.value.style.minWidth = ''
    }
  }, THROTTLE_DELAY)

  async function render() {
    if (!markupRef.value)
      return

    isRendering.value = true
    error.value = null

    initializeMermaid()

    try {
      await parse()

      try {
        // Only preserve dimensions if not initial render
        if (!isInitialRender.value) {
          const currentHeight = mermaidContainerRef.value?.offsetHeight || 0
          const currentWidth = mermaidContainerRef.value?.offsetWidth || 0

          if (currentHeight && currentWidth) {
            mermaidContainerRef.value.style.minHeight = `${currentHeight}px`
            mermaidContainerRef.value.style.minWidth = `${currentWidth}px`
          }
        }

        const { svg } = await mermaid.render(id, adjustedMarkup.value)
        mermaidContainerRef.value.innerHTML = svg

        error.value = null

        // Only reset dimensions if not initial render
        if (!isInitialRender.value)
          resetMinDimensions()
        else
          isInitialRender.value = false
      }
      catch (err) {
        if (isDebug.value)
          console.error('Mermaid parsing error:', err)
      }

      isRendering.value = false

      if (!checkAspectRatio() && isStreaming.value) {
        // Set to opposite of current orientation
        const currentOrientation = markupRef.value.match(/flowchart (LR|TD)/)?.[1]
        flowchartAdjustedOrientation.value = currentOrientation === 'LR' ? 'TD' : 'LR'
      }
    }
    catch (err) {
      error.value = err

      if (isDebug.value) {
        console.log('mermaid.parse error', err)
      }
    }
  }

  const debouncedRender = useDebounceFn(render, 100)

  watch(() => colorMode.value, debouncedRender)

  watch(() => isUsingMaxWidth.value, render)

  onMounted(async () => {
    // mermaidContainerRef.value.id = id
    await debouncedRender()
  })
  // render()

  const throttledRender = useThrottleFn(render, THROTTLE_DELAY)
  watch(markupRef, throttledRender)

  // one final render after streaming is done to ensure last change is rendered
  watch(isStreaming, (val) => {
    if (!val) {
      // one final render after throttle + 50
      setTimeout(async () => {
        await render()
      }, THROTTLE_DELAY + 50)
    }
  })

  watch(isMessageLoading, (val) => {
    // after message is done loading, remove adjusted orientation
    if (!val) {
      if (flowchartAdjustedOrientation.value) {
        handleFlowchartAdjustedOrientation()
        flowchartAdjustedOrientation.value = null
      }
    }
  })

  function checkAspectRatio() {
    // do only for flowcharts
    if (!markupRef.value.startsWith('flowchart')) {
      return
    }

    const mermaidSvg = mermaidContainerRef.value?.children[0]
    if (!mermaidSvg) {
      return
    }
    const { width, height } = mermaidSvg.getBoundingClientRect()
    const aspectRatio = width / height

    return aspectRatio <= 3
  }

  return {
    reInitialize,
    render,
    isRendering,
    error,
    adjustedMarkup,
    mermaidContainerRef,
    checkAspectRatio,
    isInitialRender,
    flowchartAdjustedOrientation,
  }
}
