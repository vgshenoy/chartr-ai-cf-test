<script setup>
import { createParser } from 'eventsource-parser'

const eventStreamParser = createParser(async (event) => {
  // event has { event, type, data }
  if (event.type === 'event' && event.data) {
    console.log('event', event)
    messages.value.push(event.data)
  }
})

const isLoading = ref(false)
const controller = ref(null)
const messages = ref([])

async function fetchStream() {
  controller.value = new AbortController()

  const stream = await $fetch('/api/test', {
    responseType: 'stream',
    signal: controller.value.signal,
  })

  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    const decoded = new TextDecoder('utf-8').decode(value)
    eventStreamParser.feed(decoded)
  }
}

function stop() {
  if (controller.value) {
    controller.value.abort()
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-svh items-center justify-center gap-4">
    <UButton @click="fetchStream">
      Fetch stream
    </UButton>
    <UButton
      color="red"
      @click="stop"
    >
      Stop
    </UButton>
    <div v-if="isLoading">
      Loading...
    </div>
    <div
      v-for="(message, index) in messages"
      :key="index"
    >
      <pre>{{ message }}</pre>
    </div>
  </div>
</template>
