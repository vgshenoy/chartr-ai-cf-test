<script setup>
import FeedbackModal from '~/components/FeedbackModal.vue'

const isDebug = useState('isDebug', () => false)
provide('isDebug', isDebug)

const profile = useState('profile')
provide('profile', profile)

const showCommandPalette = ref(false)

useSeoMeta({
  title: 'chartr.ai',
})

useHead({
  link: [
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'manifest', href: '/site.webmanifest' },

    // for apple mobile web app
    // { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    // { name: 'apple-mobile-web-app-title', content: 'chartr.ai' },
    // { name: 'theme-color', content: '#030712' },
  ],
})

const user = useSupabaseUser()
const isDebugUser = computed(() => user.value?.email.startsWith('vig'))

// debug shortcut
defineShortcuts({
  meta_d: {
    usingInput: true,
    whenever: [isDebugUser],
    handler: () => {
      isDebug.value = !isDebug.value
    },
  },
})

const supabase = useSupabaseClient()

const route = useRoute()

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      if (route.path !== '/start') {
        navigateTo('/start')
      }
    },
  },
})

defineShortcuts({
  meta_j: {
    usingInput: true,
    handler: () => {
      showCommandPalette.value = !showCommandPalette.value
      // navigateTo('/chats')
    },
  },
})

const commandPaletteRef = ref() // can use commandPaletteRef.value?.query to show recent when nothing is typed in, check docs
const groups = computed(() => [
  {
    key: 'actions',
    commands: [
      {
        id: 'new-chat',
        label: 'New Chat',
        icon: 'i-heroicons-plus',
        click: () => navigateTo('/start'),
      },
      {
        id: 'boards',
        label: 'Boards',
        icon: 'i-carbon-chart-marimekko',
        click: () => navigateTo('/boards'),
      },
      {
        id: 'charts',
        label: 'Charts',
        icon: 'i-carbon-chart-multitype',
        click: () => {
          navigateTo('/charts')
        },
      },
      {
        id: 'about',
        label: 'About',
        icon: 'i-heroicons-question-mark-circle',
        click: () => {
          navigateTo('/about')
        },
      },
    ],
  },
  {
    key: 'logout',
    commands: [
      {
        id: 'logout',
        label: 'Log out',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        click: async () => {
          const { error } = await supabase.auth.signOut()
          if (!error) {
            navigateTo('/login')
          }
        },
      },
    ],
  },
])

function onSelect(command) {
  showCommandPalette.value = false

  if (command && command.click) {
    command.click()
  }
}

useWatchTokens()
</script>

<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <UModal v-model="showCommandPalette">
    <UCommandPalette
      ref="commandPaletteRef"
      :groups="groups"
      autoselect
      @update:model-value="onSelect"
    />
  </UModal>

  <DevOnly>
    <UPopover
      v-if="isDebug"
      :popper="{ placement: 'top-end' }"
    >
      <UButton
        icon="i-heroicons-bug-ant-20-solid"
        color="gray"
        variant="soft"
        class="fixed bottom-4 right-4 z-50"
      />

      <template #panel>
        <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Debug Information
              </h3>
            </div>
          </template>

          <div class="space-y-4 p-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              This popover displays debug information for developers.
            </p>
            <pre class="p-4 rounded-md text-xs overflow-auto">
      debug stuff here
    </pre>
          </div>
        </UCard>
      </template>
    </UPopover>
  </DevOnly>

  <UNotifications />

  <FeedbackModal />

  <div id="root" />
</template>
