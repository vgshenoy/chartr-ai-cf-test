<script setup>
// import ChartQuadrantDataPoint from './ChartQuadrantDataPoint.vue'
import ChartText from '@/components/charts/ChartText.vue'

const props = defineProps({
  quadrant: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="cho-quadrants__quadrant px-3 py-3 sm:px-6 sm:py-5 flex flex-col justify-center gap-y-4">
    <!-- <div class="flex items-center justify-between">
      <div class="text-primary text-sm">
        {{ quadrant.label }}
      </div>
    <UTooltip text="More">
        <UButton variant="ghost" icon="i-i-carbon-add" :loading="isLoading" size="xs" @click="update({ quadrant })" />
      </UTooltip>
    </div> -->

    <div class="prose text-xs lg:prose-sm dark:prose-invert">
      <ul
        v-if="props.quadrant.datapoints"
        class="ps-0 not-prose"
      >
        <li
          v-for="(dp, index) in props.quadrant.datapoints"
          :key="index"
          class="ps-0 my-1.5 sm:my-2"
          data-selectable
        >
          <ChartText
            v-if="dp.label"
            :text="dp.label"
          />
        </li>

      <!-- <li class="text-xs cursor-pointer" @click="update">
        <div class="flex items-center gap-x-2">
          <UButton variant="ghost" icon="i-carbon-add" :loading="isLoading" size="2xs" @click="update({ quadrant })" />
          <p class="text-primary">
            More
          </p>
        </div>
      </li> -->
      </ul>
    </div>
  </div>
</template>
