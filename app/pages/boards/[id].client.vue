<script setup>
import { useChat } from '@ai-sdk/vue'

import { generateId } from 'ai'

import Chart from '~/components/charts/Chart.vue'
import ChartThumb from '~/components/charts/ChartThumb.vue'
import ChartLoadingIcon from '~/components/charts/ChartLoadingIcon.vue'
import ChartButton from '~/components/charts/ChartButton.vue'

import Chat from '~/components/chat/Chat.vue'
import ChatSuggestions from '~/components/chat/ChatSuggestions.vue'

import { useNewChatOptions } from '~/composables/chat/useNewChatOptions'
import { useMessageParser, formatChartDataToText, formatParsedMessages } from '~/composables/chat/useMessageParser'

import InChatChatInput from '~/components/chat/InChatChatInput.vue'

import { formatChatReference } from '~/utils/chat'

definePageMeta({
  // layout: 'header-layout',
})

const toast = useToast()

const title = ref('')

useSeoMeta({
  title: () => `${title.value || 'Chat'} | chartr.ai`,
})

const storedCharts = ref([])

const profile = inject('profile')

const newChatOptions = useNewChatOptions()

const route = useRoute()
const id = computed(() => route.params.id)

const isFetchingChat = ref(false)

const { trackMeaningfulInteraction } = useFeedback()

const useAlternateModel = ref(false)

const chatReference = ref(null) // right now of the form { chartId, title, text }
function updateChatReference(reference) {
  chatReference.value = reference
}
function resetChatReference() {
  chatReference.value = null
}
provide('chatReference', chatReference)
provide('updateChatReference', updateChatReference)
provide('resetChatReference', resetChatReference)

const {
  messages,
  input,
  append,
  setMessages,
  status,
  stop,
} = useChat({
  api: `/api/chats/${id.value}`,
  async onFinish(_message, { finishReason }) {
    // if finishReason is 'length', show a toast
    if (finishReason === 'length') {
      toast.add({
        title: 'Error',
        description: 'Exceeded max message length, try generating fewer and smaller charts at a time.',
        color: 'red',
      })
    }

    await updateMessages()

    updateTitle()

    // track meaningful interaction
    trackMeaningfulInteraction()

    // setActiveChartId(null)
  },
  onError(error) {
    if (error.message.includes('429')) {
      toast.add({
        title: 'Rate limit exceeded',
        description: 'Please try again later.',
        color: 'orange',
      })
    }
    else {
      toast.add({
        title: 'Error',
        description: 'Something went wrong, please try again later.',
        color: 'red',
      })
    }
  },
})

provide('input', input)
provide('stop', stop)
provide('append', append)

function handleSubmit() {
  let content = ``

  if (chatReference.value) {
    content = formatChatReference(chatReference.value)

    resetChatReference()
  }

  content += `\n\n${input.value}`

  append({
    role: 'user',
    content,
  })
}
provide('handleSubmit', handleSubmit)

function handleSuggestion(prompt) {
  append({
    role: 'user',
    content: prompt,
  })
}
provide('handleSuggestion', handleSuggestion)

const isChatLoading = computed(() => status.value === 'submitted' || status.value === 'streaming' || isFetchingChat.value)
provide('isChatLoading', isChatLoading)

// for when user scrolls up in the chartboard, no need to scroll to the chart when a new chart is added
// reset this when chat is done loading
const autoScrollToChart = ref(true)

const chartBoardRef = useTemplateRef('chart-board')
const { directions } = useScroll(chartBoardRef)
const { top: isScrollingUpOnChartBoard } = toRefs(directions)

watch(isScrollingUpOnChartBoard, (isScrollingUp) => {
  if (isScrollingUp && isChatLoading.value) {
    autoScrollToChart.value = false
  }
})

watch(isChatLoading, (val) => {
  // when chat is done loading, set back autoScrollToChart to true
  if (!val) {
    autoScrollToChart.value = true
  }
})

const { parsedMessages } = useMessageParser({
  messages,
})
provide('parsedMessages', parsedMessages)

const nonChartSegmentsOrParts = computed(() =>
  parsedMessages.value
    .filter(message => message.parts)
    .map(message => message.parts.map((part) => {
      if (message.role === 'user') {
        return part
      }
      else if (part.type === 'text') {
        return part.segments?.filter(segment => segment.type === 'markdown')
      }
      else {
        return part
      }
    }),
    )
    .flat()
    .flat(),
)
watch(() => nonChartSegmentsOrParts.value.length, () => {
  if (isFetchingChat.value) {
    return
  }
  isChatExpanded.value = true
})

const allCharts = computed(() => {
  return parsedMessages.value
    .map((pm, idx) => ({
      ...pm,
      isLoading: idx === parsedMessages.value.length - 1 && isChatLoading.value, // add isLoading to the last message if it is loading from useChat
    }))
    .map(pm =>
      pm.parts
        .filter(part => part.segments)
        .map(part => part.segments
          .filter(segment => segment.type === 'artifact')
          .map((segment) => {
            return {
              data: segment.content,
              isStreaming: segment.isStreaming,
              isMessageLoading: pm.isLoading,
              createdAt: new Date(pm.createdAt).toISOString(),
            }
          }),
        )
        .flat(),
    )
    .flat()
})

const allChartIds = computed(() =>
  allCharts.value.map(chart => chart.data.chartId),
)
watch(() => allChartIds.value.length, async () => {
  if (isFetchingChat.value) {
    return
  }

  if (!splitScreen.value) {
    isChatExpanded.value = false
  }

  await nextTick()

  const lastChartId = allChartIds.value[allChartIds.value.length - 1]
  setActiveChartId(lastChartId)
})

const sources = computed(() => {
  // Eg. {
  //   type: 'toolInvocation',
  //   name: 'fetchUserSuppliedUrl',
  //   url: 'https://example.com',
  // }
  // {
  //   type: 'toolInvocation',
  //   name: 'fetchUserSuppliedYoutubeVideo',
  //   url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  // }
  // {
  //   type: 'text',
  //   text: 'This would be some long text that the user typed in, spoke out load or pasted in.',
  // }
  // {
  //   type: 'pdf',
  //   url: 'https://example.com/example.pdf',
  // }
  // {
  //   type: 'image',
  //   url: 'https://example.com/example.png',
  // }
  return parsedMessages.value
    .filter(message => message.role === 'assistant')
    .map(message => message.parts.filter(part => part.type === 'tool-invocation'))
    .flat()
})

const activeChartId = ref(null)
const activeChartIdIndex = computed(() => allChartIds.value.findIndex(chartId => chartId === activeChartId.value))
function isChartIdActive({ chartId }) {
  return activeChartId.value === chartId
}

// set the active chart id, AND scroll to it
async function setActiveChartId(chartId) {
  activeChartId.value = chartId

  if (!chartId) {
    resetChatReference()
    return
  }

  await nextTick()

  if (autoScrollToChart.value) {
    scrollToChart(chartId)
  }
}

const isProgrammaticScrolling = ref(false)
const chartContainerRefs = ref({})

async function scrollToChart(chartId, { ongoingTimeout = 1000, forceTop = false } = {}) {
  isProgrammaticScrolling.value = true

  const chartContainer = chartContainerRefs.value[chartId]
  if (chartContainer) {
    // Only scroll if chart is not already visible in the viewport
    if (!visibleCharts.value.has(chartId) || forceTop) {
      chartContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  setTimeout(() => {
    isProgrammaticScrolling.value = false
  }, ongoingTimeout)
}

// Track which charts are currently visible in the viewport
const visibleCharts = ref(new Set())

function handleChartIntersection(isIntersecting, chartId) {
  if (isProgrammaticScrolling.value) {
    return
  }

  // Update the visibleCharts set based on intersection
  if (isIntersecting) {
    visibleCharts.value.add(chartId)
  }
  else {
    visibleCharts.value.delete(chartId)
  }
}

// based on id, init (or re-init) the chat
watch(id, async (newId) => {
  if (!newId) return

  // Reset states
  setMessages([])
  input.value = ''
  title.value = ''
  storedCharts.value = []
  activeChartId.value = null
  resetChatReference() // Reset chat reference when ID changes

  try {
    // Check if we have newChatOptions
    if (newChatOptions.value.chartId || newChatOptions.value.q) {
      // Handle fork case
      if (newChatOptions.value.chartId) {
        const chartRecord = await $fetch(`/api/charts/${newChatOptions.value.chartId}`)

        const assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: formatChartDataToText({
            ...chartRecord.data,
            isFork: true,
            chartId: `${chartRecord.data.chartId}`,
          }),
          createdAt: new Date().toISOString(),
        }

        if (newChatOptions.value.q) {
          setMessages([assistantMessage])
          append({
            role: 'user',
            content: newChatOptions.value.q,
          })
        }
        else {
          append(assistantMessage)
        }

        // Record the fork action
        await $fetch(`/api/charts/${newChatOptions.value.chartId}/fork`, {
          method: 'POST',
        })
      }
      // Handle direct question case
      else if (newChatOptions.value.q) {
        append({
          role: 'user',
          content: newChatOptions.value.q,
        })
      }

      // Reset newChatOptions after applying
      newChatOptions.value = {
        q: '',
        chartId: '',
      }
    }
    // If no newChatOptions, load existing chat
    else {
      isFetchingChat.value = true
      const chat = await $fetch(`/api/chats/${id.value}`)
      setMessages(chat.messages)

      await nextTick()

      isFetchingChat.value = false

      if (chat.title) {
        title.value = chat.title
      }
      else {
        await updateTitle()
      }

      const storedCharts = await $fetch(`/api/charts?chatId=${id.value}`)
      storedCharts.value = storedCharts.map(chart => ({
        ...chart,
        isFav: chart.is_fav,
      }))
    }
  }
  catch (error) {
    console.error('Error initializing chat:', error)
    navigateTo('/start')
  }
}, { immediate: true })

// Store pending chart updates
const pendingChartUpdates = ref(new Map())

// Debounced function to process batched updates
const processPendingUpdates = useDebounceFn(async () => {
  if (pendingChartUpdates.value.size === 0) return

  // Create new messages array with updates
  const updatedParsedMessages = parsedMessages.value.map((message) => {
    // Skip non-assistant messages
    if (message.role !== 'assistant') return message

    return {
      ...message,
      parts: message.parts.map((part) => {
        if (part.type !== 'text') return part

        return {
          ...part,
          segments: part.segments?.map((segment) => {
            if (segment.type !== 'artifact') return segment

            const update = pendingChartUpdates.value.get(segment.content.chartId)
            if (!update) return segment

            return {
              ...segment,
              content: update,
            }
          }),
        }
      }),
    }
  })

  const updatedMessages = formatParsedMessages(updatedParsedMessages)

  // Clear pending updates
  pendingChartUpdates.value.clear()

  // Update messages
  setMessages(updatedMessages)
  await updateMessages()
}, 100)

// Handler for chart data updates
async function handleChartDataUpdate({ data: chart, chartId }) {
  // Store update in pending map
  pendingChartUpdates.value.set(chartId, chart)

  // Trigger debounced processing
  processPendingUpdates()
}

const showTipNodeClick = useLocalStorage('showTipNodeClick', true)
function handleTipClose() {
  showTipNodeClick.value = false
}

function nextChart() {
  append({
    role: 'user',
    content: 'Next Chart',
  })
}
provide('nextChart', nextChart)

async function updateMessages() {
  // update the messages in the database via API
  try {
    await $fetch(`/api/chats/${id.value}`, {
      method: 'PATCH',
      body: {
        messages: messages.value,
      },
    })
  }
  catch (error) {
    console.error('Error updating messages:', error)
  }
}

async function updateTitle() {
  if (!title.value) {
    const { title: newTitle } = await $fetch(`/api/chats/${id.value}/title`, {
      method: 'POST',
    })
    title.value = newTitle
  }
}

// Add functions for title editing
const isEditingTitle = ref(false)
const editedTitle = ref('')

function openTitleEditor() {
  editedTitle.value = title.value
  isEditingTitle.value = true
}

async function saveTitle() {
  try {
    const { title: updatedTitle } = await $fetch(`/api/chats/${id.value}/title`, {
      method: 'PUT',
      body: {
        title: editedTitle.value,
      },
    })

    title.value = updatedTitle
    isEditingTitle.value = false

    toast.add({
      title: 'Success',
      description: 'Board title updated',
      color: 'green',
    })
  }
  catch (error) {
    console.error('Error updating title:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to update title',
      color: 'red',
    })
  }
}

function getStoredChart({ chartId }) {
  return storedCharts.value.find(chart => chart.data.chartId === chartId)
}

function handleChartThumbnailClick(chartId) {
  // if the chartId is on the board (i.e. it's an active chart)
  if (charts.value.some(chart => chart.data.chartId === chartId)) {
    setActiveChartId(chartId)
  }
  // if the chartId is not on the board (i.e. it's an older version), then update the chart version (that will make it the active chart)
  else {
    handleUpdateChartVersion(chartId)
  }

  if (!lgAndLarger.value) {
    isChatExpanded.value = false
  }
}

async function scrollToChartThumbnail(chartId, { behavior = 'smooth', block = 'start' } = {}) {
  const chartThumb = document.getElementById(`chart-thumb_${chartId}`)
  if (chartThumb) {
    chartThumb.scrollIntoView({ behavior, block })
  }
}

defineShortcuts({
  meta_b: {
    usingInput: true,
    handler: () => {
      isChatExpanded.value = !isChatExpanded.value
    },
  },
  // have shortcuts for up/down to navigate through the charts
  arrowleft: {
    usingInput: false,
    // whenever: [!input.value],
    handler: () => {
      // move to the previous chart
      if (activeChartIdIndex.value > 0) {
        setActiveChartId(allChartIds.value[activeChartIdIndex.value - 1], { ongoingTimeout: 100 })
      }
    },
  },
  arrowright: {
    usingInput: false,
    // whenever: [!input.value],
    handler: () => {
      // move to the next chart
      if (activeChartIdIndex.value < allChartIds.value.length - 1) {
        setActiveChartId(allChartIds.value[activeChartIdIndex.value + 1], { ongoingTimeout: 100 })
      }
    },
  },

})

// Add a Set to track which charts already have observers
const observedCharts = ref(new Set())

// Modify the setup function for chart intersections
function setupChartIntersection(chartId) {
  // Skip if already observed
  if (observedCharts.value.has(chartId)) return

  const target = chartContainerRefs.value[chartId]
  if (!target) return

  useIntersectionObserver(
    target,
    ([{ isIntersecting }]) => {
      handleChartIntersection(isIntersecting, chartId)
    },
    {
      threshold: 0.1,
    },
  )

  // Mark this chart as observed
  observedCharts.value.add(chartId)
}

// Watch for new chart containers and set up observers
watch(chartContainerRefs, (newRefs) => {
  Object.entries(newRefs).forEach(([chartId, _]) => {
    setupChartIntersection(chartId)
  })
}, { deep: true })

function handleFixError({ chartId, errorMessage }) {
  append({
    role: 'user',
    content: `
      <automated_message>
        Error in chart: ${chartId}
        Error: ${JSON.stringify(errorMessage)}.
        Do not explain the error or reply. Just make the correction and draw the chart again.
      </automated_message>
    `,
  })
}

function groupCharts(acs) { // acs - all charts
  // Create a map to group charts by their base chart ID
  const groupedMap = new Map()

  // Group charts by their base chart ID
  acs.forEach((chart) => {
    const chartId = chart.data.chartId
    // Use split instead of regex replace for consistent base ID extraction
    const baseChartId = chartId.split('_v')[0]

    if (!groupedMap.has(baseChartId)) {
      groupedMap.set(baseChartId, {
        baseChartId,
        activeVersion: chartId,
        chartIds: [],
      })
    }

    const group = groupedMap.get(baseChartId)
    group.chartIds.push(chartId)
    group.activeVersion = chartId
  })

  // Convert map to array and sort chartIds by version
  return Array.from(groupedMap.values()).map((group) => {
    // Find the active chart data from allCharts
    const activeChart = acs.find(c => c.data.chartId === group.activeVersion)

    return {
      ...activeChart,
      baseChartId: group.baseChartId, // Include baseChartId in the returned object
      chartIds: group.chartIds,
    }
  })
}

const chartsWithDeleted = computed(() => {
  // Get all charts and group them
  const groupedCharts = groupCharts(allCharts.value)

  // First, find all user actions messages that affect charts
  const userActions = messages.value
    .filter(msg => msg.data?.userAction)
    .map(msg => ({
      ...msg.data.userAction,
      createdAt: msg.createdAt,
    }))

  // Filter out deleted charts and apply version updates
  return groupedCharts
    .map((chart) => {
      // userActions after the latest chart creation
      const userActionsAfterChartCreation = userActions
        .filter(action => new Date(action.createdAt) > new Date(chart.createdAt))

      const deleteOrRestoreActions = userActionsAfterChartCreation
        .filter(action =>
          (action.type === 'deleteChart' || action.type === 'restoreChart')
          && action.chartId.split('_v')[0] === chart.baseChartId,
        )

      // Chart is deleted if the last action is 'deleteChart'
      const lastAction = deleteOrRestoreActions[deleteOrRestoreActions.length - 1]
      const isDeleted = lastAction?.type === 'deleteChart'

      // Find the latest version update for this chart series
      const versionUpdates = userActionsAfterChartCreation
        .filter(action =>
          action.type === 'updateChartVersion'
          // Use exact base chart ID matching
          && action.chartId.split('_v')[0] === chart.baseChartId,
        )

      if (versionUpdates.length > 0) {
        const latestUpdate = versionUpdates[versionUpdates.length - 1]
        const selectedVersionData = allCharts.value.find(c => c.data.chartId === latestUpdate.chartId)

        if (selectedVersionData) {
          return {
            ...chart,
            ...selectedVersionData,
          }
        }
      }

      return {
        ...chart,
        isDeleted,
      }
    })
})

const charts = computed(() => {
  return chartsWithDeleted.value.filter(chart => !chart.isDeleted)
})

async function handleUpdateChartVersion(chartId) {
  // Update message content to use split for base chart ID
  const message = {
    role: 'user',
    data: {
      automated: true,
      userAction: {
        type: 'updateChartVersion',
        chartId,
      },
    },
    // Use split for consistent base chart ID extraction
    content: `User updated chart version for the chart series "${chartId.split('_v')[0]}" to ${chartId.split('_v')[1] || '0'} via the UI`,
    createdAt: new Date().toISOString(),
  }

  setMessages([...messages.value, message])

  await updateMessages()

  setActiveChartId(chartId)
}

async function handleDeleteChart(chartId) {
  // Clear chat reference if it was referencing this chart
  if (chatReference.value?.chartId === chartId) {
    resetChatReference()
  }

  // if the chart is active, set the active chart to null
  if (activeChartId.value === chartId) {
    setActiveChartId(null)
  }

  const message = {
    role: 'user',
    data: {
      automated: true,
      userAction: {
        type: 'deleteChart',
        chartId,
      },
    },
    // Use split for consistent base chart ID extraction
    content: `User deleted chart series "${chartId.split('_v')[0]}" via the UI`,
    createdAt: new Date().toISOString(),
  }

  setMessages([...messages.value, message])

  await updateMessages()
}

function isChartIdDeleted({ chartId }) {
  // Find the chart in chartsWithDeleted by checking if the chartId is in any chart's chartIds array
  const chart = chartsWithDeleted.value.find(
    c => c.chartIds.some(id => id.split('_v')[0] === chartId.split('_v')[0]),
  )
  return chart?.isDeleted || false
}

async function handleRestoreChart(chartId) {
  const message = {
    role: 'user',
    data: {
      automated: true,
      userAction: {
        type: 'restoreChart',
        chartId,
      },
    },
    content: `User restored chart series "${chartId.split('_v')[0]}" via the UI`,
    createdAt: new Date().toISOString(),
  }

  setMessages([...messages.value, message])

  await updateMessages()

  setActiveChartId(chartId)
}

function showComingSoonToast() {
  useToast().add({
    title: 'Coming soon',
    description: 'This feature is coming soon',
  })
}

const isChatExpanded = ref(true)
watch(isChatExpanded, async (newVal) => {
  if (!newVal) {
    await nextTick()
    scrollToChartThumbnail(activeChartId.value, { behavior: 'instant' })
  }
})
provide('isChatExpanded', isChatExpanded)

onMounted(() => {
  isChatExpanded.value = lgAndLarger.value
})

const isChatInputVisible = ref(true)

const breakpoints = useMyBreakpoints()
const lgAndLarger = breakpoints.greaterOrEqual('lg')

const splitScreen = computed(() => {
  return lgAndLarger.value && isChatExpanded.value
})

const chatContainerInnerRef = useTemplateRef('chat-container-inner')

onClickOutside(chatContainerInnerRef, () => {
  if (!lgAndLarger.value) {
    isChatExpanded.value = false
  }
})

const chatContainerRef = useTemplateRef('chat-container')
const { width: chatContainerWidth } = useElementBounding(chatContainerRef)

function handleChartBoardClick() {
  setActiveChartId(null)
}
</script>

<template>
  <div>
    <!-- floating action bar -->
    <div
      class="
        fixed top-0 w-full
        z-30
        p-2 sm:p-4
        flex justify-between items-center
        pointer-events-none
        "
    >
      <div
        class="
           bg-white dark:bg-gray-900 shadow-lg rounded-xl p-2 flex items-center
           pointer-events-auto
           "
      >
        <div class="flex items-center gap-x-2">
          <UButton
            variant="ghost"
            color="gray"
            @click="navigateTo('/')"
          >
            <ChartrAiLogoSquareSvg height="1.5rem" />
          </UButton>

          <UTooltip text="New Chat">
            <UButton
              color="gray"
              icon="i-heroicons-plus"
              variant="ghost"
              @click="navigateTo('/start')"
            />
          </UTooltip>
        </div>
      </div>

      <div
        class="
           bg-white dark:bg-gray-900 shadow-lg rounded-xl p-2 flex items-center
           pointer-events-auto
           "
      >
        <div class="flex items-center gap-x-1">
          <DarkModeToggle />
          <UTooltip text="Bookmark board (coming soon)">
            <UButton
              size="lg"
              variant="ghost"
              color="gray"
              icon="i-carbon-bookmark"
              @click="showComingSoonToast"
            />
          </UTooltip>
          <UTooltip text="Share board (coming soon)">
            <UButton
              size="lg"
              variant="ghost"
              color="gray"
              icon="i-carbon-share"
              @click="showComingSoonToast"
            />
          </UTooltip>
        </div>
      </div>
    </div>

    <ChartBoard
      ref="chart-board"
      class="
      transition-[margin-left] duration-300 ease-out delay-[30ms]
      will-change-[margin-left]
      "
      :class="{
        'w-full': !splitScreen,
      }"
      :style="{
        marginLeft: splitScreen ? `calc(${chatContainerWidth}px + 1rem)` : '0',
      }"
      :charts="charts"
      :sources="sources"
      :is-loading="isChatLoading"
      @click="handleChartBoardClick"
    >
      <template #header-title>
        <div
          class="cursor-pointer hover:underline flex items-center gap-1"
          @click.stop="openTitleEditor"
        >
          {{ title }}
        </div>

        <!-- Title Edit Modal -->
        <UModal v-model="isEditingTitle">
          <UCard>
            <template #header>
              <h3 class="font-medium">
                Edit Board Title
              </h3>
            </template>

            <UForm>
              <UFormGroup>
                <UInput
                  v-model="editedTitle"
                  placeholder="Enter board title"
                  autofocus
                />
              </UFormGroup>
            </UForm>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton
                  variant="ghost"
                  color="gray"
                  @click="isEditingTitle = false"
                >
                  Cancel
                </UButton>
                <UButton
                  type="submit"
                  color="primary"
                  @click="saveTitle"
                >
                  Save
                </UButton>
              </div>
            </template>
          </UCard>
        </UModal>
      </template>

      <template #chart="{ chart }">
        <Chart
          :ref="c => chartContainerRefs[chart.data.chartId] = c?.$el"
          v-bind="getStoredChart({ chartId: chart.data.chartId }) || {
            data: chart.data,
            origin: {
              chatId: id,
              chartId: chart.data.chartId,
            },
            username: profile?.username,
            createdAt: chart.createdAt,
            updatedAt: chart.updatedAt,
          }"
          :is-streaming="chart?.isStreaming"
          :is-message-loading="chart?.isMessageLoading"
          :is-active="isChartIdActive({ chartId: chart.data.chartId })"
          with-fork-button
          fork-external
          with-share-button
          with-fav-button
          :with-username="false"
          class="scroll-mt-16"
          with-mermaid-rotate-button
          @chart-click="setActiveChartId(chart.data.chartId)"
          @update:data="data => handleChartDataUpdate({ data, chartId: chart.data.chartId })"
          @chat-popover-open="isChatInputVisible = false"
          @chat-popover-close="isChatInputVisible = true"
          @focus-chart="scrollToChart(chart.data.chartId, { forceTop: true })"
        >
          <template #top-bar-left>
            <ChartButton
              tooltip-text="Delete chart"
              icon="i-carbon-trash-can"
              :disabled="isChatLoading"
              @click="handleDeleteChart(chart.data.chartId)"
            />

            <USelectMenu
              v-if="chart.chartIds?.length > 1"
              :options="chart.chartIds"
              :model-value="chart.data.chartId"
              size="xs"
              :ui="{
                background: 'bg-orange-100',
              }"
              class="my-1"
              @update:model-value="handleUpdateChartVersion"
            >
              <template #label>
                v{{ parseInt(chart.data.chartId.match(/_v(\d+)$/)?.[1] || '0') }}
              </template>
              <template #option="{ option }">
                v{{ parseInt(option.match(/_v(\d+)$/)?.[1] || '0') }}
              </template>
            </USelectMenu>
          </template>

          <template #error="{ error }">
            <template v-if="error">
              <div
                v-if="chart?.isStreaming"
                class="flex justify-center items-center my-4"
              >
                <ChartLoadingIcon />
              </div>
              <div
                v-else
                class="text-amber-500 p-4 rounded-md bg-amber-50 dark:bg-amber-900/20"
              >
                Oops! Something went wrong.
                <UButton
                  :disabled="isChatLoading"
                  :loading="isChatLoading"
                  size="xs"
                  @click.stop="handleFixError({
                    chartId: chart.data.chartId,
                    errorMessage: error.message,
                  })"
                >
                  Fix with AI
                </UButton>
              </div>
            </template>
          </template>
        </Chart>
      </template>

      <template #footer>
        <div class="flex justify-center">
          <ChatNextChart
            v-if="charts.length > 0"
            size="xl"
            with-glow
          />
          <LoadingDots />
        </div>
      </template>
    </ChartBoard>

    <!-- chat container - fixed -->
    <div
      ref="chat-container"
      class="
      cho-chat-container
      fixed bottom-0 left-0
      z-20
      flex flex-col justify-end items-center
      transition-[width,max-width] duration-300 ease-out
      will-change-[width,max-width]
      rounded-t-xl
      overflow-hidden
      "
      :class="{
        'h-full bg-gray-100/70 dark:bg-gray-900/90': isChatExpanded,
        'pointer-events-none': !splitScreen && !isChatExpanded,
        'max-w-prose mx-2 sm:mx-4': splitScreen,
        'max-w-full': !splitScreen,
        'max-h-[calc(100vh-5rem)]': lgAndLarger,
      }"
      :style="{
        width: splitScreen ? '25%' : '100%',
      }"
    >
      <div
        ref="chat-container-inner"
        class="
        cho-chat-container-inner
        w-full h-full
        relative
        flex flex-col
        justify-end
        max-w-prose mx-auto
        border
        rounded-t-xl
        "
        :class="{
          'max-h-[calc(100vh-5rem)]': !lgAndLarger,
          'max-h-full': lgAndLarger,
          'border-transparent bg-opacity-0 shadow-none': !isChatExpanded,
          'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-gray-700 shadow-[0_-0.25rem_0.25rem_-0.125rem_rgba(0,0,0,0.1),0_0.25rem_0.25rem_-0.125rem_rgba(0,0,0,0.1),0.25rem_0_0.25rem_-0.125rem_rgba(0,0,0,0.1),-0.25rem_0_0.25rem_-0.125rem_rgba(0,0,0,0.1)]': isChatExpanded,
        }"
      >
        <div
          class="flex justify-center mb-4"
          :class="{
            invisible: !isChatExpanded,
          }"
        >
          <UButton
            icon="i-carbon-chevron-down"
            class="rounded-t-none rounded-b-xl"
            @click="isChatExpanded = false"
          />
        </div>

        <Transition
          enter-active-class="transition-[transform,opacity] duration-300 ease-out"
          leave-active-class="transition-[transform,opacity] duration-300 ease-out"
          enter-from-class="translate-y-full opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-full opacity-0"
        >
          <Chat
            v-if="isChatExpanded"
            class="
        flex-grow
        will-change-[transform,opacity]
        overflow-y-auto
        "
          >
            <template #artifact="{ artifact: chart }">
              <div>
                <ChartThumb
                  :id="`chart-thumb_${chart?.chartId}`"
                  :data="chart"
                  :is-active="isChartIdActive({ chartId: chart?.chartId })"
                  :is-deleted="isChartIdDeleted({ chartId: chart?.chartId })"
                  @click="isChartIdDeleted({ chartId: chart?.chartId }) ? handleRestoreChart(chart?.chartId) : handleChartThumbnailClick(chart?.chartId)"
                />
              </div>
            </template>

            <template #end>
              <div
                v-if="!isChatLoading"
                class="space-y-2 border-t border-gray-300 dark:border-gray-700 pt-4"
              >
                <ChatSuggestions
                  :suggestions="[
                    // {
                    //   role: 'user',
                    //   icon: 'i-carbon-scatter-matrix',
                    //   content: '2x2',
                    // },
                    // 'Timeline',
                    // 'Table',
                    // 'Flowchart',
                    // 'State Diagram',

                    '😂 Make this funny',
                    '🔍 Critique a chart',
                  ]"
                  @submit="handleSuggestion"
                />
              </div>

              <UAlert
                :class="{
                  invisible: parsedMessages.length === 0 || isChatLoading || !showTipNodeClick,
                }"
                variant="subtle"
                color="orange"
                icon="i-heroicons-light-bulb"
                :ui="{
                  padding: 'p-2',
                }"
                @close="handleTipClose"
              >
                <template #description>
                  <strong>Click</strong> on a chart or it's content to reference it. <strong>Double-click</strong> or <strong>Long-press</strong> to submit it.
                </template>
              </UAlert>

              <UAlert
                v-if="useAlternateModel"
                description="Experiencing high demand, we've switched you temporarily to a different model."
                variant="subtle"
                color="orange"
                icon="i-carbon-status-change"
                :actions="[
                  {
                    variant: 'outline',
                    label: 'Switch back',
                    color: 'orange',
                    click: () => {
                      useAlternateModel = false
                    },
                  },
                ]"
              />
            </template>
          </Chat>
        </Transition>

        <InChatChatInput
          v-show="splitScreen || isChatInputVisible"
          class="px-2 pb-2 sticky bottom-0 pointer-events-auto"
          with-next-chart
        >
          <template #top-actions>
            <UButton
              v-if="!isChatExpanded"
              icon="i-carbon-chevron-up"
              class="rounded-t-xl rounded-b-none"
              @click="isChatExpanded = true"
            />
          </template>
        </InChatChatInput>
      </div>
    </div>
  </div>
</template>
