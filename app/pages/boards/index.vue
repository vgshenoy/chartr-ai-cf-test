<script setup>
definePageMeta({
  layout: 'header-layout',
})

useSeoMeta({
  title: 'chartr.ai - Chats',
  description: 'View all your chats',
})

const page = ref(1)
const limit = 30 // Number of chats per page

function transform(cs) {
  return cs.map(chat => ({
    ...chat,
    createdAt: new Date(chat.created_at),
    updatedAt: new Date(chat.updated_at),
  }))
}

const search = ref('')
const apiUrl = computed(() => `/api/chats?page=${page.value}&limit=${limit}&search=${search.value}`)

const { data: chatsData, error } = await useFetch(apiUrl, {
  transform,
},
)

const chats = ref(chatsData.value)

if (error.value) {
  console.error(error.value)
}

const isLoading = ref(false)

const loadMoreChats = async () => {
  isLoading.value = true
  const newChats = transform(await $fetch(apiUrl.value))
  chats.value.push(...newChats)
  isLoading.value = false
}

const { endRef, isVisible } = useEndIntersectionObserver()

watch(isVisible, () => {
  if (isVisible.value) {
    if (chats.value.length < page.value * limit) return

    page.value++
    loadMoreChats()
  }
})

watch(search, () => {
  // reset page to 1
  page.value = 1
  chats.value = []
  loadMoreChats()
})
</script>

<template>
  <UContainer>
    <div class="my-8">
      <div class="prose prose-sm dark:prose-invert">
        <h2>Boards</h2>

      <!-- <UInput
        v-model="search"
        placeholder="Search your chats..."
        icon="i-heroicons-magnifying-glass"
        size="xs"
      /> -->
      </div>
    </div>

    <div
      v-if="error"
      class="flex flex-col gap-y-4 items-center justify-center p-4 text-red-500"
    >
      <UIcon
        name="i-heroicons-exclamation-circle"
        class="w-10 h-10"
      />
      Error loading chats. Please try again.
    </div>

    <div
      v-else-if="chats && chats.length === 0"
      class="flex flex-col items-center justify-center gap-y-4 pt-20"
    >
      <p class="italic text-gray-500 dark:text-gray-400">
        Nothing here yet, go make some charts!
      </p>
      <UButton
        icon="i-heroicons-plus"
        variant="outline"
        @click="navigateTo('/start')"
      >
        New Chat
      </UButton>
    </div>

    <div
      v-else
    >
      <NuxtLink
        v-for="chat in chats"
        :key="chat.chat_id"
        :to="`/boards/${chat.chat_id}`"
      >
        <div
          class="
        border-t border-gray-200 dark:border-gray-700
        transition
        cursor-pointer
        px-2 py-3
        "
        >
          <div class="flex flex-col md:flex-row gap-2 justify-between">
            <div class="flex items-center gap-x-3">
              <div class="flex items-baseline gap-x-2">
                <h2 class="text-sm">
                  {{ chat.title }}
                </h2>
                <UBadge
                  size="xs"
                  class="ml-2"
                  color="gray"
                >
                  {{ chat.message_count }}
                </UBadge>
              </div>
            </div>
            <span class="text-xs md:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {{ useTimeAgo(chat.updatedAt) }}
            </span>
          </div>
          <!-- <div class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2">
          Created: {{ chat.createdAt }}
        </div>
        <div class="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2">
          Updated: {{ chat.updatedAt }}
          </div> -->
        </div>
      </NuxtLink>

      <div
        ref="endRef"
        class="h-10"
      />
    </div>

    <div
      v-if="isLoading"
      class="flex items-center justify-center gap-x-2 p-4 mt-10 mb-[10vh]"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin"
      />
    </div>
  </UContainer>
</template>
