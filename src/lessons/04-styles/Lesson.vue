<script setup lang="ts">
import { ref } from "vue";
import LessonShell from "../../components/LessonShell.vue";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);
</script>

<template>
  <div class="lesson">
    <LessonShell title="样式" :ready="sheet !== null">
      <template #description>
        <p>
          对照 class / 格式化。完整按钮见后续实现。
        </p>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
