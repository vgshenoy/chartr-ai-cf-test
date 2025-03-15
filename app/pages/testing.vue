<script setup>
const count = ref(0);
</script>

<template>
  <div>
    <h1>Testing</h1>
    <button @click="count++">Click me</button>
    <p>Count is {{ count }}</p>
  </div>
</template>
