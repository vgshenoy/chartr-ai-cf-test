<script setup>
const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  tag: {
    type: String,
    default: 'p', // this allows cursor pointer and clicking on nodes in a chart (see Chart.vue)
  },
})

const hasEmoji = computed(() => hasEmojiOpening(props.text))
</script>

<template>
  <component
    :is="tag"
    class="not-prose"
  >
    <template v-if="hasEmoji">
      <span class="whitespace-nowrap inline-block break-words">
        {{ text.split(' ')[0] }} {{ text.split(' ')[1] }}
      </span>
      {{ text.split(' ').slice(2).join(' ') }}
    </template>

    <template v-else>
      {{ text }}
    </template>
  </component>
</template>
