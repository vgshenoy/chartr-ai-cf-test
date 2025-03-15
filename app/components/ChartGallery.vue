<script setup>
const page = ref(1)
const limit = 20

function transform(cs) {
  return cs.map((chart) => {
    return {
      ...chart,
      isFav: chart.is_fav,
      userReaction: chart.user_reaction,
      likesCount: chart.likes_count,
      createdAt: new Date(chart.created_at).toISOString(),
      updatedAt: new Date(chart.updated_at).toISOString(),
    }
  })
}

const apiUrl = computed(() => `/api/charts/gallery?page=${page.value}&limit=${limit}`)

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
</script>

<template>
  <ChartBoard
    :charts="charts"
    :is-loading="isLoading"

    @end-visible="handleEndVisible"
  >
    <template #header-title>
      Gallery
    </template>
    <template #header-description>
      Charts created by the community.<br>
      Post yours with the <UIcon name="i-carbon-share" /> button.
    </template>
  </ChartBoard>
</template>
