<script setup>
const props = defineProps({
  toolInvocation: {
    type: Object,
    required: true,
  },
  withLoadingIndicator: {
    type: Boolean,
    default: true,
  },
  minimal: {
    type: Boolean,
    default: false,
  },
})

const isLoading = computed(() => props.toolInvocation.state === 'call')
const isYoutubeVideo = computed(() => props.toolInvocation.toolName === 'fetchUserSuppliedYoutubeVideo')
const isWebpage = computed(() => props.toolInvocation.toolName === 'fetchUserSuppliedUrl')
const hasError = computed(() => {
  const result = props.toolInvocation.result
  return result?.error && !result.title && !result.favicon
})

// Add computed property for the URL and video ID
const url = computed(() => props.toolInvocation.args.url)
const youtubeVideoId = computed(() => {
  if (!isYoutubeVideo.value || !url.value) return null

  try {
    const urlObj = new URL(url.value)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }
    else if (urlObj.pathname.includes('/shorts/')) {
      return urlObj.pathname.split('/shorts/')[1]?.split('/')[0]
    }
    else if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1]?.split('/')[0]
    }
    else if (urlObj.pathname.includes('/v/')) {
      return urlObj.pathname.split('/v/')[1]?.split('/')[0]
    }
    return urlObj.searchParams.get('v')
  }
  catch {
    return null
  }
})

const youtubeThumbnailUrl = computed(() => {
  if (!youtubeVideoId.value) return null
  return `https://img.youtube.com/vi/${youtubeVideoId.value}/hqdefault.jpg`
})

// Add state for embedded player
const showEmbeddedPlayer = ref(false)
const embedError = ref(false)

// Compute the embed URL with delayed autoplay
const embedUrl = computed(() => {
  if (!youtubeVideoId.value) return null
  // Remove autoplay from initial URL
  return `https://www.youtube.com/embed/${youtubeVideoId.value}?rel=0`
})

// Handle click on thumbnail
const handleVideoClick = (e) => {
  if (props.minimal) {
    return
  }

  if (isYoutubeVideo.value) {
    if (embedError.value) {
      return
    }
    e.preventDefault()
    showEmbeddedPlayer.value = true

    // Wait for animation to complete before starting video
    setTimeout(() => {
      const iframe = document.querySelector('iframe')
      if (iframe) {
        iframe.src = `${embedUrl.value}&autoplay=1`
      }
    }, 300) // Match the duration of the transition
  }
}

// Handle embed errors
const handleEmbedError = () => {
  console.log('---handleEmbedError')
  embedError.value = true
  showEmbeddedPlayer.value = false
}

// Handle closing the embedded player
const closeEmbeddedPlayer = (e) => {
  e.preventDefault()
  e.stopPropagation()
  showEmbeddedPlayer.value = false
  embedError.value = false
}
</script>

<template>
  <div
    class="
      w-full max-w-fit
      flex flex-col gap-y-2
      text-gray-600 dark:text-gray-200
      p-2
      rounded-lg
      border border-gray-200 dark:border-gray-700
      shadow-sm
      bg-amber-50 dark:bg-amber-900/60
      cursor-pointer
      transition-all duration-300 ease-out
    "
    :class="{
      'md:max-w-2xl': !minimal && showEmbeddedPlayer,
      'md:max-w-sm': !minimal && !showEmbeddedPlayer,
      'max-w-md': minimal,
    }"
  >
    <template v-if="isLoading">
      <div class="flex items-center gap-x-4">
        <UIcon
          name="i-carbon-circle-dash"
          class="animate-spin"
        />
        <span v-if="isYoutubeVideo">
          Fetching video...
        </span>
        <span v-else-if="isWebpage">
          Fetching webpage...
        </span>
      </div>
    </template>

    <template v-else-if="hasError">
      <div class="flex items-center gap-x-4">
        <UIcon
          name="i-carbon-warning"
          class="w-6 h-6 text-red-500 flex-none"
        />
        <span class="text-red-500">{{ toolInvocation.result?.error }}</span>
      </div>
    </template>

    <template v-else>
      <a
        v-if="url"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex flex-col gap-y-2 w-full"
        @click="handleVideoClick"
      >
        <!-- Webpage Thumbnail -->
        <div
          v-if="!minimal && isWebpage && toolInvocation.result?.image"
          class="relative w-full aspect-video rounded-md overflow-hidden"
        >
          <img
            :src="toolInvocation.result.image"
            :alt="toolInvocation.result?.title"
            class="w-full h-full object-cover"
          >
        </div>

        <!-- YouTube Content (Thumbnail or Embed) -->
        <div
          v-if="!minimal && isYoutubeVideo"
          class="relative w-full rounded-md overflow-hidden group transition-all duration-300"
          :class="{ 'aspect-video': !showEmbeddedPlayer, 'aspect-[16/9]': showEmbeddedPlayer }"
        >
          <!-- Embedded Player -->
          <iframe
            v-if="showEmbeddedPlayer"
            :src="embedUrl"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            @error="handleEmbedError"
          />

          <!-- Close Button for Embedded Player -->
          <button
            v-if="showEmbeddedPlayer"
            class="absolute top-2 right-2 z-10 p-1 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
            @click="closeEmbeddedPlayer"
          >
            <UIcon
              name="i-carbon-close"
              class="w-5 h-5 text-white"
            />
          </button>

          <!-- Thumbnail with Play Button -->
          <template v-else>
            <img
              :src="youtubeThumbnailUrl"
              :alt="toolInvocation.result?.title"
              class="w-full h-full object-cover"
            >
            <!-- Play button overlay -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div
                class="
                w-12 h-12
                flex items-center justify-center
                bg-red-600 bg-opacity-50
                rounded-full
                group-hover:bg-red-700
                transition-colors
                relative
              "
              >
                <UIcon
                  :name="embedError ? 'i-carbon-launch' : 'i-carbon-play-filled'"
                  class="w-8 h-8 text-white"
                />
                <span
                  v-if="embedError"
                  class="absolute -bottom-8 text-sm text-white bg-black/70 px-2 py-1 rounded whitespace-nowrap"
                >
                  Watch on YouTube
                </span>
              </div>
            </div>
          </template>
        </div>

        <!-- Header with favicon/icon and title -->
        <div class="flex items-center gap-x-4 px-2">
          <div class="flex-none mt-1">
            <UIcon
              v-if="isYoutubeVideo"
              name="i-carbon-logo-youtube"
              class="w-6 h-6 text-red-500"
            />
            <template v-else-if="isWebpage">
              <img
                v-if="toolInvocation.result?.favicon"
                :src="toolInvocation.result.favicon"
                class="w-6 h-6 object-contain"
                :alt="toolInvocation.result?.title"
              >
              <UIcon
                v-else
                name="i-carbon-content-delivery-network"
                class="w-6 h-6"
              />
            </template>
          </div>

          <div class="flex-1 min-w-0 space-y-2">
            <div
              v-if="toolInvocation.result?.title"
              class="font-medium line-clamp-2"
            >
              {{ toolInvocation.result?.title }}
            </div>
            <!-- <div
              v-if="toolInvocation.result?.description"
              class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1"
            >
              {{ toolInvocation.result.description }}
            </div> -->
            <div class="flex items-center gap-x-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ isYoutubeVideo ? toolInvocation.result.channelName : toolInvocation.result.siteName }}
              </span>
              <UIcon
                name="i-carbon-arrow-up-right"
                class="w-4 h-4 text-gray-400"
              />
            </div>
          </div>
        </div>
      </a>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.cho-chat-message-assistant {
  :deep(p) {
    margin: 0.5em 0;
  }
}
</style>
