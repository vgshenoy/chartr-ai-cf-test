<template>
  <slot
    :data="data?.data"
    :body="data?.body"
    :toc="data?.toc"
    :excerpt="data?.excerpt"
    :error="error"
  >
    <MDCRenderer
      v-if="body"
      :tag="props.tag"
      :class="props.class"
      :body="body"
      :data="data?.data"
      :unwrap="props.unwrap"
    />
  </slot>
</template>

<script setup>
import { hash } from 'ohash'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const props = defineProps({
  fixKey: { // to fix the key issue when two props.value are the same
    type: [String, Number],
    default: null,
  },
  tag: {
    type: [String, Boolean],
    default: 'div',
  },
  value: {
    type: [String, Object],
    required: true,
  },
  excerpt: {
    type: Boolean,
    default: false,
  },
  parserOptions: {
    type: Object,
    default: () => ({}),
  },
  class: {
    type: [String, Array, Object],
    default: '',
  },
  unwrap: {
    type: [Boolean, String],
    default: false,
  },
})

const key = computed(() => hash(props.value) + '_' + (props.fixKey ? props.fixKey : ''))

const { data, refresh, error } = await useAsyncData(key.value, async () => {
  if (typeof props.value !== 'string') {
    return props.value
  }

  return await parseMarkdown(props.value, props.parserOptions)
})

const body = computed(() => props.excerpt ? data.value?.excerpt : data.value?.body)

watch(() => props.value, () => {
  // console.log('refreshing markdown', key.value, props.value)
  refresh()
})
</script>
