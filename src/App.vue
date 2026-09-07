<script setup lang="ts">
import { lessonNav } from "./router";
</script>

<template>
  <div class="app-shell">
    <nav class="sidebar" aria-label="课程">
      <p class="brand">SpreadJS Playground</p>
      <RouterLink
        v-for="item in lessonNav"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        active-class="nav-link-active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>
