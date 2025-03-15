<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'title',
  },
})

const hasEmoji = computed(() => hasEmojiOpening(props.title))

const emoji = computed(() => hasEmoji.value ? props.title.split(' ')[0] : '')

const remainingTitle = computed(() => hasEmoji.value ? props.title.split(' ').slice(1).join(' ') : props.title)
</script>

<template>
  <div class="h-full w-full flex items-center justify-center bg-gray-50">
    <div class="flex flex-col items-center gap-12">
      <ChartrAiLogoSvg height="120" />

      <h1 class="max-w-[75%] text-[45px] font-bold text-center text-gray-800">
        {{ remainingTitle }}
      </h1>

      <div class="text-[80px]">
        <template v-if="hasEmoji">
          {{ emoji }}
        </template>
        <UIcon
          v-else
          name="i-carbon-chart-multitype"
          class="w-[60px] h-[60px]"
          mode="svg"
        />
      </div>
    </div>
  </div>
</template>
