<script setup>
import ChatNextChart from '~/components/chat/ChatNextChart.vue'
import MdcChatReference from '~/components/mdc/MdcChatReference.vue'

defineProps({
  withNextChart: {
    type: Boolean,
    default: false,
  },
})

const input = inject('input', ref(''))
const stop = inject('stop', () => {})
const chatReference = inject('chatReference', ref(null))
const resetChatReference = inject('resetChatReference', () => {})
const handleSubmit = inject('handleSubmit', () => {})

const goToChatReference = () => {
  console.log('goToChatReference')
}
</script>

<template>
  <ChatInput
    :model-value="input"
    :rows="1"
    :with-outline="false"
    :allow-empty="Boolean(chatReference)"
    v-bind="$attrs"
    with-flat-bottom
    @update:model-value="newValue => input = newValue"
    @submit="handleSubmit"
    @stop="stop"
  >
    <template #reference>
      <MdcChatReference
        v-bind="chatReference"
        with-remove-button
        @remove="resetChatReference"
        @click="goToChatReference"
      />
    </template>

    <template #actions>
      <ChatNextChart
        v-if="input.length === 0 && !chatReference && withNextChart"
      />
    </template>

    <template #top-actions>
      <slot name="top-actions" />
    </template>
  </ChatInput>
</template>
