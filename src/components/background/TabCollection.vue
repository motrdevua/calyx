<template>
  <div class="tab-panel">
    <div class="wallpapers-grid scrollable">
      <div
        v-for="wp in collection"
        :key="wp.raw_id || wp.id"
        class="wallpaper-item collection-item"
        @mouseenter="hoveredItem = wp.raw_id || wp.id"
        @mouseleave="hoveredItem = null"
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
              class="action-btn"
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
              class="action-btn"
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
              class="action-btn danger"
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

        <div class="wp-author">by {{ wp.user }}</div>
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
import { useCollection } from "../../composables/useCollection";
import { ICONS } from "../../assets/icons";

defineEmits(["select"]);
const { collection, removeFromCollection } = useCollection();
const hoveredItem = ref(null);

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
.wallpapers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: min-content;
  gap: 15px;
  margin-top: 10px;
  padding: 15px; /* Added padding to prevent hover effects from clipping */
}
.wallpaper-item {
  position: relative;
  display: block;
  width: 100%;
  height: 90px;
  border-radius: 8px;
  overflow: visible; /* Prevent glow clipping */
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
.collection-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}
.action-btn {
  background: rgba(0, 0, 0, 0.6);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.action-btn:hover {
  background: rgba(29, 162, 252, 0.8);
  border-color: #1da2fc;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.4);
}
.action-btn.danger:hover {
  background: rgba(255, 68, 68, 0.8);
  border-color: #ff4444;
  box-shadow: 0 0 15px rgba(255, 68, 68, 0.4);
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
