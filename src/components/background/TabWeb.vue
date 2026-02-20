<template>
  <div class="tab-panel">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search 4K Wallpapers (e.g. Space, Nature...)"
        @keyup.enter="fetchImages(true)"
      />
      <button class="btn btn-primary" @click="fetchImages(true)">Search</button>
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
        >
          <div
            class="wp-preview"
            :style="{ backgroundImage: `url(${wp.thumb})` }"
          ></div>
          <div class="wp-author">by {{ wp.user }}</div>
        </div>
      </template>

      <!-- Skeletons -->
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

      <!-- Error State -->
      <div v-if="error" class="empty-placeholder error-state">
        <p class="error-msg">Error: {{ error }}</p>
        <button class="btn btn-secondary" @click="fetchImages(true)">
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
.search-bar {
  display: flex;
  gap: 12px;
  padding: 10px; /* Increased padding to allow glow bubble room */
}
.search-bar input {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.15);
  color: white;
  padding: 12px 16px;
  border-radius: 6px;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
}
.search-bar input:focus {
  border-color: #1da2fc;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.2);
}
.service-note {
  font-size: 10px;
  color: #555;
  text-align: right;
  margin-top: 10px;
}
.wallpapers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: min-content;
  gap: 15px;
  margin-top: 5px;
  padding: 15px; /* Added padding to prevent hover effects from clipping */
}
.wallpaper-item {
  position: relative;
  display: block;
  width: 100%;
  height: 90px; /* Reliable height to prevent grid collapse */
  border-radius: 8px;
  overflow: visible; /* Changed to visible to allow hover glow/scale to show */
  cursor: pointer;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.wallpaper-item:hover {
  transform: translateY(-5px) scale(1.05);
  border-color: #1da2fc;
  box-shadow: 0 10px 20px rgba(29, 162, 252, 0.3);
  z-index: 10;
}
.wp-preview {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
.wp-author {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: #eee;
  font-size: 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.skeleton {
  background: rgba(255, 255, 255, 0.1);
  animation: pulse 1.5s infinite;
}
.wp-author-skeleton {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: rgba(255, 255, 255, 0.05);
}
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}
.scrollable {
  overflow-y: auto;
  padding-right: 5px;
}
.scrollable::-webkit-scrollbar {
  width: 6px;
}
.scrollable::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.scrollable::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.empty-placeholder {
  grid-column: span 4;
  text-align: center;
  padding: 40px;
  color: #888;
}
.error-msg {
  color: #ff4444;
  margin-bottom: 10px;
}
</style>
