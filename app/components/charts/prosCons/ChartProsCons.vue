<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="prose prose-sm dark:prose-invert max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2">
    <div class="sm:border-r border-gray-200 dark:border-gray-800">
      <h3 class="text-center border-b border-gray-200 dark:border-gray-800 pb-2">
        Pros
      </h3>
      <div class="px-4">
        <ul
          v-if="props.data.pros"
        >
          <li
            v-for="(pro, index) in props.data.pros"
            :key="index"
          >
            {{ pro }}
          </li>
        </ul>
      </div>
    </div>

    <div>
      <h3 class="text-center border-b border-gray-200 dark:border-gray-800 pb-2">
        Cons
      </h3>
      <div class="px-4">
        <ul
          v-if="props.data.cons"
        >
          <li
            v-for="(con, index) in props.data.cons"
            :key="index"
          >
            {{ con }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
