<template>
  <div class="bg-settings-container">
    <button
      class="settings-btn"
      @click="toggleModal"
      title="Background Settings"
    >
      <!-- Gear Icon (Lucide/Standard) -->
      <svg
        width="24"
        height="24"
        :viewBox="ICONS.GEAR.viewBox"
        fill="currentColor"
        v-html="ICONS.GEAR.content"
      ></svg>
    </button>

    <Modal
      v-if="showModal"
      :show="showModal"
      :peek="isPeeking"
      @close="closeModal"
      @peek:start="isPeeking = true"
      @peek:stop="isPeeking = false"
    >
      <template #header>
        <div class="modal-header-brand">
          <svg
            width="28"
            height="28"
            :viewBox="ICONS.LOGO.viewBox"
            v-html="ICONS.LOGO.content"
            class="brand-logo-small"
          ></svg>
          <span class="brand-name">Calyx Tab</span>
        </div>
      </template>
      <template #body>
        <div class="settings-content">
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="btn-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <component
            :is="activeTabComponent"
            @select="handleSelect"
            @upload="handleUpload"
          />
        </div>
      </template>

      <!-- Footer Buttons -->
      <template #footer>
        <div class="modal-footer-actions">
          <button class="btn animate-border" @click="resetToDefault">
            Reset to Default
          </button>
          <button class="btn btn-primary animate-border" @click="saveAndClose">
            Done
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Modal from "./Modal.vue";
import TabWeb from "./background/TabWeb.vue";
import TabCollection from "./background/TabCollection.vue";
import TabUpload from "./background/TabUpload.vue";
import TabColors from "./background/TabColors.vue";
import { useBackground } from "../composables/useBackground";
import { useCollection } from "../composables/useCollection";
import { ICONS } from "../assets/icons";

const showModal = ref(false);
const activeTab = ref("web");

const { currentBackground, previewBackground, saveBackground, cancelPreview } =
  useBackground();
const { addToCollection } = useCollection();
const isPeeking = ref(false);
const pendingWp = ref(null);

const tabs = [
  { id: "web", label: "Web 4K", component: TabWeb },
  { id: "collection", label: "Collection", component: TabCollection },
  { id: "upload", label: "Upload", component: TabUpload },
  { id: "colors", label: "Colors", component: TabColors },
];

const activeTabComponent = computed(() => {
  return tabs.find((t) => t.id === activeTab.value)?.component;
});

const toggleModal = () => (showModal.value = !showModal.value);

const closeModal = async () => {
  await cancelPreview();
  showModal.value = false;
  isPeeking.value = false;
  pendingWp.value = null;
};

const handleSelect = async (wp) => {
  const bgValue = `url(${wp.full})`;
  previewBackground("image", bgValue);
  // Store selected wallpaper but don't add to collection yet
  pendingWp.value = wp;
};

const handleUpload = async (base64) => {
  const bgValue = `url(${base64})`;
  previewBackground("image", bgValue);
};

const resetToDefault = () => {
  previewBackground("default", null);
  pendingWp.value = null;
};

const saveAndClose = async () => {
  if (pendingWp.value) {
    await addToCollection(pendingWp.value);
  }
  await saveBackground();
  showModal.value = false;
  isPeeking.value = false;
  pendingWp.value = null;
};

defineExpose({ toggleModal });
</script>

<style>
/* Keeping core styles but scoped to the container or moved to global if needed */
.bg-settings-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.modal-header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
}

.brand-logo-small {
  filter: drop-shadow(0 0 8px rgba(29, 162, 252, 0.4));
}

.brand-name {
  font-family: "Orbitron", sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.05em;
  background: linear-gradient(to right, #fff, #1da2fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.settings-btn {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #1da2fc;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.settings-btn:hover {
  background: rgba(29, 162, 252, 0.1);
  border-color: #1da2fc;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.4);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 650px;
  max-width: 800px;
  height: 520px; /* Fixed height to prevent jitter */
}

.tabs {
  display: flex;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 5px 5px 20px 5px; /* Extra padding for glow */
  flex-shrink: 0;
}

.btn-tab {
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.05);
  color: #888;
  padding: 8px 18px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  font-weight: 500;
}

.btn-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-tab.active {
  color: #1da2fc;
  background: rgba(29, 162, 252, 0.1);
  border-color: rgba(29, 162, 252, 0.5);
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.2);
}

.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent panel itself from scrolling, child grid will scroll */
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* The styles for wallpaper-item and action-btn have been moved to their respective Tab components */
.mini-loader {
  width: 30px;
  height: 30px;
  border: 2px solid #1da2fc;
  border-top-color: transparent;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}

.empty-msg {
  text-align: center;
  color: #888;
  margin: 20px 0;
}

.wallpaper-item:hover,
.wallpaper-item.selected {
  transform: scale(1.05);
  border-color: #1da2fc;
  box-shadow: 0 0 8px rgba(29, 162, 252, 0.4);
}

.wallpaper-item.skeleton {
  background: rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  cursor: default;
}

.wallpaper-item.skeleton::after {
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
    rgba(255, 255, 255, 0.03) 20%,
    rgba(255, 255, 255, 0.06) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.refresh-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
}

.upload-zone {
  border: 1px dashed rgba(255, 255, 255, 0.1);
  padding: 40px 20px;
  text-align: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-zone:hover,
.upload-zone.dragging-over {
  background: rgba(255, 255, 255, 0.05);
  border-color: #1da2fc;
  box-shadow: inset 0 0 20px rgba(29, 162, 252, 0.1);
}

.upload-zone.dragging-over {
  transform: scale(1.02);
}

.upload-icon {
  color: #1da2fc;
  margin-bottom: 8px;
  transition: transform 0.3s;
}

.upload-zone:hover .upload-icon {
  transform: translateY(-5px);
}

.upload-zone h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.upload-zone p {
  margin: 0;
  font-size: 14px;
  color: #888;
}

.file-info {
  font-size: 12px;
  color: #1da2fc;
  margin-top: 10px;
  background: rgba(29, 162, 252, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.modal-footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.preview-box {
  width: 100%;
  height: 50px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.note {
  font-size: 10px;
  color: #666;
  margin-top: 5px;
  text-align: right;
}
</style>
