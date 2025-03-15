<script setup>
import Chart from '@/components/charts/Chart.vue'
import ChatToolInvocation from '@/components/chat/ChatToolInvocation.vue'

const props = defineProps({
  charts: {
    type: Array,
    default: null,
  },
  sources: {
    type: Array,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  withReactionButtons: {
    type: Boolean,
    default: false,
  },
})

provide('isLoading', props.isLoading)

const emit = defineEmits(['end-visible'])

const { endRef, isVisible } = useEndIntersectionObserver()

watch(isVisible, () => {
  if (isVisible.value) {
    emit('end-visible')
  }
})

// const chartsRef = useTemplateRef('charts')

// usePanZoom(chartsRef, {
//   allowWheelWithMetaOnly: true,
// })

const chartBoardRef = useTemplateRef('chart-board')
const chartboardWidth = ref(0)

useResizeObserver(chartBoardRef, useDebounceFn(() => {
  chartboardWidth.value = chartBoardRef.value.offsetWidth
}, 100))

provide('chartboardWidth', chartboardWidth)
</script>

<template>
  <div
    ref="chart-board"
    class="
    cho-chart-board
    relative
    "
  >
    <div
      class="
      cho-chart-board__content
      relative
      h-full w-full
      min-h-svh
      pt-4
      px-4 lg:px-8
      pb-[20vh]
      space-y-16
      "
    >
      <div
        class="cho-chart-board__background
      absolute inset-0 -z-10
      bg-[size:20px_20px]
      bg-[radial-gradient(circle,_#00000020_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_#ffffff15_1px,_transparent_1px)]
      bg-repeat
    "
      />

      <div
        v-if="$slots['header-title'] !== undefined || $slots['header-description'] !== undefined"
        class="cho-chart-board__content-header mt-4 flex items-center justify-center"
      >
        <div
          class="prose prose-base lg:prose-lg text-center max-w-none"
        >
          <h3 class="text-purple-500 tracking-wide">
            <slot name="header-title" />
          </h3>
          <p
            v-if="$slots['header-description'] !== undefined"
            class="mx-auto prose prose-sm dark:prose-invert text-gray-500 dark:text-gray-400"
          >
            <slot name="header-description" />
          </p>
        </div>
      </div>

      <!-- grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 -->
      <!-- flex flex-col items-center justify-center gap-y-16 -->

      <div
        v-if="sources?.length > 0"
        class="cho-chart-board__sources flex flex-wrap items-start justify-center gap-y-12 gap-x-12"
      >
        <ChatToolInvocation
          v-for="source in sources"
          :key="source.id"
          :tool-invocation="source.toolInvocation"
        />
      </div>

      <div
        ref="charts"
        class="cho-chart-board__charts flex flex-wrap items-start justify-center gap-y-12 gap-x-12"
      >
        <template
          v-for="chart in charts"
          :key="chart.id"
        >
          <slot
            name="chart"
            :chart="chart"
          >
            <Chart
              v-bind="chart"
              with-fork-button
              with-share-button
              with-fav-button
              :with-reaction-buttons="withReactionButtons"
            >
              <template #top-bar-left>
                <slot
                  name="chart-top-bar-left"
                  :chart="chart"
                />
              </template>

              <template #top-bar-right>
                <slot
                  name="chart-top-bar-right"
                  :chart="chart"
                />
              </template>

              <template #bottom-bar-left>
                <slot
                  name="chart-bottom-bar-left"
                  :chart="chart"
                />
              </template>

              <template #bottom-bar-right>
                <slot
                  name="chart-bottom-bar-right"
                  :chart="chart"
                />
              </template>
            </Chart>
          </slot>
        </template>
      </div>

      <!-- <div
      v-if="isLoading"
      class="flex items-center justify-center gap-x-2 p-4 mt-10 mb-[10vh]"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin"
      />
    </div> -->

      <div
        v-if="!isLoading && charts?.length === 0"
        class="flex flex-col items-center justify-center gap-y-4 pt-40"
      >
        <p class="text-gray-500 dark:text-gray-400 italic">
          Nothing here yet!
        </p>
      </div>

      <div
        ref="endRef"
        class="h-px"
      />

      <div
        v-if="$slots.footer"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
