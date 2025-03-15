<script setup>
import { computed } from 'vue'
import ChartText from '@/components/charts/ChartText.vue'
import ChartLoadingIcon from '@/components/charts/ChartLoadingIcon.vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
})

const headers = computed(() => props.data.headers || [])
const rows = computed(() => props.data.rows || [])
const isTableLoading = computed(() => props.isStreaming && rows.value.length === 0)

function isBulletList(cell) {
  return Array.isArray(cell)
}
</script>

<template>
  <div class="mx-auto px-0 md:px-6 max-w-screen-2xl prose prose-sm lg:prose-base 2xl:prose-lg dark:prose-invert">
    <table>
      <thead v-if="headers.length > 0">
        <tr>
          <th
            v-for="(header, index) in headers"
            :key="index"
            class="px-4 py-2 text-left"
            data-selectable
          >
            <ChartText :text="header" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
        >
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            class="!px-2 !py-1 max-w-xs"
          >
            <template v-if="isBulletList(cell)">
              <ul
                class="list-disc pl-5 !m-0"
              >
                <li
                  v-for="(item, itemIndex) in cell"
                  :key="itemIndex"
                  data-selectable
                >
                  <ChartText :text="item" />
                </li>
              </ul>
            </template>
            <template v-else>
              <ChartText
                :text="cell"
                data-selectable
              />
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
