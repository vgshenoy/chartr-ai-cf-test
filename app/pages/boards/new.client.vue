<script setup lang="ts">
import { useNewChatOptions } from '~/composables/chat/useNewChatOptions'
// create a new chat and then redirect to the chat page

const { id } = await $fetch('/api/chats', {
  method: 'POST',
  body: {
    messages: [],
  },
})

const newChatOptions = useNewChatOptions()

const route = useRoute()

const { q, chartId } = route.query

// each could be an array, just get the first value
const qFirst = Array.isArray(q) ? q[0] : q
const chartIdFirst = Array.isArray(chartId) ? chartId[0] : chartId

if (qFirst) newChatOptions.value.q = qFirst
if (chartIdFirst) newChatOptions.value.chartId = chartIdFirst

// if no newChatOptions at all at this point, then we need to redirect to the home page
if (!newChatOptions.value.q && !newChatOptions.value.chartId) {
  navigateTo('/', { replace: true })
}
else {
  // Replace current history entry instead of adding a new one
  navigateTo(`/boards/${id}`, { replace: true })
}
</script>

<template>
  <div />
</template>
