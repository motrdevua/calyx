<template>
  <div class="tab-panel">
    <div class="colors-container">
      <div class="glass-card">
        <button
          class="btn btn-primary"
          @click="generateGradient"
          @mousemove="handleMouseMove"
        >
          Generate Random Gradient
        </button>
        <p class="hint">Click to preview dynamic color combinations</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBackground } from "@/composables/useBackground";
// ИМПОРТИРУЕМ ОБЩУЮ ЛОГИКУ ФОНАРИКА
import { useSpotlight } from "@/composables/useSpotlight";

const { generateGradient } = useBackground();

// ИСПОЛЬЗУЕМ КОМПОЗАБЛ
const { handleMouseMove } = useSpotlight();
</script>

<style scoped>
.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.colors-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Стеклянная подложка для центрирования контента */
.glass-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Стеклянная кнопка со Spotlight */
.btn {
  position: relative;
  overflow: hidden;
  padding: 14px 28px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-weight: 600;
  font-family: inherit;
  font-size: 15px;
  letter-spacing: 0.5px;
}

/* Фонарик внутри кнопки - РАДИУС УМЕНЬШЕН до 50px */
.btn::after {
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
}
.btn:hover::after {
  opacity: 1;
}

.btn-primary {
  background: rgba(29, 162, 252, 0.15);
  color: #1da2fc;
  border-color: rgba(29, 162, 252, 0.4);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  background: #1da2fc;
  color: #fff;
  border-color: #1da2fc;
  box-shadow: 0 12px 25px rgba(29, 162, 252, 0.4);
  transform: translateY(-2px) scale(1.03);
}

.hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  letter-spacing: 0.5px;
  margin: 0;
}
</style>