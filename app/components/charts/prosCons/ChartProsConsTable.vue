<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const columns = [
  {
    key: 'pros',
    label: 'Pros',
  },
  {
    key: 'cons',
    label: 'Cons',
  },
]

const rows = computed(() => [
  {
    pros: props.data.pros,
    cons: props.data.cons,
  },
])
</script>

<template>
  <UTable
    :columns="columns"
    :rows="rows"
    :ui="{
      base: 'table-auto',
      td: {
        size: 'text-base',
      },
    }"
  >
    <template #pros-data="{ row }">
      <ul v-if="row.pros" class="list-disc list-inside">
        <li v-for="(pro, index) in row.pros" :key="index">
          {{ pro }}
        </li>
      </ul>
    </template>
    <template #cons-data="{ row }">
      <ul v-if="row.cons" class="list-disc list-inside">
        <li v-for="(con, index) in row.cons" :key="index">
          {{ con }}
        </li>
      </ul>
    </template>
  </UTable>
</template>
