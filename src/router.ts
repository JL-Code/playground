import { createRouter, createWebHistory } from "vue-router";
import LessonWorkbook from "./lessons/01-workbook/Lesson.vue";
import LessonCells from "./lessons/02-cells/Lesson.vue";
import LessonFormulas from "./lessons/03-formulas/Lesson.vue";
import LessonStyles from "./lessons/04-styles/Lesson.vue";
import LessonRowsCols from "./lessons/05-rows-cols/Lesson.vue";

export const lessonNav = [
  { to: "/lessons/workbook", label: "1. Workbook / Sheet" },
  { to: "/lessons/cells", label: "2. 单元格读写" },
  { to: "/lessons/formulas", label: "3. 公式" },
  { to: "/lessons/styles", label: "4. 样式" },
  { to: "/lessons/rows-cols", label: "5. 行列操作" },
] as const;

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/lessons/workbook" },
    { path: "/lessons/workbook", component: LessonWorkbook },
    { path: "/lessons/cells", component: LessonCells },
    { path: "/lessons/formulas", component: LessonFormulas },
    { path: "/lessons/styles", component: LessonStyles },
    { path: "/lessons/rows-cols", component: LessonRowsCols },
  ],
});
