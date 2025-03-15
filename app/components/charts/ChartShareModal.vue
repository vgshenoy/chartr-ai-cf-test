<script setup>
import { inject, ref, computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  chartId: {
    type: String,
    default: null,
  },
  chartTitle: {
    type: String,
    default: '',
  },
  visibility: {
    type: String,
    default: 'private',
    validator: value => ['private', 'unlisted', 'public'].includes(value),
  },
  isChartAuthor: {
    type: Boolean,
    default: false,
  },
  chartUrl: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'update:isOpen',
  'update:visibility',
])

// Track selected visibility internally
const selectedVisibility = computed({
  get: () => props.visibility,
  set: (value) => {
    if (['private', 'unlisted', 'public'].includes(value)) {
      updateVisibility(value)
    }
  },
})

// Inject clipboard functionality from parent
const copyChartUrl = inject('copyChartUrl')
const copiedChartUrl = inject('copiedChartUrl', ref(false)) // Default to false if not provided
const isClipboardSupported = inject('isClipboardSupported', false) // Default to false if not provided

// When modal closes
function closeModal() {
  emit('update:isOpen', false)
}

// Update visibility - now only handles the new visibility property
function updateVisibility(value) {
  emit('update:visibility', value)
}
</script>

<template>
  <UModal
    :model-value="isOpen"
    @update:model-value="closeModal"
  >
    <UCard>
      <template #header>
        <div class="space-y-1">
          <h3 class="text-base font-medium">
            Share Chart
          </h3>
          <div class="text-xs text-gray-500">
            Visibility settings for this chart
          </div>
        </div>
      </template>

      <div class="space-y-8">
        <!-- Link section at the top -->
        <div
          v-if="chartId"
          class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 space-y-2"
        >
          <div class="flex items-center gap-x-3 justify-between">
            <div class="text-sm font-medium">
              {{ chartTitle }}
            </div>
            <div class="flex items-center gap-x-1">
              <UBadge
                v-if="selectedVisibility === 'public'"
                color="blue"
                size="xs"
              >
                Public
              </UBadge>
              <UBadge
                v-else-if="selectedVisibility === 'unlisted'"
                color="green"
                size="xs"
              >
                Unlisted
              </UBadge>
              <UBadge
                v-else
                color="gray"
                size="xs"
              >
                Private
              </UBadge>
            </div>
          </div>

          <div class="flex items-center gap-x-2 text-xs">
            <div class="min-w-0 flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 overflow-hidden">
              <NuxtLink
                :to="chartUrl"
                target="_blank"
                class="block truncate"
              >
                {{ chartUrl }}
              </NuxtLink>
            </div>

            <UButton
              v-if="isClipboardSupported"
              class="flex-none shrink-0"
              color="gray"
              variant="ghost"
              icon="i-carbon-copy"
              size="xs"
              @click="copyChartUrl(chartUrl)"
            >
              {{ copiedChartUrl ? 'Copied!' : 'Copy' }}
            </UButton>
          </div>
        </div>

        <!-- Visibility settings section -->
        <div
          v-if="isChartAuthor"
          class="space-y-3"
        >
          <!-- Private option -->
          <div
            class="relative p-4 rounded-lg cursor-pointer transition-all duration-200"
            :class="[
              selectedVisibility === 'private'
                ? 'bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900',
            ]"
            @click="isChartAuthor && (selectedVisibility = 'private')"
          >
            <div class="flex items-center gap-x-3 justify-between">
              <div class="flex items-center gap-x-3">
                <UIcon
                  name="i-carbon-locked"
                  class="w-5 h-5 text-gray-600 dark:text-gray-400"
                />
                <div>
                  <div class="text-sm font-medium">
                    Private
                  </div>
                  <div class="text-xs text-gray-500">
                    Only you can view this chart
                  </div>
                </div>
              </div>

              <UIcon
                v-if="selectedVisibility === 'private'"
                name="i-carbon-checkmark"
                class="w-5 h-5 text-primary-500 dark:text-primary-400"
              />
            </div>
          </div>

          <!-- Unlisted option -->
          <div
            class="relative p-4 rounded-lg cursor-pointer transition-all duration-200"
            :class="[
              selectedVisibility === 'unlisted'
                ? 'bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900',
              !isChartAuthor ? 'opacity-60 cursor-not-allowed' : '',
            ]"
            @click="isChartAuthor && (selectedVisibility = 'unlisted')"
          >
            <div class="flex items-center gap-x-3 justify-between">
              <div class="flex items-center gap-x-3">
                <UIcon
                  name="i-carbon-earth-filled"
                  class="w-5 h-5 text-green-600 dark:text-green-400"
                />
                <div>
                  <div class="text-sm font-medium">
                    Unlisted
                  </div>
                  <div class="text-xs text-gray-500">
                    Only those with the link can view.
                  </div>
                </div>
              </div>

              <UIcon
                v-if="selectedVisibility === 'unlisted'"
                name="i-carbon-checkmark"
                class="w-5 h-5 text-primary-500 dark:text-primary-400"
              />
            </div>
          </div>

          <!-- Public option -->
          <div
            class="relative p-4 rounded-lg cursor-pointer transition-all duration-200"
            :class="[
              selectedVisibility === 'public'
                ? 'bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-300 dark:ring-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900',
              !isChartAuthor ? 'opacity-60 cursor-not-allowed' : '',
            ]"
            @click="isChartAuthor && (selectedVisibility = 'public')"
          >
            <div class="flex items-center gap-x-3 justify-between">
              <div class="flex items-center gap-x-3">
                <UIcon
                  name="i-carbon-user-avatar"
                  class="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
                <div>
                  <div class="text-sm font-medium">
                    Public
                  </div>
                  <div class="text-xs text-gray-500">
                    On your public profile and listed in the gallery
                  </div>
                </div>
              </div>

              <UIcon
                v-if="selectedVisibility === 'public'"
                name="i-carbon-checkmark"
                class="w-5 h-5 text-primary-500 dark:text-primary-400"
              />
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </UModal>
</template>
