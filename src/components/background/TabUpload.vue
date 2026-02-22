<template>
  <div class="tab-panel">
    <div
      class="upload-zone"
      :class="{ 'dragging-over': isDraggingOver }"
      @dragover.prevent="isDraggingOver = true"
      @dragleave="isDraggingOver = false"
      @drop.prevent="handleFileDrop"
      @click="triggerFileInput"
      @mousemove="handleMouseMove"
    >
      <div class="upload-icon">
        <svg
          width="48"
          height="48"
          :viewBox="ICONS.UPLOAD.viewBox"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          v-html="ICONS.UPLOAD.content"
        ></svg>
      </div>
      <p v-if="!uploadFileName">Click or Drag & Drop image here</p>
      <p v-else class="success-text">Selected: {{ uploadFileName }}</p>
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        @change="handleFileUpload"
        style="display: none"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ICONS } from "@/assets/icons";
// ИМПОРТИРУЕМ ОБЩУЮ ЛОГИКУ ФОНАРИКА
import { useSpotlight } from "@/composables/useSpotlight";

const emit = defineEmits(["upload"]);
const isDraggingOver = ref(false);
const uploadFileName = ref("");
const fileInput = ref(null);

// ИСПОЛЬЗУЕМ КОМПОЗАБЛ
const { handleMouseMove } = useSpotlight();

const triggerFileInput = () => fileInput.value.click();

const processFile = (file) => {
  if (file && file.type.startsWith("image/")) {
    uploadFileName.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      emit("upload", e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const handleFileUpload = (e) => processFile(e.target.files[0]);
const handleFileDrop = (e) => {
  isDraggingOver.value = false;
  processFile(e.dataTransfer.files[0]);
};
</script>

<style scoped>
.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

/* --- ЗОНА ЗАГРУЗКИ (Glassmorphism + Spotlight) --- */
.upload-zone {
  position: relative;
  flex: 1;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;

  /* Стекло */
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Фонарик внутри зоны - РАДИУС УМЕНЬШЕН до 60px (чуть больше, чем у кнопок) */
.upload-zone::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    60px circle at var(--x, 50%) var(--y, 50%),
    rgba(29, 162, 252, 0.15),
    transparent 100%
  );
}

.upload-zone:hover::after,
.upload-zone.dragging-over::after {
  opacity: 1;
}

/* Эффект при наведении (Пружинит вверх) */
.upload-zone:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #1da2fc;
  box-shadow: inset 0 0 25px rgba(29, 162, 252, 0.2);
  transform: scale(1.02);
}

/* Эффект при перетаскивании файла (Вдавливается) */
.upload-zone.dragging-over {
  border-color: #1da2fc;
  background: rgba(29, 162, 252, 0.1);
  transform: scale(0.98);
  box-shadow: inset 0 0 40px rgba(29, 162, 252, 0.3),
    0 0 20px rgba(29, 162, 252, 0.2);
}

/* --- ИКОНКА И ТЕКСТ --- */
.upload-icon {
  margin-bottom: 20px;
  color: #1da2fc;
  opacity: 0.9;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.upload-zone:hover .upload-icon,
.upload-zone.dragging-over .upload-icon {
  transform: translateY(-8px) scale(1.15);
  filter: drop-shadow(0 5px 15px rgba(29, 162, 252, 0.6));
}

p {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
  margin: 0;
}

.upload-zone:hover p,
.upload-zone.dragging-over p {
  color: rgba(255, 255, 255, 0.9);
}

.success-text {
  color: #1da2fc !important;
  text-shadow: 0 0 10px rgba(29, 162, 252, 0.4);
}
</style>