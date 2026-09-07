<script setup lang="ts">
defineProps<{
  title: string;
  ready: boolean;
}>();
</script>

<template>
  <header class="lesson-header">
    <h1>{{ title }}</h1>
    <div class="lesson-description">
      <slot name="description" />
    </div>
    <div class="lesson-actions" :data-ready="ready">
      <slot name="actions" />
    </div>
  </header>
</template>
