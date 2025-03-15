<script setup>
import { usePhysicalKeyboard } from '~/composables/usePhysicalKeyboard'

const isChatLoading = inject('isChatLoading', false)

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Ask...',
  },
  withCharts: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 1,
  },
  withAiWarning: {
    type: Boolean,
    default: false,
  },
  allowEmpty: {
    type: Boolean,
    default: false,
  },
  withFlatBottom: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'stop'])

const text = defineModel({
  type: String,
  default: '',
})

const { isPhysicalKeyboard } = usePhysicalKeyboard()

async function focusInput() {
  await nextTick()
  if (isPhysicalKeyboard.value) {
    inputRef.value.focus()
  }
}

function blurInput() {
  inputRef.value?.blur()
}

defineShortcuts({
  meta_k: {
    usingInput: true,
    handler: () => {
      focusInput()
    },
  },
  escape: {
    usingInput: true,
    handler: () => {
      blurInput()
    },
  },
})

onMounted(() => {
  focusInput()

  // one more focus after 100ms
  // first focus not working when comming from open command palette
  // TODO: improve this if possible
  setTimeout(() => {
    focusInput()
  }, 100)
})

watch(() => isChatLoading.value, (newValue) => {
  if (!newValue) {
    focusInput()
  }
})

const allowSubmit = computed(() => {
  return text.value.trim().length > 0 || props.allowEmpty
})

function handleInputSubmit() {
  if (isChatLoading.value) {
    return
  }

  if (!allowSubmit.value) {
    return
  }

  emit('submit', text.value.trim())

  text.value = ''
}

function handleKeyDown(event) {
  if (event.shiftKey) {
    // Allow default behavior for Shift+Enter (newline)
  }
  else {
    event.preventDefault()
    // For Enter without Shift, submit the form
    handleInputSubmit()
  }
}

// Handle form submission for mobile keyboards
function handleFormSubmit(event) {
  event.preventDefault()
  handleInputSubmit()
}

const inputRef = ref(null)
const uTextareaRef = useTemplateRef('u-textarea')
onMounted(() => {
  inputRef.value = uTextareaRef.value?.$refs.textarea
})

function handleInputStop() {
  emit('stop')
}
</script>

<template>
  <form
    class="cho-chat-input relative w-full"
    @submit="handleFormSubmit"
  >
    <div
      class="
          shadow-md
          text-primary-500 dark:text-primary-400
          bg-primary-50 dark:bg-primary-950
          p-2 pb-2 sm:pb-3 space-y-2
          ring-1 ring-gray-300 dark:ring-gray-700
          flex flex-col
          group
          [&:has(textarea:focus)]:ring-2 [&:has(textarea:focus)]:ring-primary-600 [&:has(textarea:focus)]:ring-opacity-50
          [&:has(textarea:focus)]:shadow-lg
          rounded-lg
        "
    >
      <slot name="reference" />
      <div class="w-full flex items-center gap-x-2">
        <UTextarea
          ref="u-textarea"
          v-model="text"
          variant="none"
          size="sm"
          :placeholder="placeholder"
          class="w-full "
          :rows="rows"
          autoresize
          :maxrows="10"
          :ui="{
            padding: {
              sm: 'px-2.5 py-2 pr-8',
            },
          }"
          @keydown.enter="handleKeyDown"
        >
          <div class="absolute right-0 top-0 bottom-0 flex items-center gap-x-3 px-2">
            <UTooltip
              v-if="text.trim().length > 0 && !isChatLoading"
              text="Clear"
            >
              <UButton
                icon="i-carbon-close"
                variant="ghost"
                size="sm"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                type="button"
                @click="text = ''"
              />
            </UTooltip>

            <UTooltip
              v-if="allowSubmit && !isChatLoading"
              text="Submit"
            >
              <UButton
                icon="i-carbon-arrow-up"
                variant="solid"
                size="sm"
                type="submit"
                @click="handleInputSubmit"
              />
            </UTooltip>

            <LoadingDots />

            <UTooltip
              v-if="isChatLoading"
              text="Stop"
            >
              <UButton
                icon="i-carbon-stop-sign-filled"
                color="amber"
                variant="ghost"
                size="sm"
                @click="handleInputStop"
              />
            </UTooltip>
            <slot
              name="actions"
              :text="text"
            />
          </div>
        </UTextarea>
      </div>

      <slot name="footer">
        <div
          v-if="withAiWarning"
          class="text-center text-2xs text-gray-500 dark:text-gray-400 leading-snug"
        >
          AI can make mistakes. Check important information.
        </div>
      </slot>
    </div>

    <div class="absolute bottom-full left-1/2 -translate-x-1/2">
      <slot name="top-actions" />
    </div>
  </form>
</template>
