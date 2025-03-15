<script setup>
const user = useSupabaseUser()

const supabase = useSupabaseClient()

const profile = inject('profile')

const items = computed(() => [
  [
    {
      label: `@${profile.value?.username || user.value?.email}`,
      slot: 'account',
      click: () => {
        navigateTo(`/profiles/${profile.value?.username}`)
      },
    },
  ],

  [
    {
      label: 'Boards',
      icon: 'i-carbon-chart-marimekko',
      click: () => {
        navigateTo('/boards')
      },
    },
    {
      label: 'Charts',
      icon: 'i-carbon-chart-multitype',
      click: () => {
        navigateTo('/charts')
      },
    },
  ],
  // [
  //   {
  //     label: 'Settings',
  //     icon: 'i-heroicons-cog-8-tooth',
  //   },
  // ],
  // [
  //   {
  //     label: 'Documentation',
  //     icon: 'i-heroicons-book-open',
  //   },
  //   {
  //     label: 'Changelog',
  //     icon: 'i-heroicons-megaphone',
  //   },
  //   {
  //     label: 'Status',
  //     icon: 'i-heroicons-signal',
  //   },
  // ],
  [
    {
      label: 'About',
      icon: 'i-carbon-information',
      click: () => {
        navigateTo('/about')
      },
    },
  ],
  [
    {
      label: 'Log out',
      icon: 'i-carbon-logout',
      click: async () => {
        await supabase.auth.signOut()
        navigateTo('/login')
      },
    },
  ],
])
</script>

<template>
  <UDropdown
    :items="items"
    :ui="{ item: { disabled: 'cursor-text select-text' } }"
    :popper="{ placement: 'bottom-end' }"
  >
    <UButton
      color="gray"
      variant="ghost"
      :ui="{ rounded: 'rounded-full' }"
      :padded="false"
    >
      <UAvatar
        :alt="profile?.username || user?.email"
      />
    </UButton>

    <template #account="{ item }">
      <div class="w-full flex items-center justify-between">
        <div class="truncate font-medium text-gray-900 dark:text-white">
          {{ item.label }}
        </div>
        <UIcon
          name="i-carbon-user"
          class="flex-shrink-0 h-4 w-4"
        />
      </div>
    </template>

    <template #item="{ item }">
      <span class="truncate">{{ item.label }}</span>

      <UIcon
        :name="item.icon"
        class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
      />
    </template>
  </UDropdown>
</template>
