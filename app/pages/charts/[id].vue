<script setup>
definePageMeta({
  layout: 'header-layout',
})

// defineOgImageComponent('ChartOgImage', {
//   title: () => `${chart.value.data.title}`,
// })

const route = useRoute()
const id = route.params.id

const { data: chart, error } = await useFetch(`/api/charts/${id}`, {
  transform: c => ({
    ...c,
    isFav: c.is_fav,
    likesCount: c.likes_count,
    updatedAt: new Date(c.updated_at).toISOString(),
  }),
})

if (error.value) {
  // possible that the chart is not public, the user may be able to access it if logged in
  useCookie('sb-redirect-path').value = route.path
  navigateTo('/login')
}

useSeoMeta({
  title: () => `${chart.value.data.title} | chartr.ai`,
})

const isNotFoundModalOpen = ref(false)

if (error.value) {
  isNotFoundModalOpen.value = true
}
</script>

<template>
  <div>
    <ChartBoard
      :charts="[chart]"
    >
      <template #footer>
        <p class="prose dark:prose-invert text-center text-sm mx-auto">
          Made with <NuxtLink
            to="https://chartr.ai"
            target="_blank"
          >
            chartr.ai
          </NuxtLink>
        </p>
      </template>
    </ChartBoard>

    <UModal v-model="isNotFoundModalOpen">
      <UCard>
        <template #header>
          Chart not found
        </template>
        <div class="prose prose-sm dark:prose-invert">
          <p>
            We couldn't find the chart you were looking for.
          </p>
          <p>
            It may have been deleted or you may not have access to it.
          </p>
        </div>
        <template #footer>
          <UButton @click="navigateTo('/')">
            Back to Home
          </UButton>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
