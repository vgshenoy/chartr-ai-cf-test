import { createParser } from 'eventsource-parser'
import { createChunkAccumulator } from '../utils/createChunkAccumulator'

export function useObject({
  api = '/api/object',
  prompt,
  initialValue = {},
  onError,
  onFinish,
  onEvent,
}) {
  const toast = useToast()
  const apiRef = toRef(api)
  const object = ref(initialValue)

  const accumulator = createChunkAccumulator()
  const eventParser = createParser(async (event) => {
    if (event.type === 'event' && event.data) {
      const chunk = JSON.parse(event.data)
      accumulator.processChunk(chunk)

      object.value = accumulator.getObject()

      if (onEvent) {
        onEvent({
          event: event.event,
          data: chunk,
        })
      }
    }
  })

  const isLoading = ref(false)
  const controller = ref(null)

  function stop() {
    if (controller.value) {
      controller.value.abort()
      isLoading.value = false
    }
  }

  async function submit() {
    isLoading.value = true
    object.value = { ...initialValue } // Reset the object to initialValue before submitting

    if (controller.value)
      controller.value.abort()

    controller.value = new AbortController()

    let stream
    try {
      stream = await $fetch(apiRef.value, {
        responseType: 'stream',
        method: 'POST',
        body: { prompt },
        signal: controller.value.signal,
      })
    }
    catch (error) {
      if (error.response?.status === 429) {
        toast.add({
          title: 'Too many requests',
          description: 'Please try again later',
          color: 'red',
        })
      }
      isLoading.value = false
      if (onError) onError(error)
      return
    }

    const reader = stream.getReader()

    accumulator.reset()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        isLoading.value = false
        if (onFinish) onFinish(object.value)
        break
      }
      const decoded = new TextDecoder('utf-8').decode(value)
      eventParser.feed(decoded)
    }
  }

  return {
    object,
    submit,
    isLoading,
    stop,
  }
}
