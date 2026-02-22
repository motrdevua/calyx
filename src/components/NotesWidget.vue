<template>
  <transition name="fade-scale">
    <div
      class="notes-widget animate-border"
      :class="{ 'is-dragging': isDragging }"
      :style="{ left: posX + 'px', top: posY + 'px' }"
      @mousemove="handleMouseMove"
      @mousedown="startDrag"
    >
      <div class="notes-header">
        <h3>Tasks</h3>
        <span class="task-count">{{ pendingTasks }} left</span>
      </div>

      <div class="add-task-wrapper no-drag">
        <input
          v-model="newTask"
          @keyup.enter="addTask"
          type="text"
          placeholder="Add a new task..."
          class="task-input"
        />
        <button class="add-btn" @click="addTask" :disabled="!newTask.trim()">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div class="tasks-list scrollable no-drag">
        <transition-group name="list">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-item"
            :class="{ 'is-done': task.done }"
            @click="toggleTask(task)"
          >
            <div class="checkbox">
              <svg
                v-if="task.done"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span class="task-text">{{ task.text }}</span>
            <button class="delete-btn" @click.stop="removeTask(task.id)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </transition-group>

        <div v-if="tasks.length === 0" class="empty-state">
          No tasks yet. You're all caught up! ✨
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useSpotlight } from "@/composables/useSpotlight";

const { handleMouseMove } = useSpotlight();

// --- ЛОГИКА ЗАДАЧ ---
const tasks = ref(JSON.parse(localStorage.getItem("calyx_tasks")) || []);
const newTask = ref("");

const pendingTasks = computed(() => tasks.value.filter((t) => !t.done).length);

const saveTasks = () =>
  localStorage.setItem("calyx_tasks", JSON.stringify(tasks.value));

const addTask = () => {
  if (!newTask.value.trim()) return;
  tasks.value.unshift({
    id: Date.now(),
    text: newTask.value.trim(),
    done: false,
  });
  newTask.value = "";
  saveTasks();
};

const toggleTask = (task) => {
  task.done = !task.done;
  saveTasks();
};

const removeTask = (id) => {
  tasks.value = tasks.value.filter((t) => t.id !== id);
  saveTasks();
};

// --- ЛОГИКА DRAG & DROP + SNAPPING ---
const isDragging = ref(false);
const widgetRef = ref(null);
// Ставим по умолчанию слева по центру
const posX = ref(parseInt(localStorage.getItem("calyx_notes_x")) || 24);
const posY = ref(
  parseInt(localStorage.getItem("calyx_notes_y")) ||
    window.innerHeight / 2 - 200
);

let startMouseX = 0;
let startMouseY = 0;
let initialPosX = 0;
let initialPosY = 0;
const margin = 24;

const startDrag = (e) => {
  if (e.target.closest(".no-drag")) return;
  isDragging.value = true;
  startMouseX = e.clientX;
  startMouseY = e.clientY;
  initialPosX = posX.value;
  initialPosY = posY.value;
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  posX.value = initialPosX + (e.clientX - startMouseX);
  posY.value = initialPosY + (e.clientY - startMouseY);
};

const stopDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);

  const snapThreshold = 30;
  const width = 320; // Ширина виджета
  const height = 400; // Примерная макс высота

  if (posX.value < snapThreshold) posX.value = margin;
  if (posX.value + width > window.innerWidth - snapThreshold)
    posX.value = window.innerWidth - width - margin;
  if (posY.value < snapThreshold) posY.value = margin;
  if (posY.value + height > window.innerHeight - snapThreshold)
    posY.value = window.innerHeight - height - margin;

  localStorage.setItem("calyx_notes_x", posX.value);
  localStorage.setItem("calyx_notes_y", posY.value);
};

onMounted(() => {
  // Проверка границ при изменении окна
  if (posX.value > window.innerWidth - 100) posX.value = 24;
  if (posY.value > window.innerHeight - 100) posY.value = 24;
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped>
/* --- БАЗОВЫЙ ВИДЖЕТ --- */
.notes-widget {
  position: fixed;
  width: 320px;
  max-height: 450px;
  display: flex;
  flex-direction: column;

  background: rgba(25, 25, 25, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
  color: white;
  z-index: 20; /* На одном уровне с погодой */
  cursor: grab;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.notes-widget.is-dragging {
  cursor: grabbing !important;
  opacity: 0.95;
  transform: scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}

/* Фонарик */
.notes-widget::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
  background: radial-gradient(
    150px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.08),
    transparent 100%
  );
  z-index: -1;
}
.notes-widget:hover::after {
  opacity: 1;
}

/* --- HEADER --- */
.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.notes-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.task-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

/* --- INPUT --- */
.add-task-wrapper {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  position: relative;
}
.task-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: white;
  padding: 10px 14px;
  font-size: 13px;
  outline: none;
  transition: all 0.3s;
}
.task-input:focus {
  border-color: #1da2fc;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 2px rgba(29, 162, 252, 0.15);
}

.add-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: rgba(29, 162, 252, 0.2);
  color: #1da2fc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.add-btn:hover:not(:disabled) {
  background: #1da2fc;
  color: #fff;
  transform: translateY(-1px);
}
.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
}

/* --- СПИСОК ЗАДАЧ --- */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 150px;
  padding-right: 4px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}
.task-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(2px);
}

.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.2s;
}
.task-item:hover .checkbox {
  border-color: #1da2fc;
}

.task-text {
  font-size: 13px;
  color: #eee;
  flex: 1;
  transition: all 0.3s;
  line-height: 1.4;
  word-break: break-word;
}

/* Состояние "Выполнено" */
.task-item.is-done .checkbox {
  background: #1da2fc;
  border-color: #1da2fc;
}
.task-item.is-done .task-text {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.4);
}

.delete-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0;
}
.task-item:hover .delete-btn {
  opacity: 1;
}
.delete-btn:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

/* --- АНИМАЦИИ ВУЕ --- */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-active {
  position: absolute;
} /* Для плавного схлопывания списка */

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  margin-top: 20px;
}

/* Скроллбар */
.scrollable::-webkit-scrollbar {
  width: 4px;
}
.scrollable::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 2px;
}
.scrollable::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
.scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>