<script setup>
import ChatMessages from '~/components/chat/ChatMessages.vue'
import ChatToolInvocation from '~/components/chat/ChatToolInvocation.vue'
</script>

<template>
  <div
    class="w-full px-4"
  >
    <ChatMessages>
      <template #tool-invocation="{ toolInvocation }">
        <ChatToolInvocation
          :tool-invocation="toolInvocation"
          minimal
        />
      </template>
      <template #artifact="{ artifact }">
        <slot
          name="artifact"
          :artifact="artifact"
        />
      </template>

      <template #end>
        <slot name="end" />
      </template>
    </ChatMessages>
  </div>
</template>
