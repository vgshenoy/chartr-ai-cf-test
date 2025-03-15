<script setup>
import { toPng } from 'html-to-image'
import { debounceFilter } from '@vueuse/core'

import ChartTimeline from '@/components/charts/timeline/ChartTimeline.vue'
import ChartProsCons from '@/components/charts/prosCons/ChartProsCons.vue'
import ChartMermaid from '@/components/charts/mermaid/ChartMermaid.vue'
import ChartQuadrants from '@/components/charts/quadrants/ChartQuadrants.vue'
import ChartTable from '@/components/charts/tableChart/ChartTable.vue'

import ChartText from '@/components/charts/ChartText.vue'
import ChartButton from '@/components/charts/ChartButton.vue'
import ChartShareModal from '@/components/charts/ChartShareModal.vue'

import InChatChatInput from '@/components/chat/InChatChatInput.vue'

import { formatChatReference } from '@/utils/chat'

const isDebug = inject('isDebug', false)

const profile = inject('profile')

const props = defineProps({
  id: { // id of the chart in the database (not in-chat chartId)
    type: String,
    default: null,
  },

  isDemo: {
    type: Boolean,
    default: false,
  },

  // Use only the visibility prop for chart sharing
  visibility: {
    type: String, // 'private', 'unlisted', or 'public'
    default: 'private',
  },

  isFav: {
    type: Boolean,
    default: false,
  },

  userReaction: {
    type: String,
    default: null,
  },
  likesCount: {
    type: Number,
    default: 0,
  },

  data: {
    type: Object, // contains title, code and all chart specific data -  what the LLM generates - also called chartData
    default: () => ({}),
  },

  origin: {
    type: Object, // contains chatId and toolCallId for charts created from chats
    default: () => ({}),
  },
  username: {
    type: String,
    default: '',
  },

  createdAt: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: String,
    default: '',
  },
  dummyTimeAgo: {
    type: String,
    default: '',
  },

  isMessageLoading: { // this is not any message, but the message that created the chart
    type: Boolean,
    default: false,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },

  withReactionButtons: {
    type: Boolean,
    default: false,
  },
  withForkButton: {
    type: Boolean,
    default: false,
  },
  withShareButton: {
    type: Boolean,
    default: false,
  },
  withFavButton: {
    type: Boolean,
    default: false,
  },
  withMermaidRotateButton: {
    type: Boolean,
    default: false,
  },
  withUsername: {
    type: Boolean,
    default: true,
  },
  forkExternal: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },

  fullscreen: {
    type: Boolean,
    default: false,
  },
  allowPanZoom: {
    type: Boolean,
    default: false,
  },

  withContentDividers: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits([
  'chart-click',

  'update:data',
  'update:visibility',

  'exit-fullscreen',

  'share-chart',
  'toggle-is-fav',
  'export-chart',

  'chat-popover-open',
  'chat-popover-close',
])

defineExpose({
  enterFullscreen,
})

const isChartAuthor = computed(() => profile.value?.username === props.username)
provide('isChartAuthor', isChartAuthor)

const toast = useToast()

const title = computed(() => props.data.title)

const chartType = computed(() => getChartType(props.data))
const doesChartTypeAllowPanZoom = computed(() => chartType.value?.allowPanZoom || false)
const chartTypeId = computed(() => chartType.value?.id || '') // so that the startsWith checks below works

const chartContentRef = useTemplateRef('chart-content')

const internalId = ref(null)
watchEffect(() => {
  internalId.value = props.id
})
// Internal state for visibility
const internalVisibility = ref('private')
watchEffect(() => {
  internalVisibility.value = props.visibility
})

// is fav
const internalIsFav = ref(false)
watchEffect(() => {
  internalIsFav.value = props.isFav
})
async function toggleIsFav() {
  if (props.fullscreen) {
    emit('toggle-is-fav')
    return
  }

  // optimistic update first
  const prevIsFav = internalIsFav.value
  internalIsFav.value = !internalIsFav.value

  if (props.isDemo) {
    return navigateTo('/start')
  }

  try {
    if (!internalId.value) {
      // Create new chart with favorite status
      await createChart()
    }

    await $fetch(`/api/charts/${internalId.value}/favorite`, {
      method: !prevIsFav ? 'POST' : 'DELETE',
    })
  }
  catch (error) {
    // revert the optimistic update
    internalIsFav.value = prevIsFav

    toast.add({
      title: 'Error toggling favorite',
      description: error.message,
      color: 'red',
    })
  }
}

// reaction - restore this code that was accidentally deleted
const internalUserReaction = ref(props.userReaction)
watchEffect(() => {
  internalUserReaction.value = props.userReaction
})

const internalLikesCount = ref(props.likesCount)
watchEffect(() => {
  internalLikesCount.value = props.likesCount
})
async function setUserReaction(reaction) {
  // optimistic update
  const prevUserReaction = internalUserReaction.value
  internalUserReaction.value = reaction

  // only handling likes for now (dislikes are counted separately)

  // if null, then look at the prevUserReaction
  if (reaction === null && prevUserReaction === 'like') {
    internalLikesCount.value--
  }
  else if (reaction === 'like') {
    internalLikesCount.value++
  }

  if (props.isDemo) {
    return navigateTo(`/chat`)
  }

  try {
    await $fetch(`/api/charts/${internalId.value}/reaction`, {
      method: 'POST',
      body: { reaction },
    })
  }
  catch (error) {
    console.error('Error setting reaction', error)
    internalUserReaction.value = prevUserReaction
  }
}

const isShareModalOpen = ref(false)
async function openShareModal() {
  if (props.isDemo) {
    return navigateTo('/start')
  }

  // First make the chart at least unlisted if it's private
  if (isChartAuthor.value && internalVisibility.value === 'private') {
    await setVisibility('unlisted')
    // Show a toast notification that the chart is now unlisted
    toast.add({
      title: 'Chart made unlisted',
      description: 'Anyone with the link can now view this chart',
      color: 'green',
      icon: 'i-carbon-earth-filled',
      timeout: 3000,
    })
  }

  // Copy the link to clipboard
  copy(chartUrl.value)

  // Open the modal
  isShareModalOpen.value = true
}

const appUrl = useRuntimeConfig().public.appUrl

const chartUrl = computed(() => `${appUrl}/charts/${internalId.value || 'xxxx-xxxx-xxxx-xxxx'}`)
const { copy, copied, isSupported: isClipboardSupported } = useClipboard({
  source: chartUrl,
})

// Provide clipboard functionality for ChartShareModal
provide('copyChartUrl', copy)
provide('copiedChartUrl', copied)
provide('isClipboardSupported', isClipboardSupported)

const isForkModalOpen = ref(false)
const hasSeenForkModal = useLocalStorage('has-seen-fork-modal', false)

async function forkChart({ content = '' } = {}) {
  // return
  // if chart is not created yet, then create it
  if (!internalId.value) {
    await createChart({})
  }

  // Show modal only if user hasn't seen it before
  if (!hasSeenForkModal.value) {
    isForkModalOpen.value = true
    hasSeenForkModal.value = true
    return
  }

  // Otherwise navigate directly
  const params = new URLSearchParams()

  if (internalId.value) {
    params.set('chartId', internalId.value)
  }
  if (content) {
    params.set('q', content)
  }

  navigateTo(`/boards/new?${params.toString()}`)
}

const isFullscreenModalOpen = ref(false)
function enterFullscreen() {
  // if still loading don't enter fullscreen
  if (props.isMessageLoading.value) {
    return
  }

  isFullscreenModalOpen.value = true
}
function exitFullscreen() {
  isFullscreenModalOpen.value = false
}

const enablePanZoom = computed(() => props.allowPanZoom && doesChartTypeAllowPanZoom.value)

const chartContentWrapperInnerRef = useTemplateRef('chart-content-wrapper-inner')
const {
  resetZoom,
  zoomIn,
  zoomOut,
  panUp,
  panDown,
  panLeft,
  panRight,
} = usePanZoom(chartContentWrapperInnerRef, {
  enable: enablePanZoom,
})

const { height: chartContentWrapperInnerHeight } = useElementBounding(chartContentWrapperInnerRef)
const { height: chartContentHeight } = useElementBounding(chartContentRef)

const isChartContentOverflowing = computed(() => chartContentWrapperInnerHeight.value < chartContentHeight.value)

// this is used by Mermaid to determine if it should use max-width

const breakpoints = useMyBreakpoints()
const lgAndLarger = breakpoints.greaterOrEqual('lg')

function handleFlowchartAdjustedOrientation() {
  // TODO: issues when there is text after the chart, need to fix

  rotateFlowchart()
}

function rotateFlowchart() {
  if (props.fullscreen) {
    emit('rotate-flowchart')
    return
  }

  const newMarkup = props.data.markup.includes('LR')
    ? props.data.markup.replace(/LR/g, 'TD')
    : props.data.markup.replace(/TD/g, 'LR')

  emit('update:data', {
    ...props.data,
    markup: newMarkup,
  })
}

const isUsingMaxWidth = ref(props.fullscreen)
provide('isUsingMaxWidth', isUsingMaxWidth)

const chartboardWidth = inject('chartboardWidth', null)

if (chartboardWidth) {
  watchWithFilter(chartboardWidth, () => {
    debouncedCheckAndUpdateIsUsingMaxWidth()
  }, {
    eventFilter: debounceFilter(100),
  })
}

const chartRef = useTemplateRef('chart')
const { width: chartWidth } = useElementBounding(chartRef)

const naturalChartWidth = ref(null)

// if props.data changes, reset the natural chart width
watch(() => props.data, () => {
  naturalChartWidth.value = null
})

async function checkAndUpdateIsUsingMaxWidth() {
  if (props.fullscreen) {
    return
  }

  pauseChartWidthWatch()

  if (!naturalChartWidth.value) {
    // allow chart to grow/shrink to its natural size
    isUsingMaxWidth.value = false
    await waitUntilMaxWidthEffectsAreDone()

    if (!props.isStreaming) {
      naturalChartWidth.value = chartRef.value.offsetWidth
    }
  }

  isUsingMaxWidth.value = (naturalChartWidth.value || chartRef.value.offsetWidth) > chartRef.value.parentElement.offsetWidth

  await waitUntilMaxWidthEffectsAreDone()

  resumeChartWidthWatch()
}

const debouncedCheckAndUpdateIsUsingMaxWidth = useDebounceFn(checkAndUpdateIsUsingMaxWidth, 300)

const { pause: pauseChartWidthWatch, resume: resumeChartWidthWatch } = watchPausable(chartWidth, () => {
  debouncedCheckAndUpdateIsUsingMaxWidth()
}, {
  eventFilter: debounceFilter(100),
})

// to know if the mermaid chart is rendering
const isMermaidRendering = ref(false)
provide('isMermaidRendering', isMermaidRendering)

async function waitUntilMaxWidthEffectsAreDone() {
  async function waitUntilMermaidRenderingIsDone() {
    while (isMermaidRendering.value) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  await nextTick()

  await waitUntilMermaidRenderingIsDone()
}

watch(() => props.isStreaming, (val) => {
  if (!val && !isUsingMaxWidth.value) {
    // when chart is done streaming, check if it's using max width again
    checkAndUpdateIsUsingMaxWidth()
  }
})

defineShortcuts({
  escape: {
    usingInput: true,
    handler() {
      if (isFullscreenModalOpen.value) {
        isFullscreenModalOpen.value = false
      }

      isChatPopoverOpen.value = false
    },
  },
  arrowup: {
    whenever: [enablePanZoom],
    handler() {
      panDown()
    },
  },
  arrowdown: {
    whenever: [enablePanZoom],
    handler() {
      panUp()
    },
  },
  arrowleft: {
    whenever: [enablePanZoom],
    handler() {
      panLeft()
    },
  },
  arrowright: {
    whenever: [enablePanZoom],
    handler() {
      panRight()
    },
  },
})

const isExporting = ref(false)
provide('isExporting', isExporting)

let overlayContainer = null
const containerRef = useTemplateRef('container')

async function exportChart() {
  if (props.fullscreen) {
    emit('export-chart')
    return
  }

  const IS_DEBUG = process.env.NODE_ENV === 'development' && false

  useTrackEvent('export-chart')

  isExporting.value = true

  try {
    // create an overlay on top of the temp container to hide the temp container
    if (!overlayContainer) {
      overlayContainer = document.createElement('div')
      overlayContainer.classList.add('cho-chart-export-overlay')
      overlayContainer.style.position = 'fixed'
      overlayContainer.style.left = '0px'
      overlayContainer.style.top = '0px'
      overlayContainer.style.width = '100vw'
      overlayContainer.style.height = '100vh'
      overlayContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
      overlayContainer.style.zIndex = '1000'
      overlayContainer.style.display = 'flex'
      overlayContainer.style.alignItems = 'center'
      overlayContainer.style.justifyContent = 'center'
      overlayContainer.style.color = 'white'
      overlayContainer.style.fontSize = '24px'
      // transition appearance
      overlayContainer.style.transition = 'opacity 0.3s ease-in-out'

      // Create an icon element
      const iconElement = document.createElement('span')
      iconElement.className = 'iconify i-carbon:download flex-shrink-0 h-16 w-16'
      iconElement.setAttribute('aria-hidden', 'true')
      iconElement.style = ''

      // Append the icon to the overlayContainer
      overlayContainer.appendChild(iconElement)

      document.body.appendChild(overlayContainer)
    }

    // allow chart to grow/shrink to its natural size
    isUsingMaxWidth.value = false

    await waitUntilMaxWidthEffectsAreDone()

    // // Create a temporary container
    const tempContainer = document.createElement('div')
    tempContainer.classList.add('cho-chart-export-container')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '0px'
    tempContainer.style.top = '0px'

    // const WIDTH = container.offsetWidth
    // tempContainer.style.width = `${WIDTH}px`
    // tempContainer.style.width = '1024px'
    // tempContainer.style.height = 'auto'

    document.body.appendChild(tempContainer)

    // Clone the chart content
    const container = containerRef.value.$el
    const clonedContent = container.cloneNode(true)
    tempContainer.appendChild(clonedContent)

    // Generate PNG using html-to-image
    const dataUrl = await toPng(tempContainer, {
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight,
      pixelRatio: 2, // Increase resolution
      cacheBust: true, // Prevent caching issues
    })

    // Create download link
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${title.value || 'chart'}.png`
    link.click()

    // Clean up
    overlayContainer.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(overlayContainer)
      overlayContainer = null
    }, 100)

    if (!IS_DEBUG) {
      document.body.removeChild(tempContainer)

      // revert back to width best suited for this screen size
      checkAndUpdateIsUsingMaxWidth()
    }
  }
  catch (error) {
    console.error('Error exporting chart:', error)
    toast.add({
      title: 'Error exporting chart',
      description: error.message,
      color: 'red',
    })
  }
  finally {
    if (!IS_DEBUG) {
      isExporting.value = false
    }

    resetExportSettings()
  }
}

const exportWithTitle = ref(true)
const fontStyleOptions = [
  { label: 'Technical', value: 'technical', className: '' },
  { label: 'Simple', value: 'simple', className: 'font-sans' },
  { label: 'Bookish', value: 'bookish', className: 'font-serif' },
]
const exportFontStyle = ref(fontStyleOptions[0])

const exportPanelRef = useTemplateRef('export-panel')
onClickOutside(exportPanelRef, resetExportSettings)

// Reset export settings function
function resetExportSettings() {
  exportFontStyle.value = fontStyleOptions[0]
  exportWithTitle.value = true
}

// helper - used if chart is not yet created - from the chat
async function createChart(overrides = {}) {
  const { id } = await $fetch(`/api/charts`, {
    method: 'POST',
    body: {
      data: props.data,
      chatId: props.origin.chatId,
      toolCallId: props.origin.toolCallId,
      createdAt: props.createdAt,
      ...overrides,
    },
  })
  internalId.value = id
  return id
}

// Replace the old methods with a new one that uses visibility
async function setVisibility(value) {
  if (props.fullscreen) {
    emit('update:visibility', value)
    return
  }

  if (props.isDemo) {
    return navigateTo('/start')
  }

  if (!internalId.value) {
    await createChart({ visibility: value })
  }
  else {
    await $fetch(`/api/charts/${internalId.value}`, {
      method: 'PATCH',
      body: { visibility: value },
    })
  }
  internalVisibility.value = value

  // If making it unlisted or public, copy the link to clipboard
  if (value !== 'private') {
    copy(chartUrl.value)
  }
}

// --------------------------------
// Popover for a reference to a chart
// --------------------------------

const referenceEl = ref(null)
const topBarMiddle = useTemplateRef('top-bar-middle')

const {
  top: referenceElTop,
  left: referenceElLeft,
  width: referenceElWidth,
  height: referenceElHeight,
} = useElementBounding(referenceEl)

// popover positions will be based on this referenceEl - the chart positions
// handle click on chart content
async function handleClick(e) {
  if (props.isMessageLoading) {
    return
  }

  if (props.fullscreen) {
    return
  }

  const target = e.target
  const closestSelectable = target.closest('[data-selectable]:not([data-selectable="false"]), text, .edgeLabel, .nodeLabel')
  const text = closestSelectable?.textContent?.replace(/\n/g, ' ') || ''

  updateChatReference({
    chartId: props.data.chartId,
    title: title.value,
    text,
  })

  if (text) {
    // refer to text in chart
    referenceEl.value = closestSelectable
  }
  else {
    // refer to chart
    referenceEl.value = topBarMiddle.value

    emit('focus-chart')
  }

  setTimeout(() => {
    isChatPopoverOpen.value = true
  }, 10)

  e.stopPropagation()

  emit('chart-click')
}

const append = inject('append', null)

const isChatPopoverOpen = ref(false)
const isChatPopoverChatInputActive = ref(false)
const recalculatePopoverTriggerIndex = ref(0)

watchDebounced(isChatPopoverOpen, (val) => {
  if (val) {
    // when popover is opened, need to emit an event to hide the main chat input
    emit('chat-popover-open')
  }
  else {
    emit('chat-popover-close')
  }
}, {
  debounce: 30, // debounce because of the setTimeout in the chatPopoverItems > Ask... > click
})

const chatReference = inject('chatReference', ref({
  chartId: null,
  title: null,
  text: null,
}))

const updateChatReference = inject('updateChatReference', (reference) => {
  chatReference.value = reference
})
const resetChatReference = inject('resetChatReference', () => {
  chatReference.value = null
})

// provide it to descendants
provide('chatReference', chatReference)
provide('resetChatReference', resetChatReference)

watch(chatReference, (val) => {
  if (!val) {
    // happense if
    // 1. the chat reference is removed by hitting the X button
    // 2. the chat reference is removed after submitting to the chat

    isChatPopoverOpen.value = false
    isChatPopoverChatInputActive.value = false
  }
})

const chatPopoverItems = [
  [
    {
      label: 'Chart',
      icon: 'i-carbon-chart-multitype',
      click: (e) => {
        e.stopPropagation()

        const text = formatChatReference(chatReference.value)
        resetChatReference()

        const content = text + '\n\nChart this'

        if (append) {
          append({
            role: 'user',
            content,
          })
        }
        else {
          forkChart({ content })
        }
      },
    },
  ],
  [
    {
      label: 'Explain',
      icon: 'i-carbon-string-text',
      click: (e) => {
        e.stopPropagation()

        const text = formatChatReference(chatReference.value)
        resetChatReference()

        const content = text + '\n\nQuick explain in text'

        if (append) {
          append({
            role: 'user',
            content,
          })

          resetChatReference()
        }
        else {
          forkChart({ content })
        }
      },
    },
  ],
  [
    {
      label: 'Ask...',
      icon: 'i-carbon-chat',
      click: async (e) => {
        e.stopPropagation()

        isChatPopoverOpen.value = false
        // set the chat input to open
        isChatPopoverChatInputActive.value = true

        recalculatePopoverTriggerIndex.value++

        await nextTick()

        setTimeout(() => {
          isChatPopoverOpen.value = true
        }, 10)
      },
    },
  ],
]

const handleSubmit = inject('handleSubmit', (inputText) => {
  // this means we are not in a chat, because handleSubmit is not provided
  // so we can just fork the chart
  const text = formatChatReference(chatReference.value)

  const content = text + '\n\n' + inputText

  forkChart({ content })
})
provide('handleSubmit', handleSubmit)
</script>

<template>
  <div
    ref="chart"
    class="
    cho-chart flex flex-col gap-y-1
    relative
    "
    :class="{
      'w-full': isUsingMaxWidth,
    }"
  >
    <div
      v-if="!isExporting && !fullscreen"
      class="
      cho-chart__top-bar
      flex items-center justify-between
      whitespace-nowrap
      "
      :class="{
        invisible: isStreaming,
        // 'px-4 sm:px-6': fullscreen,
      }"
    >
      <div class="flex items-center gap-x-1">
        <UButton
          v-if="username && (withUsername || isExporting)"
          variant="link"
          color="orange"
          :to="`/profiles/${username}`"
        >
          @{{ username }}
        </UButton>

        <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2">
          {{ dummyTimeAgo || (updatedAt ? useTimeAgo(updatedAt) : useTimeAgo(createdAt)) }}
        </div>

        <slot name="top-bar-left" />
      </div>

      <div ref="top-bar-middle">
        <slot name="top-bar-middle" />
      </div>

      <div class="flex flex-wrap items-center justify-end gap-x-1">
        <ChartButton
          v-if="withForkButton"
          tooltip-text="Fork this chart"
          color="gray"
          icon="i-carbon-direction-fork"

          @click="forkChart"
        />

        <!-- export/download button with popover -->
        <UPopover>
          <ChartButton
            color="gray"
            icon="i-carbon-download"
            :loading="isExporting"
          />
          <template #panel>
            <div
              ref="export-panel"
              class="p-4 space-y-4"
            >
              <div class="space-y-6">
                <UFormGroup>
                  <DarkModeToggle mode="expanded" />
                </UFormGroup>

                <UFormGroup label="Font Style">
                  <USelectMenu
                    v-model="exportFontStyle"
                    :options="fontStyleOptions"
                  >
                    <template #option="{ option }">
                      <span :class="option.className">
                        {{ option.label }}
                      </span>
                    </template>
                    <template #label>
                      <span :class="exportFontStyle.className">
                        {{ exportFontStyle.label }}
                      </span>
                    </template>
                  </USelectMenu>
                </UFormGroup>

                <UFormGroup label="With Title?">
                  <UCheckbox v-model="exportWithTitle" />
                </UFormGroup>
              </div>
              <UButton
                color="purple"
                variant="outline"
                icon="i-carbon-download"
                @click="exportChart"
              >
                Download PNG
              </UButton>
            </div>
          </template>
        </UPopover>

        <ChartButton
          v-if="withFavButton"
          :tooltip-text="internalIsFav ? 'Remove from Saved' : 'Save'"
          :color="internalIsFav ? 'primary' : 'gray'"
          :icon="internalIsFav ? 'i-carbon-bookmark-filled' : 'i-carbon-bookmark'"
          @click="toggleIsFav"
        />
        <ChartButton
          v-if="withShareButton"
          tooltip-text="Share Chart (Makes public & copies link)"
          :color="internalVisibility !== 'private' ? 'primary' : 'gray'"
          icon="i-carbon-share"
          @click="openShareModal"
        />

        <slot name="top-bar-right" />
      </div>
    </div>

    <UCard
      ref="container"
      class="
      cho-chart__container
      min-w-[300px] select-none
      flex-grow
      "
      :class="{
        'select-none': isDebug,
        'is-message-loading': isMessageLoading,
        'is-fullscreen': fullscreen,
        'rounded-none': isExporting,
        [exportFontStyle.className]: true,
      }"
      :ui="{
        base: 'flex flex-col',
        ring: [
          'ring-1',
          !isExporting && !fullscreen && isActive
            ? 'ring-2 ring-purple-400 dark:ring-purple-600'
            : 'ring-gray-200 dark:ring-gray-800',
        ],
        background: 'bg-white dark:bg-gray-900',
        rounded: fullscreen ? 'rounded-none' : 'rounded-lg',
        shadow: isExporting ? 'shadow-none' : lgAndLarger.value ? 'shadow-xl' : 'shadow-lg',
        divide: !withContentDividers ? 'divide-transparent dark:divide-transparent' : null,
        header: {
          base: [
            'bg-white dark:bg-gray-900 rounded-t-lg',
          ],
          padding: 'px-4 py-5 sm:px-6',
        },
        body: {
          base: [
            'relative flex-grow h-full overflow-hidden',
            {
              'bg-[size:20px_20px] bg-repeat bg-[radial-gradient(circle,_#00000010_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_#ffffff10_1px,_transparent_1px)]': doesChartTypeAllowPanZoom && fullscreen,
            },
          ],
          padding: isExporting ? 'px-0 sm:px-0 sm:pb-12' : `${fullscreen ? 'py-0 sm:py-0' : 'py-8 sm:py-8'} px-0 sm:px-0`,
        },
      }"
      @click="handleClick"
    >
      <template
        v-if="exportWithTitle"
        #header
      >
        <div class="flex justify-between items-center gap-x-2 sm:gap-x-6">
          <div class="min-w-0">
            <h1
              class="prose prose-sm md:prose-base dark:prose-invert cursor-pointer max-w-none text-purple-500"
              :class="{
                'font-medium': !isExporting,
                'font-bold': isExporting,
              }"
            >
              <ChartText
                :text="title"
                tag="div"
              />
            </h1>
          </div>

          <ChartrAiLogoSvg
            v-if="isExporting"
            height="1.5rem"
            class="opacity-80"
          />
        </div>
      </template>

      <pre v-if="isDebug">
        chartId: {{ data.chartId }}
        isStreaming: {{ isStreaming }}
        isMessageLoading: {{ isMessageLoading }}
      </pre>

      <div
        class="
        cho-chart__content-wrapper
        relative h-full flex flex-col
        "
        :class="isExporting ? 'overflow-hidden' : chartTypeId.startsWith('mermaid') ? 'overflow-x-hidden overflow-y-auto' : 'overflow-auto'"
      >
        <div
          ref="chart-content-wrapper-inner"
          class="cho-chart__content-wrapper-inner h-full flex flex-col"
          :class="{
            'justify-center': !isChartContentOverflowing,
          }"
        >
          <div
            ref="chart-content"
            class="
            cho-chart__content
            px-0 py-2
            "
          >
            <ChartTimeline
              v-if="chartTypeId === 'timeline'"
              :data="data"
              :is-streaming="isStreaming"
            />

            <ChartProsCons
              v-if="chartTypeId === 'prosCons'"
              :data="data"
              :is-streaming="isStreaming"
            />

            <ChartMermaid
              v-if="chartTypeId.startsWith('mermaid')"
              :data="data"
              :is-streaming="isStreaming"
              :is-message-loading="isMessageLoading"
              @flowchart-adjusted-orientation="handleFlowchartAdjustedOrientation"
            >
              <template #error="{ error }">
                <slot
                  name="error"
                  :error="error"
                />
              </template>
            </ChartMermaid>

            <ChartQuadrants
              v-if="chartTypeId === 'quadrants'"
              :data="data"
              :is-streaming="isStreaming"
            />

            <ChartTable
              v-if="chartTypeId === 'tableChart'"
              :data="data"
              :is-streaming="isStreaming"
            />
          </div>
        </div>
      </div>

      <!-- top-right controls -->
      <div
        v-if="!isExporting"
        class="cho-chart__top-right-controls absolute top-0 right-0 py-1 px-4 sm:px-6 flex items-center gap-x-2"
      >
        <ChartButton
          v-if="withMermaidRotateButton && chartTypeId.startsWith('mermaid') && data.markup?.startsWith('flowchart')"
          tooltip-text="Rotate"
          color="gray"
          :variant="fullscreen ? 'solid': null"
          icon="i-carbon-rotate-clockwise-alt-filled"
          :disabled="isMessageLoading"
          @click="rotateFlowchart"
        />

        <template v-if="doesChartTypeAllowPanZoom">
          <ChartButton
            v-if="!isMessageLoading"
            tooltip-text="Zoom in"
            :variant="fullscreen ? 'solid': null"
            color="gray"
            icon="i-carbon-zoom-in"
            @click="allowPanZoom ? zoomIn() : enterFullscreen()"
          />
          <template v-if="allowPanZoom">
            <ChartButton
              tooltip-text="Zoom out"
              color="gray"
              :variant="fullscreen ? 'solid': null"
              icon="i-carbon-zoom-out"
              @click="zoomOut"
            />
            <ChartButton
              tooltip-text="Reset zoom"
              :variant="fullscreen ? 'solid': null"
              color="gray"
              icon="i-carbon-reset"
              @click="resetZoom"
            />
          </template>
        </template>

        <div class="order-last">
          <ChartButton
            v-if="!fullscreen"
            tooltip-text="Fullscreen"
            color="gray"
            :variant="fullscreen ? 'solid': null"
            icon="i-carbon-maximize"
            @click="enterFullscreen"
          />
          <ChartButton
            v-else
            tooltip-text="Exit fullscreen"
            color="gray"
            :variant="fullscreen ? 'solid': null"
            icon="i-carbon-minimize"
            @click="emit('exit-fullscreen')"
          />
        </div>
      </div>

      <UPopover
        v-if="isChatPopoverOpen"
        :key="recalculatePopoverTriggerIndex"
        v-model:open="isChatPopoverOpen"

        :popper="{
          placement: referenceEl.value === topBarMiddle.value ? 'top' : 'bottom-start',
          // offsetDistance: 4,
        }"
        class="fixed z-10"
        :style="{
          top: `${referenceElTop}px`,
          left: `${referenceElLeft}px`,
          width: `${referenceElWidth}px`,
          height: `${referenceElHeight}px`,
        }"
        :ui="{
          trigger: 'w-full h-full',
          width: isChatPopoverChatInputActive ? 'w-full max-w-sm' : '',
          rounded: 'rounded-lg',
          overlay: {
            background: 'bg-transparent dark:bg-transparent',
          },
          ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
          shadow: 'shadow-lg',
        }"
      >
        <div class="bg-primary-500/10 w-full h-full rounded-lg" />
        <template #panel>
          <div class="cho-chart__popover-panel">
            <UButtonGroup
              v-if="!isChatPopoverChatInputActive"
              class="p-0"
            >
              <ChatSuggestionButton
                v-for="group in chatPopoverItems"
                :key="group[0].label"
                :icon="group[0].icon"
                :text="group[0].label"
                :label="group[0].label"
                @click="group[0].click"
              />
            </UButtonGroup>

            <InChatChatInput
              v-if="isChatPopoverChatInputActive"
              class="w-full"
            />
          </div>
        </template>
      </UPopover>

      <template
        v-if="data.isIllustrative || data.footnotes?.length > 0"
        #footer
      >
        <div
          class="
        cho-chart__footer
        text-xs text-gray-500
        prose prose-sm dark:prose-invert max-w-none
        "
        >
          <ul>
            <li v-if="data.isIllustrative">
              <span class="font-bold">
                Illustrative
              </span>
              - This chart is illustrative and not all inclusive.
            </li>
            <li
              v-for="footnote in data.footnotes"
              :key="footnote"
            >
              {{ footnote }}
            </li>
          </ul>
        </div>
      </template>
    </UCard>

    <div
      v-if="!isExporting"
      class="
    cho-chart__bottom-bar
    flex items-center justify-between
    text-xs md:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap
    "
    >
      <div class="flex items-center gap-x-2 divide-x divide-gray-300 dark:divide-gray-700">
        <template
          v-if="withReactionButtons && (internalVisibility === 'public' || isDemo)"
        >
          <div class="pr-2 flex items-center gap-x-2">
            <ChartButton
              :tooltip-text="internalUserReaction === 'like' ? 'Unlike' : 'Like'"
              :color="internalUserReaction === 'like' ? 'primary' : 'gray'"
              :icon="internalUserReaction === 'like' ? 'i-carbon-thumbs-up-filled' : 'i-carbon-thumbs-up'"
              @click="internalUserReaction === 'like' ? setUserReaction(null) : setUserReaction('like')"
            />
            <p>
              {{ internalLikesCount }} {{ internalLikesCount === 1 ? 'like' : 'likes' }}
            </p>
          </div>
        </template>

        <div>
          <slot name="bottom-bar-left" />
        </div>
      </div>
      <div ref="bottom-bar-middle">
        <slot name="bottom-bar-middle" />
      </div>
      <div>
        <slot name="bottom-bar-right" />
      </div>
    </div>

    <UModal v-model="isForkModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-base">
            <div class="flex items-center gap-x-3">
              <UIcon name="i-carbon-direction-fork" />
              <div class="flex items-center gap-x-2">
                Fork this chart
              </div>
            </div>
          </h3>
        </template>
        <div class="prose prose-sm dark:prose-invert">
          <ul>
            <li class="flex items-center gap-x-2">
              <UIcon
                name="i-carbon-template"
                class="flex-none w-4 h-4"
              />
              Use as a template for new charts
            </li>
            <li class="flex items-center gap-x-2">
              <UIcon
                name="i-carbon-chat"
                class="flex-none w-4 h-4"
              />
              Ask follow-ups
            </li>
            <li class="flex items-center gap-x-2">
              <UIcon
                name="i-carbon-explore"
                class="flex-none w-4 h-4"
              />
              Continue exploring this topic
            </li>
          </ul>
        </div>
        <template #footer>
          <div class="flex justify-end gap-x-2">
            <UButton
              icon="i-carbon-direction-fork"
              @click="forkChart"
            >
              Fork
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal
      v-if="!fullscreen"
      v-model="isFullscreenModalOpen"
      fullscreen
      prevent-close
      :ui="{
        fullscreen: 'w-screen h-svh',
      }"
    >
      <Chart
        v-bind="{
          ...props,
          isFav: internalIsFav,
        }"
        fullscreen
        allow-pan-zoom
        with-content-dividers
        class="h-full"
        @exit-fullscreen="exitFullscreen"

        @toggle-is-fav="toggleIsFav"
        @update:visibility="setVisibility"
        @export-chart="exportChart"

        @rotate-flowchart="rotateFlowchart"
      />
    </UModal>

    <ChartShareModal
      v-model:is-open="isShareModalOpen"
      :visibility="internalVisibility"
      :chart-id="internalId"
      :chart-title="data.title"
      :is-chart-author="isChartAuthor"
      :chart-url="chartUrl"
      @update:visibility="setVisibility"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.data-selectable),
:deep([data-selectable]:not([data-selectable='false'])),
:deep(text),
:deep(.edgeLabel),
:deep(.nodeLabel) {
  @apply cursor-pointer;
  &:hover {
    color: rgb(var(--color-primary-500)) !important;
  }
}
</style>
