<script setup>
import { useNewChatOptions } from '~/composables/chat/useNewChatOptions'
import { chartTypes } from '~/utils/chart'

const newChatOptions = useNewChatOptions()

function handleSubmit(text) {
  newChatOptions.value.q = text
  navigateTo({
    path: '/boards/new',
  })
}

// defineOgImageComponent('HomeOgImage')

useHead({
  title: 'chartr.ai',
})

const { data: suggestions } = await useFetch('/api/chats/suggestions')
console.log(suggestions.value)

definePageMeta({
  layout: 'header-layout',
})

function scrollToTop() {
  y.value = 0
}

const { y } = useWindowScroll()

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      scrollToTop()
    },
  },
})

const suggestionsFromChartTypes = computed(() => {
  return chartTypes.map(type => ({
    label: type.label,
    icon: type.icon,
    prompt: `Show me an interesting ${type.label} chart`,
  }))
})
</script>

<template>
  <div class="space-y-12">
    <UContainer class="my-24 w-full">
      <div class="w-full flex flex-col items-center gap-y-8">
        <BetaBadge />

        <ChatInput
          class="max-w-lg mx-auto"
          placeholder="What will you chart out?"
          :rows="2"
          :with-ai-warning="false"
          @submit="handleSubmit"
        />

        <ChatSuggestions
          class="justify-center"
          :suggestions="suggestions"
          @submit="handleSubmit"
        />

        <ChatSuggestions
          class="justify-center"
          :suggestions="suggestionsFromChartTypes"
          @submit="handleSubmit"
        />
      </div>
    </UContainer>

    <ChartGallery />
  </div>
</template>
