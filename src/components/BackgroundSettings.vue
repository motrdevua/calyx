<template>
  <div class="bg-settings-container">
    <button
      class="settings-btn animate-border"
      @click="toggleModal"
      @mousemove="handleMouseMove"
      title="Background Settings"
    >
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
              @mousemove="handleMouseMove"
            >
              {{ tab.label }}
            </button>
          </div>

          <transition name="fade" mode="out-in">
            <component
              :is="activeTabComponent"
              @select="handleSelect"
              @upload="handleUpload"
            />
          </transition>
        </div>
      </template>

      <template #footer>
        <div class="modal-footer-actions">
          <button
            class="btn animate-border"
            @click="resetToDefault"
            @mousemove="handleMouseMove"
          >
            Reset to Default
          </button>
          <button
            class="btn btn-primary animate-border"
            @click="saveAndClose"
            @mousemove="handleMouseMove"
          >
            Done
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Modal from "@/components/Modal.vue";
import TabWeb from "@/components/background/TabWeb.vue";
import TabCollection from "@/components/background/TabCollection.vue";
import TabUpload from "@/components/background/TabUpload.vue";
import TabColors from "@/components/background/TabColors.vue";
import { useBackground } from "@/composables/useBackground";
import { useCollection } from "@/composables/useCollection";
import { ICONS } from "@/assets/icons";

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

// Эффект Фонарика (Spotlight)
const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty("--x", `${x}px`);
  e.currentTarget.style.setProperty("--y", `${y}px`);
};

defineExpose({ toggleModal });
</script>

<style scoped>
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

/* ОБНОВЛЕННАЯ КНОПКА ШЕСТЕРЕНКИ (Glassmorphism + Spotlight) */
.settings-btn {
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
.settings-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    60px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.25),
    transparent 100%
  );
}
.settings-btn:hover::after {
  opacity: 1;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #1da2fc;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 0 25px rgba(29, 162, 252, 0.4);
  color: #1da2fc;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 650px;
  max-width: 800px;
  height: 520px;
}

/* Вкладки */
.tabs {
  display: flex;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 5px 5px 20px 5px;
  flex-shrink: 0;
}

.btn-tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aaa;
  padding: 8px 18px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
.btn-tab::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    60px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.15),
    transparent 100%
  );
}
.btn-tab:hover::after {
  opacity: 1;
}

.btn-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}
.btn-tab.active {
  color: #fff;
  background: rgba(29, 162, 252, 0.15);
  border-color: #1da2fc;
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.3);
}

.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* АНИМАЦИИ ВНУТРИ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* ФУТЕР И ОБЩИЕ КНОПКИ (Идентично QuickLinks) */
.modal-footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.btn {
  position: relative;
  overflow: hidden;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-family: inherit;
  backdrop-filter: blur(12px);
}
.btn::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    80px circle at var(--x, 50%) var(--y, 50%),
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

/* ЗОНА ЗАГРУЗКИ И ПРОЧЕЕ (Адаптация под фрост) */
.upload-zone {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  padding: 40px 20px;
  text-align: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);
}
.upload-zone:hover,
.upload-zone.dragging-over {
  background: rgba(255, 255, 255, 0.1);
  border-color: #1da2fc;
  box-shadow: inset 0 0 20px rgba(29, 162, 252, 0.15);
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
  color: #aaa;
}
.file-info {
  font-size: 12px;
  color: #1da2fc;
  margin-top: 10px;
  background: rgba(29, 162, 252, 0.15);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.preview-box {
  width: 100%;
  height: 50px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}
.note {
  font-size: 11px;
  color: #888;
  margin-top: 5px;
  text-align: right;
}
.empty-msg {
  text-align: center;
  color: #aaa;
  margin: 20px 0;
  font-size: 14px;
}
.mini-loader {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(29, 162, 252, 0.3);
  border-top-color: #1da2fc;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>