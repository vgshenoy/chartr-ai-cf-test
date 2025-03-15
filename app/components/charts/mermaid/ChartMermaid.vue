<script setup>
import { useMermaid } from '@/composables/charts/useMermaid.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
  isMessageLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['flowchart-adjusted-orientation'])

const isDebug = inject('isDebug', false)

const {
  render,
  reInitialize,
  error,
  // parse,
  mermaidContainerRef,
  // isRendering,
  adjustedMarkup,
  checkAspectRatio, // only for debugging
  flowchartAdjustedOrientation, // only for debugging
} = useMermaid({
  // markup: () => props.data.markup?.replace(/\\n/g, '\n'),
  markup: toRef(() => props.data.markup),
  isStreaming: toRef(() => props.isStreaming),
  isMessageLoading: toRef(() => props.isMessageLoading),
  handleFlowchartAdjustedOrientation: () => emit('flowchart-adjusted-orientation'),
})

function copyMarkup() {
  navigator.clipboard.writeText(adjustedMarkup.value)
}
</script>

<template>
  <div class="cho-mermaid w-full px-2">
    <template v-if="isDebug">
      <div class="prose prose-sm">
        <pre>{{ adjustedMarkup }}</pre>
        <div class="flex gap-2">
          <UButton @click="render">
            Re-Render
          </UButton>
          <UButton @click="reInitialize">
            Re-initialize
          </UButton>
          <UButton @click="copyMarkup">
            Copy Markup
          </UButton>
          <UButton @click="checkAspectRatio">
            Check Aspect Ratio
          </UButton>
        </div>
        <pre>flowchartAdjustedOrientation: {{ flowchartAdjustedOrientation }}</pre>
      </div>
    </template>

    <div
      ref="mermaidContainerRef"
      class="w-full flex justify-center items-center"
      @click="handleClick"
    />
    <slot
      name="error"
      :error="error"
    />
    <!-- <div
      v-if="error"
      class="text-amber-500 p-4 rounded-md bg-amber-50 dark:bg-amber-900/20"
    >
      Something went wrong, we'll look into it!
      <UButton
        size="xs"
        @click="handleChatSubmit({
          role: 'user',
          content: `Error: ${error.message}`,
        })"
      >
        Try again
      </UButton>
    </div> -->
  </div>
</template>
