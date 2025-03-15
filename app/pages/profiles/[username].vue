<script setup>
definePageMeta({
  layout: 'header-layout',
})

const route = useRoute()
const username = route.params.username
const toast = useToast()

// Parameters for data fetching
const page = ref(1)
const limit = 10

// Fetch profile data
const { data: profile } = await useFetch(`/api/profiles/${username}`)

// API URL for charts
const apiUrl = computed(() =>
  `/api/profiles/${username}/charts?page=${page.value}&limit=${limit}`,
)

// Transform function to standardize chart data
function transform(items) {
  if (!items) return []

  return items.map(item => ({
    ...item,
    isFav: item.is_fav || false,
    userReaction: item.user_reaction || null,
    likesCount: item.likes_count || 0,
    updatedAt: new Date(item.updatedAt || item.updated_at).toISOString(),
    createdAt: new Date(item.createdAt || item.created_at).toISOString(),
  }))
}

// Fetch charts data
const { data: chartsData } = await useFetch(apiUrl, {
  transform,
})

const charts = ref(chartsData.value)
const isLoading = ref(false)

// Function to load more content
async function loadMoreCharts() {
  if (isLoading.value) return

  isLoading.value = true
  try {
    page.value++
    const newItems = transform(await $fetch(apiUrl.value))
    charts.value.push(...newItems)
  }
  catch (error) {
    console.error('Error loading more charts:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load more charts',
      color: 'red',
    })
  }
  finally {
    isLoading.value = false
  }
}

// Handle end visible event for infinite scrolling
function handleEndVisible() {
  if (charts.value.length < page.value * limit) return
  page.value++
  loadMoreCharts()
}
</script>

<template>
  <div>
    <UContainer class="mt-8">
      <div
        class="flex flex-col md:flex-row items-start gap-6 mb-8"
      >
        <!-- Avatar -->
        <!-- <UAvatar
          :src="profile?.avatarUrl"
          :alt="profile?.username"
          size="xl"
          :ui="{
            wrapper: 'border-2 border-gray-200 dark:border-gray-800',
          }"
        /> -->

        <!-- Profile info -->
        <div class="flex-1">
          <div class="prose prose-lg dark:prose-invert">
            <h2 class="flex items-center gap-2 text-orange-500 dark:text-orange-400">
              @{{ profile?.username }}
            </h2>

            <h4
              v-if="profile?.fullName"
              class="text-gray-600 dark:text-gray-400"
            >
              {{ profile.fullName }}
            </h4>

            <div
              v-if="profile?.website"
              class="text-sm"
            >
              <a
                :href="profile.website"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-500"
              >
                {{ profile.website }}
              </a>
            </div>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              Member since <UBadge
                color="gray"
                size="sm"
              >
                {{ profile?.createdAt ? useDateFormat(profile.createdAt, 'MMM YYYY').value : 'Unknown' }}
              </UBadge>
            </p>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Charts Display -->
    <ChartBoard
      :charts="charts"
      :is-loading="isLoading"
      @end-visible="handleEndVisible"
    />
  </div>
</template>
