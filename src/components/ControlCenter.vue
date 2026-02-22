<template>
  <div class="control-center-container">
    <button
      class="cc-btn animate-border"
      @click="toggleModal"
      @mousemove="handleMouseMove"
      title="Control Center"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="4" y1="21" x2="4" y2="14"></line>
        <line x1="4" y1="10" x2="4" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="3"></line>
        <line x1="20" y1="21" x2="20" y2="16"></line>
        <line x1="20" y1="12" x2="20" y2="3"></line>
        <line x1="1" y1="14" x2="7" y2="14"></line>
        <line x1="9" y1="8" x2="15" y2="8"></line>
        <line x1="17" y1="16" x2="23" y2="16"></line>
      </svg>
    </button>

    <Modal v-if="showModal" @close="showModal = false">
      <template #header>
        <div class="modal-header-brand">
          <span class="brand-name">Control Center</span>
        </div>
      </template>

      <template #body>
        <div class="modules-list">
          <div class="module-item glass-card" @mousemove="handleMouseMove">
            <div class="module-info">
              <span class="module-icon">🕒</span>
              <div>
                <h3>Clock Widget</h3>
                <p>Show time and date</p>
              </div>
            </div>
            <div
              class="ios-switch"
              :class="{ active: showClock }"
              @click="showClock = !showClock"
            >
              <div class="switch-thumb"></div>
            </div>
          </div>

          <div class="module-item glass-card" @mousemove="handleMouseMove">
            <div class="module-info">
              <span class="module-icon">⏱️</span>
              <div>
                <h3>Show Seconds</h3>
                <p>Display seconds on the clock</p>
              </div>
            </div>
            <div
              class="ios-switch"
              :class="{ active: showSeconds }"
              @click="showSeconds = !showSeconds"
            >
              <div class="switch-thumb"></div>
            </div>
          </div>

          <div class="module-item glass-card" @mousemove="handleMouseMove">
            <div class="module-info">
              <span class="module-icon">⛅</span>
              <div>
                <h3>Weather Widget</h3>
                <p>Show local weather and forecast</p>
              </div>
            </div>
            <div
              class="ios-switch"
              :class="{ active: showWeather }"
              @click="showWeather = !showWeather"
            >
              <div class="switch-thumb"></div>
            </div>
          </div>

          <div class="module-item glass-card" @mousemove="handleMouseMove">
            <div class="module-info">
              <span class="module-icon">🔗</span>
              <div>
                <h3>Quick Links</h3>
                <p>Show your bookmarks grid</p>
              </div>
            </div>
            <div
              class="ios-switch"
              :class="{ active: showLinks }"
              @click="showLinks = !showLinks"
            >
              <div class="switch-thumb"></div>
            </div>
          </div>

          <div class="module-item glass-card" @mousemove="handleMouseMove">
            <div class="module-info">
              <span class="module-icon">📝</span>
              <div>
                <h3>Notes & Tasks</h3>
                <p>Your daily to-do list</p>
              </div>
            </div>
            <div
              class="ios-switch"
              :class="{ active: showNotes }"
              @click="showNotes = !showNotes"
            >
              <div class="switch-thumb"></div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <button
          class="btn btn-primary animate-border"
          @click="showModal = false"
          @mousemove="handleMouseMove"
        >
          Done
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Modal from "@/components/Modal.vue";
import { useSpotlight } from "@/composables/useSpotlight";
import { useWidgets } from "@/composables/useWidgets";

const showModal = ref(false);
const toggleModal = () => (showModal.value = !showModal.value);

const { handleMouseMove } = useSpotlight();
const { showWeather, showLinks, showClock, showNotes, showSeconds } =
  useWidgets();
</script>

<style scoped>
/* --- ПОЗИЦИЯ КНОПКИ (Левый нижний угол) --- */
.control-center-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 100;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.05em;
}

/* Кнопка вызова (Стекло + Spotlight) */
.cc-btn {
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
.cc-btn::after {
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
.cc-btn:hover::after {
  opacity: 1;
}
.cc-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #1da2fc;
  transform: scale(1.1);
  box-shadow: 0 0 25px rgba(29, 162, 252, 0.4);
  color: #1da2fc;
}

/* --- СПИСОК МОДУЛЕЙ --- */
.modules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 320px;
  padding: 10px 0;
}

.module-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
}
.module-item::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    80px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.15),
    transparent 100%
  );
  z-index: 1;
}
.module-item:hover::after {
  opacity: 1;
}
.module-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.module-info {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 2;
}
.module-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}
.module-info h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}
.module-info p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* --- СТЕКЛЯННЫЙ IOS ТУМБЛЕР --- */
.ios-switch {
  position: relative;
  width: 52px;
  height: 28px;
  border-radius: 30px;
  cursor: pointer;
  z-index: 2;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ios-switch.active {
  background: rgba(29, 162, 252, 0.3);
  border-color: #1da2fc;
  box-shadow: inset 0 0 10px rgba(29, 162, 252, 0.3);
}

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ios-switch.active .switch-thumb {
  transform: translateX(24px);
  box-shadow: 0 0 10px rgba(29, 162, 252, 0.8);
}

/* --- КНОПКА ФУТЕРА --- */
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
  transform: translateY(-1px);
}
</style>