<script setup>
import ChartText from '@/components/charts/ChartText.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
})

const timeline = computed(() => props.data.timeline
  ? props.data.timeline.filter(event => event.dateLabel || event.date).map((event) => {
      return {
        ...event,
        date: getDateFromEventDate(event.date),
        dateLabel: event.dateLabel === undefined ? event.date : event.dateLabel, // in older versions, date was used as dateLabel
      }
    })
  : [])

const hasEventDescriptions = computed(() => {
  return timeline.value.some(event => event.description)
})

// check if all events have a date, else time gaps can't be calculated
const allEventsHaveDates = computed(() => timeline.value.every(event => event.date !== null))

const timeGaps = ref([])

function getDateFromEventDate(eventDate) {
  if (!eventDate) return null

  const isNegativeYear = eventDate.startsWith('-')

  const absoluteEventDate = isNegativeYear ? eventDate.slice(1) : eventDate

  const split = absoluteEventDate.split('-')

  const year = split[0]
  const rest = split.slice(1).join('-')

  // fix padding for negative years. Eg. -24 becomes -000024
  // fix padding for double digit years, eg. 24 becomes 0024
  const paddedYear = isNegativeYear ? `-${year.padStart(6, '0')}` : year.padStart(4, '0')

  // console.log(paddedYear, rest)

  const date = rest.length ? new Date(`${paddedYear}-${rest}`) : new Date(paddedYear)

  return isNaN(date.getTime()) ? null : date
}

function getTimeGaps() {
  if (!allEventsHaveDates.value) return []

  if (timeline.value.length <= 2) return []

  const differences = timeline.value.slice(0, -1).map((event, index) => {
    const currentDate = event.date
    const nextDate = timeline.value[index + 1].date
    const diffInMs = Math.abs(nextDate.getTime() - currentDate.getTime())
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)
    // console.log(`Gap between ${event.date} and ${timeline.value[index + 1].date}: ${diffInDays} days`)
    return diffInDays
  })

  // console.log('All day differences:', differences)

  const avgGap = differences.reduce((sum, diff) => sum + diff, 0) / differences.length
  // console.log('Average gap:', avgGap)

  const result = differences.map((diff) => {
    if (diff > avgGap) {
      const scaledGap = Math.min(4, Math.log(diff / avgGap) * 4)
      // console.log(`Scaled gap for ${diff} days: ${scaledGap}rem`)
      return scaledGap.toFixed(2)
    }
    return 0
  })

  // console.log('Final gap sizes (in rem):', result)
  return result
}

watch(() => props.isStreaming, () => {
  // when streaming stops, calculate the time gaps
  if (!props.isStreaming) {
    timeGaps.value = getTimeGaps()
  }
  // console.log(timeline.value.length, 'timeGaps', timeGaps.value)
}, { immediate: true })

// watch(timeGaps, (newVal) => {
//   console.log('timeGaps', newVal)
// })

const isTimelineLoading = computed(() => props.isStreaming && timeline.value.length === 0)
</script>

<template>
  <div class="cho-timeline px-4 sm:px-6 mx-auto prose prose-sm lg:prose-base 2xl:prose-lg dark:prose-invert">
    <table>
      <tbody>
        <tr
          v-for="(event, index) in timeline || []"
          :key="index"
          class="!border-none"
        >
          <template v-if="event.dateLabel && event.label">
            <td class="relative max-w-xs text-right">
              <span class="text-xs lg:text-sm whitespace-nowrap">
                {{ event.dateLabel }}
              </span>
            </td>
            <td class="relative !px-1">
              <div
                class="absolute top-0 h-full left-1/2 -translate-x-1/2 border-r border-purple-500"
              />
              <div class="flex justify-center">
                <div class="w-3 h-3 bg-purple-500 rounded-full translate-y-[0.2rem]" />
              </div>
            </td>
            <td class="space-y-2 max-w-sm">
              <ChartText
                :text="event.label"
                data-selectable
                :class="{ 'font-medium': hasEventDescriptions }"
              />
              <div
                v-if="event.description"
                class="text-xs lg:text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap [&_p]:my-2"
                data-selectable
              >
                <MyMDC
                  :value="event.description"
                  tag="div"
                  :fix-key="`${event.dateLabel}-${index}`"
                />
                <!-- <pre>{{ timeGaps[index] }}</pre> -->
                <!-- <pre>{{ event.date }}</pre> -->
              </div>
              <div
                :style="{
                  height: timeGaps[index] ? `${timeGaps[index]}rem` : 'auto',
                }"
              />
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
