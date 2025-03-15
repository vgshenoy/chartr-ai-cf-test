<script setup>
defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const uniqueId = useId()
</script>

<template>
  <div class="cho-chat-message-assistant rounded-lg">
    <div class="space-y-4">
      <template
        v-for="(part, index) in message.parts"
        :key="index"
      >
        <template v-if="part.type === 'text'">
          <template
            v-for="(segment, segmentIndex) in part.segments"
            :key="segmentIndex"
          >
            <slot
              v-if="segment.type === 'artifact'"
              name="artifact"
              :artifact="segment.content"
            />

            <div
              v-if="segment.type === 'markdown'"
              class="prose prose-sm 2xl:prose-base dark:prose-invert"
            >
              <MyMDC
                :fix-key="`${uniqueId}$$${index}$$${segmentIndex}`"
                :value="segment.content"
                tag="div"
              />
            </div>
          </template>
        </template>

        <div
          v-if="part.type === 'tool-invocation'"
          class="tool-invocation"
        >
          <slot
            name="tool-invocation"
            :tool-invocation="part.toolInvocation"
          />
        </div>
      </template>
    </div>
  </div>
</template>
