<script setup>
defineProps({
  title: {
    type: String,
    default: 'title',
  },
})
</script>

<template>
  <div class="h-full w-full flex items-center justify-center bg-gray-50">
    <div class="flex flex-col items-center gap-12">
      <ChartrAiLogoSvg height="180" />

      <h1 class="text-[60px] font-bold text-center text-gray-800">
        <div class="flex flex-row gap-x-4">
          You <span class="text-primary-500">chat</span>, we <span class="text-purple-500">chart</span>.
        </div>
      </h1>
    </div>
  </div>
</template>
