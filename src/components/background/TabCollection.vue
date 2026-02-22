<template>
  <div class="tab-panel">
    <div class="wallpapers-grid scrollable">
      <div
        v-for="wp in collection"
        :key="wp.raw_id || wp.id"
        class="wallpaper-item collection-item"
        @mouseenter="hoveredItem = wp.raw_id || wp.id"
        @mouseleave="hoveredItem = null"
        @mousemove="handleMouseMove"
      >
        <div
          class="wp-preview"
          :style="{ backgroundImage: `url(${wp.thumb})` }"
        ></div>

        <Transition name="fade">
          <div
            class="collection-actions"
            v-if="hoveredItem === (wp.raw_id || wp.id)"
          >
            <button
              class="action-btn glass-btn"
              @click="$emit('select', wp)"
              title="Apply"
            >
              <svg
                width="16"
                height="16"
                :viewBox="ICONS.CHECK.viewBox"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="ICONS.CHECK.content"
              ></svg>
            </button>
            <button
              class="action-btn glass-btn"
              @click="downloadImage(wp.full)"
              title="Download"
            >
              <svg
                width="16"
                height="16"
                :viewBox="ICONS.DOWNLOAD.viewBox"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="ICONS.DOWNLOAD.content"
              ></svg>
            </button>
            <button
              class="action-btn glass-btn danger"
              @click="removeFromCollection(wp.raw_id || wp.id)"
              title="Delete"
            >
              <svg
                width="16"
                height="16"
                :viewBox="ICONS.TRASH.viewBox"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="ICONS.TRASH.content"
              ></svg>
            </button>
          </div>
        </Transition>

        <div class="wp-author glass-panel">by {{ wp.user }}</div>
      </div>

      <div v-if="collection.length === 0" class="empty-placeholder">
        <p class="empty-msg">
          Your collection is empty. Select images from Web 4K to add them here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCollection } from "@/composables/useCollection";
import { ICONS } from "@/assets/icons";
// ИМПОРТИРУЕМ ОБЩУЮ ЛОГИКУ ФОНАРИКА
import { useSpotlight } from "@/composables/useSpotlight";

defineEmits(["select"]);
const { collection, removeFromCollection } = useCollection();
const hoveredItem = ref(null);

// ИСПОЛЬЗУЕМ КОМПОЗАБЛ
const { handleMouseMove } = useSpotlight();

const downloadImage = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `wallpaper-${Date.now()}.jpg`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    window.open(url, "_blank");
  }
};
</script>

<style scoped>
.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wallpapers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: min-content;
  gap: 16px;
  padding: 10px 10px 20px 10px;
  flex: 1;
}

/* --- КАРТОЧКА ОБОЕВ (Стекло + Spotlight) --- */
.wallpaper-item {
  position: relative;
  width: 100%;
  height: 90px;
  border-radius: 12px;
  /* ВАЖНО: Исправляет обрезание бордера */
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Фонарик для карточки обоев - РАДИУС УМЕНЬШЕН до 50px */
.wallpaper-item::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    50px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.3),
    transparent 100%
  );
  z-index: 2;
}
.wallpaper-item:hover::after {
  opacity: 1;
}

.wallpaper-item:hover {
  transform: translateY(-4px) scale(1.03);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
  z-index: 10;
}

.wp-preview {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  /* ВАЖНО: Наследуем закругление */
  border-radius: inherit;
}
.wallpaper-item:hover .wp-preview {
  transform: scale(1.1);
}

/* --- ПАШКА АВТОРА (Стекло) --- */
.wp-author {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  color: #eee;
  font-size: 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 5;
  /* ВАЖНО: Наследуем закругление снизу */
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
.glass-panel {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* --- КНОПКИ ДЕЙСТВИЙ (Стекло) --- */
.collection-actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
  /* ВАЖНО: Наследуем закругление */
  border-radius: inherit;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(29, 162, 252, 0.3);
  border-color: #1da2fc;
  transform: scale(1.15);
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.5);
  color: #1da2fc;
}

.action-btn.danger:hover {
  background: rgba(255, 71, 87, 0.3);
  border-color: #ff4757;
  box-shadow: 0 0 15px rgba(255, 71, 87, 0.5);
  color: #ff4757;
}

/* --- СКРОЛЛБАР И ПРОЧЕЕ --- */
.scrollable {
  overflow-y: auto;
  padding-right: 5px;
}
.scrollable::-webkit-scrollbar {
  width: 6px;
}
.scrollable::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}
.scrollable::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
.scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.empty-placeholder {
  grid-column: span 4;
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>