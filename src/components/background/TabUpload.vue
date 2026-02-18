<template>
  <div class="tab-panel">
    <div
      class="upload-zone"
      :class="{ 'dragging-over': isDraggingOver }"
      @dragover.prevent="isDraggingOver = true"
      @dragleave="isDraggingOver = false"
      @drop.prevent="handleFileDrop"
      @click="triggerFileInput"
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
import { ICONS } from "../../assets/icons";

const emit = defineEmits(["upload"]);
const isDraggingOver = ref(false);
const uploadFileName = ref("");
const fileInput = ref(null);

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
.upload-zone {
  border: 2px dashed rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.02);
}
.upload-zone:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
.upload-zone.dragging-over {
  border-color: #1da2fc;
  background: rgba(29, 162, 252, 0.05);
  transform: scale(0.98);
  box-shadow: 0 0 20px rgba(29, 162, 252, 0.2);
}
.upload-icon {
  margin-bottom: 20px;
  color: #1da2fc;
  opacity: 0.8;
  filter: drop-shadow(0 0 8px rgba(29, 162, 252, 0.4));
  transition: transform 0.3s ease;
}
.upload-zone:hover .upload-icon {
  transform: scale(1.1);
}
.success-text {
  color: #1da2fc;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(29, 162, 252, 0.3);
}
</style>
