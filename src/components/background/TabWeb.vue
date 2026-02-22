<template>
  <div class="tab-panel">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search 4K Wallpapers (e.g. Space, Nature...)"
        @keyup.enter="fetchImages(true)"
      />
      <button
        class="btn btn-primary"
        @click="fetchImages(true)"
        @mousemove="handleMouseMove"
      >
        Search
      </button>
    </div>

    <div
      class="wallpapers-grid scrollable"
      @scroll="handleScroll"
      style="min-height: 400px; max-height: 400px"
    >
      <template v-if="images.length > 0">
        <div
          v-for="wp in images"
          :key="wp.id"
          class="wallpaper-item"
          @click="$emit('select', wp)"
          @mousemove="handleMouseMove"
        >
          <div
            class="wp-preview"
            :style="{ backgroundImage: `url(${wp.thumb})` }"
          ></div>
          <div class="wp-author glass-panel">by {{ wp.user }}</div>
        </div>
      </template>

      <template v-if="isLoading">
        <div
          v-for="i in 8"
          :key="'skeleton-' + i"
          class="wallpaper-item skeleton"
        >
          <div class="wp-preview"></div>
          <div class="wp-author-skeleton"></div>
        </div>
      </template>

      <div v-if="error" class="empty-placeholder error-state">
        <p class="error-msg">Error: {{ error }}</p>
        <button
          class="btn"
          @click="fetchImages(true)"
          @mousemove="handleMouseMove"
        >
          Retry
        </button>
      </div>

      <div
        v-else-if="!isLoading && images.length === 0"
        class="empty-placeholder"
      >
        <p>No images found. Try another search!</p>
      </div>
    </div>

    <p class="service-note">Powered by Wallhaven</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useWallhaven } from "@/composables/useWallhaven";
// ИМПОРТИРУЕМ ОБЩУЮ ЛОГИКУ ФОНАРИКА
import { useSpotlight } from "@/composables/useSpotlight";

const emit = defineEmits(["select"]);
const {
  images,
  isLoading,
  error,
  searchQuery,
  pickRandomTopic,
  fetchImages,
  fetchNextPage,
} = useWallhaven();

// ИСПОЛЬЗУЕМ КОМПОЗАБЛ
const { handleMouseMove } = useSpotlight();

const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target;
  if (scrollTop + clientHeight >= scrollHeight - 20 && !isLoading.value) {
    fetchNextPage();
  }
};

onMounted(() => {
  if (images.value.length === 0) {
    pickRandomTopic();
    fetchImages(true);
  }
});
</script>

<style scoped>
.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* --- ПАНЕЛЬ ПОИСКА --- */
.search-bar {
  display: flex;
  gap: 12px;
  padding: 10px 5px;
}

.search-bar input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  padding: 12px 16px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  font-family: inherit;
  font-size: 14px;
}

.search-bar input:focus {
  border-color: #1da2fc;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(29, 162, 252, 0.15);
}

.service-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  text-align: right;
  margin-top: 8px;
  padding-right: 5px;
}

/* --- СЕТКА ОБОЕВ --- */
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
  /* ВАЖНО: box-sizing помогает бордеру не вылезать наружу */
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
  /* ВАЖНО: Наследуем закругление родителя, чтобы не было острых углов */
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

/* --- СКЕЛЕТОНЫ (Shimmer Effect) --- */
.skeleton {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
  position: relative;
  cursor: default;
}
.skeleton::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
  z-index: 1;
  border-radius: inherit;
}
.wp-author-skeleton {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 2;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* --- СОСТОЯНИЯ (ПУСТО / ОШИБКА) --- */
.empty-placeholder {
  grid-column: span 4;
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 14px;
}
.error-msg {
  color: #ff4757;
  margin-bottom: 15px;
  font-weight: 500;
}

/* --- СКРОЛЛБАР --- */
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

/* --- КНОПКИ (Стекло + Уменьшенный Spotlight) --- */
.btn {
  position: relative;
  overflow: hidden;
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-family: inherit;
}
/* Радиус фонарика на кнопке уменьшен до 50px */
.btn::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    50px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.2),
    transparent 100%
  );
}
.btn:hover::after {
  opacity: 1;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.btn-primary {
  background: rgba(29, 162, 252, 0.2);
  color: #1da2fc;
  border-color: rgba(29, 162, 252, 0.4);
}
.btn-primary:hover {
  background: #1da2fc;
  color: #fff;
  border-color: #1da2fc;
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.4);
}
</style>