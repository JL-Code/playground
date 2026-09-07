<script setup lang="ts">
import { ref } from "vue";
import LessonShell from "../../components/LessonShell.vue";
import { useSpread } from "../../spread/useSpread";

const host = ref<HTMLElement | null>(null);
const { sheet } = useSpread(host);
</script>

<template>
  <div class="lesson">
    <LessonShell title="Workbook / Sheet" :ready="sheet !== null">
      <template #description>
        <p>
          Workbook 相当于 Vue 的 createApp，Worksheet 相当于一个页面。这一课先确认表格能挂上，按钮在下一课补全。
        </p>
      </template>
    </LessonShell>
    <div ref="host" class="spread-host" />
  </div>
</template>
