<script setup>
import ChartQuadrant from './ChartQuadrant.vue'

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
})

const data = computed(() => props.data)

const hasXYCategories = computed(() => {
  return data.value?.xDimension?.categories?.length > 0 && data.value?.yDimension?.categories?.length > 0
})

const quadrants = computed(() => {
  if (!hasXYCategories.value) {
    return Array.from({ length: 4 }).map(() => ({
      xCategory: null,
      yCategory: null,
      label: null,
      datapoints: [],
    }))
  }

  const quadrants = []
  const _quadrants = data.value?.quadrants

  const xDimension = data.value?.xDimension
  const yDimension = data.value?.yDimension

  for (const xCategory of xDimension.categories) {
    for (const yCategory of yDimension.categories) {
      const quadrant = _quadrants?.find(q => q.xCategory === xCategory && q.yCategory === yCategory)

      if (quadrant) {
        quadrants.push(quadrant)
      }
      else {
        quadrants.push({
          xCategory,
          yCategory,
          label: `${xCategory} / ${yCategory}`,
          datapoints: [],
        })
      }
    }
  }

  return quadrants
})
</script>

<template>
  <div class="cho-quadrants w-full max-w-3xl mx-auto text-xs sm:text-sm px-0 sm:px-4">
    <div class="w-full relative flex flex-col items-center gap-y-6 sm:gap-y-12">
      <!-- <h1 class="text-sm sm:text-base flex items-center gap-x-2">
        <div class="-translate-y-1/4">
          <div
            v-if="data?.yDimension?.label"
            class="flex flex-row-reverse items-center gap-x-1"
          >
            <span class="text-orange-500 text-right">
              {{ data.yDimension.label }}
            </span>
          </div>
          <USkeleton
            v-else
            class="h-4 w-16"
          />
        </div>

        /

        <div class="translate-y-1/4">
          <div
            v-if="data?.xDimension?.label"
            class="flex flex-row-reverse items-center gap-x-1"
          >
            <span class="text-purple-500">
              {{ data.xDimension.label }}
            </span>
          </div>
          <USkeleton
            v-else
            class="h-4 w-16"
          />
        </div>
      </h1> -->

      <div
        class="
            grid
            grid-cols-[2rem_minmax(150px,_1fr)_minmax(150px,_1fr)_2rem]
            md:grid-cols-[min-content_minmax(150px,_1fr)_minmax(150px,_1fr)_min-content]
            grid-rows-[auto_minmax(8rem,_1fr)_minmax(8rem,_1fr)_auto]
            "
      >
        <template v-if="hasXYCategories">
          <div class="text-purple-500 col-start-1 col-span-1 row-start-1 row-span-4">
            <div
              class="h-full flex flex-col items-center justify-center pr-2 lg:pr-4"
            >
              <div class="text-right -rotate-90 md:rotate-0 whitespace-nowrap md:whitespace-normal">
                <span
                  v-if="data.xDimension.categories[0]"
                  data-selectable
                  class="text-right"
                >{{ data.xDimension.categories[0] }}</span>
                <USkeleton
                  v-else
                  class="h-4 w-16"
                />
              </div>
            </div>
          </div>

          <div class="text-purple-500 col-start-4 col-span-1 row-start-1 row-span-4">
            <div
              class="h-full flex flex-col items-center justify-center pl-2 lg:pl-4"
            >
              <div class="-rotate-90 md:rotate-0 whitespace-nowrap md:whitespace-normal">
                <span
                  v-if="data.xDimension.categories[1]"
                  data-selectable
                >{{ data.xDimension.categories[1] }}</span>
                <USkeleton
                  v-else
                  class="h-4 w-16"
                />
              </div>
            </div>
          </div>

          <div class="text-orange-500 row-start-1 row-span-1 col-start-1 col-span-4">
            <div
              class="flex items-center justify-center py-4"
            >
              <span
                v-if="data.yDimension.categories[1]"
                data-selectable
              >{{ data.yDimension.categories[1] }}</span>
              <USkeleton
                v-else
                class="h-4 w-16"
              />
            </div>
          </div>

          <div class="text-orange-500 row-start-4 row-span-1 col-start-1 col-span-4">
            <div
              class="flex items-center justify-center py-4"
            >
              <span
                v-if="data.yDimension.categories[0]"
                data-selectable
              >{{ data.yDimension.categories[0] }}</span>
              <USkeleton
                v-else
                class="h-4 w-16"
              />
            </div>
          </div>
        </template>

        <div class="col-start-2 col-span-2 row-start-2 row-span-2 grid grid-cols-subgrid grid-rows-subgrid ">
          <ChartQuadrant
            v-for="(quadrant, index) in quadrants"
            :key="hasXYCategories ? `${quadrant.xCategory}-${quadrant.yCategory}` : index"
            :quadrant="quadrant"
            class="border-gray-300 dark:border-gray-700"
            :class="hasXYCategories ? {
              'col-start-1 row-start-2 border-r': quadrant.xCategory === data.xDimension?.categories[0] && quadrant.yCategory === data.yDimension?.categories[0],
              'col-start-1 row-start-1 border-b border-r': quadrant.xCategory === data.xDimension?.categories[0] && quadrant.yCategory === data.yDimension?.categories[1],
              'col-start-2 row-start-2': quadrant.xCategory === data.xDimension?.categories[1] && quadrant.yCategory === data.yDimension?.categories[0],
              'col-start-2 row-start-1 border-b': quadrant.xCategory === data.xDimension?.categories[1] && quadrant.yCategory === data.yDimension?.categories[1],
            }
              : {}"
          />
        </div>
      </div>
    </div>
  </div>
</template>
