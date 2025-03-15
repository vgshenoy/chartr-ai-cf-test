<script setup>
import ChartText from '@/components/charts/ChartText.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  footnote: {
    type: String,
    default: '',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
})

const chartType = computed(() => getChartType(props.data))
</script>

<template>
  <div
    class="group cursor-pointer w-full max-w-lg px-4 py-3 rounded-lg transition-all duration-400 shadow"
    :class="{
      'bg-purple-200 dark:bg-purple-900 ring-2 ring-purple-500 dark:ring-purple-400': isActive,
      'bg-purple-100 dark:bg-purple-950/50 ring-1 ring-purple-200 dark:ring-purple-700 hover:ring-purple-300 dark:hover:ring-purple-600': !isActive,
      'opacity-50': isDeleted,
    }"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex-shrink-0 flex items-center justify-center text-purple-500 dark:text-purple-400">
        <UIcon
          :name="chartType?.icon || 'i-carbon-chart-scatter'"
          class="h-6 w-6 opacity-50"
        />
      </div>

      <div class="min-w-0 flex-1 flex flex-col items-start space-y-0.5">
        <div class="w-full text-left text-purple-900 dark:text-purple-100 text-xs sm:text-sm 2xl:text-base">
          <ChartText :text="data.title" />
        </div>
        <div
          v-if="footnote || $slots.footnote"
          class="text-2xs uppercase leading-loose text-purple-500 dark:text-purple-400"
        >
          <slot name="footnote">
            {{ footnote }}
          </slot>
        </div>
      </div>

      <div class="flex-shrink-0 flex items-center gap-x-2">
        <div class="transition-transform duration-300 group-hover:translate-x-1 text-purple-500 dark:text-purple-400">
          <UIcon
            :name="isDeleted ? 'i-carbon-reset' : 'i-carbon-chevron-right'"
            class="h-4 w-4"
          />
        </div>
      </div>
    </div>
  </div>
</template>
