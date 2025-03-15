<script setup>
import ChartBoard from '~/components/ChartBoard.vue'
import ChartButton from '@/components/charts/ChartButton.vue'

definePageMeta({
  layout: 'header-layout',
})

const tabs = [
  {
    label: 'Saved',
    icon: 'i-carbon-bookmark',
    id: 'favorited',
  },
  {
    label: 'Posted',
    icon: 'i-carbon-user-avatar',
    id: 'posted',
  },
  {
    label: 'Liked',
    icon: 'i-carbon-thumbs-up',
    id: 'liked',
  },
  {
    label: 'Public',
    icon: 'i-carbon-earth',
    id: 'public',
  },
]

const route = useRoute()
const router = useRouter()

const selectedTabIndex = computed({
  get() {
    const index = tabs.findIndex(tab => route.query.tab === tab.id)
    return index > -1 ? index : 0 // 0 is default index
  },
  set(value) {
    router.replace({ query: { tab: tabs[value].id } })
  },
})

const page = ref(1)
const limit = 10

function transform(cs) {
  return cs.map((chart) => {
    return {
      ...chart,
      isFav: chart.is_fav,
      userReaction: chart.user_reaction,
      likesCount: chart.likes_count,
      updatedAt: new Date(chart.updated_at).toISOString(),
    }
  })
}

const apiUrl = computed(() =>
  `/api/charts?page=${page.value}&limit=${limit}&filter=${tabs[selectedTabIndex.value].id}`,
)

const { data: chartsData } = await useFetch(apiUrl, {
  transform,
})

const charts = ref(chartsData.value)
const isLoading = ref(false)

async function loadMoreCharts() {
  if (isLoading.value) return

  isLoading.value = true
  try {
    const newCharts = transform(await $fetch(apiUrl.value))
    charts.value.push(...newCharts)
  }
  catch (error) {
    console.error('Error loading more charts:', error)
  }
  finally {
    isLoading.value = false
  }
}

function handleEndVisible() {
  if (charts.value.length < page.value * limit) return

  page.value++
  loadMoreCharts()
}

watch(selectedTabIndex, () => {
  page.value = 1
  charts.value = []
  loadMoreCharts()
})
</script>

<template>
  <div>
    <UContainer class="mt-8">
      <div class="prose prose-sm dark:prose-invert">
        <h2>Charts</h2>

        <!-- <p class="lead text-sm">
          <span class="inline-flex items-center gap-x-2">
            Charts you've bookmarked <UIcon name="i-carbon-bookmark" /> and shared <UIcon name="i-carbon-share" />
          </span>.
        </p> -->
      </div>

      <div class="flex my-6 text-sm">
        <div class="flex flex-wrap gap-2 w-full">
          <button
            v-for="(tab, index) in tabs"
            :key="tab.id"
            class="flex items-center gap-2 px-4 py-2"
            :class="{
              'border-b-2 border-primary-500 text-primary-500': selectedTabIndex === index,
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300': selectedTabIndex !== index,
            }"
            @click="selectedTabIndex = index"
          >
            <UIcon :name="tab.icon" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </UContainer>

    <!-- <UProgress v-if="isLoading" /> -->

    <ChartBoard
      :charts="charts"
      :is-loading="isLoading"
      @end-visible="handleEndVisible"
    >
      <template #chart-top-bar-right="{ chart }">
        <ChartButton
          v-if="chart.origin?.chat_id"
          tooltip-text="Go to Chat"
          icon="i-carbon-chat-launch"
          @click="navigateTo(`/boards/${chart.origin.chat_id}`)"
        />
      </template>
    </ChartBoard>
  </div>
</template>
