<template>
  <div class="loader-wrapper" :class="{ hidden: isHidden }">
    <div class="loader-inner">
      <div class="calyx-burst-container">
        <div class="clean-core"></div>

        <div class="goo-filter" :style="{ filter: `url('#${filterId}')` }">
          <div
            v-for="(color, index) in rainbowColors"
            :key="index"
            class="drop-wrapper"
            :style="{ '--i': index }"
          >
            <div class="drop-shape" :style="{ backgroundColor: color }"></div>
          </div>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="0"
          height="0"
        >
          <defs>
            <filter :id="filterId">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="5"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import {
  startFaviconLoading,
  stopFaviconLoading,
} from "@/utils/faviconController";
import { UI_CONSTANTS } from "@/config";

const emit = defineEmits(["loaded"]);
const isHidden = ref(false);
const filterId = ref(`calyx-pure-${Math.random().toString(36).slice(2, 9)}`);

// 1 секунда
const LIFETIME = 1000;

const rainbowColors = UI_CONSTANTS?.THEME?.RAINBOW || [
  "#FF4D4D",
  "#FF9E4D",
  "#F9FF4D",
  "#4DFF4D",
  "#4DFFFF",
  "#4D4DFF",
  "#9E4DFF",
];

onMounted(() => {
  startFaviconLoading();

  setTimeout(() => {
    if (!isHidden.value) {
      isHidden.value = true;
      stopFaviconLoading();
      emit("loaded");
    }
  }, LIFETIME);
});

onUnmounted(() => {
  stopFaviconLoading();
});
</script>

<style scoped>
/* ФОН */
.loader-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
  background-color: #000;
  animation: bg-fade-smooth 1s ease-out forwards;
}

.loader-wrapper.hidden {
  display: none;
}

/* Центрирующий контейнер */
.loader-inner {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: flower-implode 1s ease-in-out forwards;
}

@keyframes bg-fade-smooth {
  0%,
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes flower-implode {
  0%,
  85% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.4);
  }
}

/* КОНТЕЙНЕР АНИМАЦИИ */
.calyx-burst-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.goo-filter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* --- ЧИСТОЕ ЯДРО --- */
.clean-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-top: -11px;
  margin-left: -11px;
  background: white;
  border-radius: 50%;
  z-index: 20;
  animation: core-beat 1s ease-in-out forwards;
}

/* --- ИДЕАЛЬНАЯ КАПЛЯ НА CSS --- */
.drop-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  /* Размер капли 20px */
  width: 20px;
  height: 20px;
  margin-top: -10px;
  margin-left: -10px;
  animation: spin-burst 1s ease-in-out forwards;
}

.drop-shape {
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
}

/* --- КЛЮЧЕВЫЕ КАДРЫ ФИЗИКИ (ИЗМЕНЕНО) --- */
@keyframes spin-burst {
  0% {
    transform: rotate(calc(var(--i) * 51.4deg)) translateY(0) scale(0);
  }
  50% {
    /* Пик вылета.
       БЫЛО: translateY(-50px). 
       СТАЛО: translateY(-40px).
       Приблизили к центру на 10px (половина размера капли).
    */
    transform: rotate(calc(var(--i) * 51.4deg + 180deg)) translateY(-40px)
      scale(1.2);
  }
  100% {
    transform: rotate(calc(var(--i) * 51.4deg + 360deg)) translateY(0) scale(0);
  }
}

@keyframes core-beat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.5);
  }
}
</style>