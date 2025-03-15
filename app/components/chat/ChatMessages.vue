<script setup>
import DebugChatMessage from '~/components/chat/DebugChatMessage.vue'

const parsedMessages = inject('parsedMessages', [])
const isChatLoading = inject('isChatLoading', false)
const isDebug = inject('isDebug', false)

const displayedMessages = computed(() => {
  return parsedMessages.value.filter(message => !message.data?.automated)
})

const { containerRef, endRef } = useScrollToEnd({
  enabled: isChatLoading,
})
</script>

<template>
  <div
    class="space-y-4 pt-4"
  >
    <div
      ref="containerRef"
      class="space-y-6 break-words"
    >
      <div
        v-for="(message, messageIndex) in displayedMessages"
        :key="messageIndex"
        :class="{ 'border-b border-gray-300 pb-4': isDebug }"
      >
        <DebugChatMessage
          v-if="isDebug"
          :message="message"
          :index="messageIndex"
        />
        <template v-if="message.data?.automated">
          <div
            v-if="isDebug"
            class="prose"
          >
            <pre>{{ message }}</pre>
          </div>
        </template>
        <template v-else-if="message.role === 'user'">
          <div
            class="flex justify-end max-w-full"
          >
            <div
              class="rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-900/50 max-w-full"
            >
              <div class="prose prose-sm 2xl:prose-base dark:prose-invert [&_p]:my-0">
                <MyMDC
                  :value="message.content"
                  tag="div"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="message.role === 'assistant'">
          <ChatMessageAssistant
            :message="message"
          >
            <template #tool-invocation="slotProps">
              <slot
                name="tool-invocation"
                v-bind="slotProps"
              />
            </template>
            <template #artifact="slotProps">
              <slot
                name="artifact"
                v-bind="slotProps"
              />
            </template>
          </ChatMessageAssistant>
        </template>
      </div>
    </div>

    <LoadingDots />

    <slot
      name="end"
    />

    <div class="h-[10vh]" />

    <div
      ref="endRef"
    />
  </div>
</template>
