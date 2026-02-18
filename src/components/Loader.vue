<template>
  <div class="loader-wrapper" :class="{ hidden: isHidden }">
    <div class="loader-inner">
      <div class="goo-container" :style="{ filter: `url('#${filterId}')` }">
        <!-- Main Core: Branded Diamond -->
        <div class="calyx-core">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12L16 2Z"
              fill="white"
            />
          </svg>
        </div>

        <!-- Animated Petals: 8 for a full bloom -->
        <div
          v-for="i in 8"
          :key="i"
          class="calyx-petal"
          :style="{ '--i': i - 1 }"
        >
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12L16 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      <!-- SVG Filter for Gooey Effect: Sharper (blur 5 instead of 10) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="0"
        height="0"
        style="position: absolute"
      >
        <defs>
          <filter :id="filterId">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  manual: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["loaded"]);
const isHidden = ref(false);
const filterId = ref(`goo-${Math.random().toString(36).substring(2, 9)}`);

onMounted(() => {
  if (!props.manual) {
    setTimeout(() => {
      isHidden.value = true;
      emit("loaded");
    }, 1500);
  }
});

watch(
  () => props.loading,
  (newVal) => {
    if (props.manual) {
      isHidden.value = !newVal;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.loader-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  transition: opacity 0.5s ease;
  pointer-events: all;
}

.loader-wrapper.hidden {
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}

.loader-inner {
  position: relative;
  width: 100px;
  height: 100px;
}

.goo-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.calyx-core {
  width: 25px;
  height: 25px;
  z-index: 2;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
  animation: core-pulse 2s ease-in-out infinite;
}

.calyx-core svg {
  width: 100%;
  height: 100%;
}

@keyframes core-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

.calyx-petal {
  position: absolute;
  width: 50px;
  height: 50px;
  color: #1da2fc;
  transform-origin: center center;
  /* Each petal is offset by 45deg (360/8) */
  transform: rotate(calc(var(--i) * 45deg)) translateY(0);
  animation: bloom-petal 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: calc(var(--i) * 0.15s);
  mix-blend-mode: screen;
}

.calyx-petal svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 10px rgba(29, 162, 251, 0.6));
}

@keyframes bloom-petal {
  0% {
    transform: rotate(calc(var(--i) * 45deg)) translateY(0) scale(0.5);
    opacity: 0;
  }
  30% {
    transform: rotate(calc(var(--i) * 45deg)) translateY(-30px) scale(1.1);
    opacity: 1;
  }
  60% {
    transform: rotate(calc(var(--i) * 45deg + 20deg)) translateY(-35px)
      scale(0.9);
    opacity: 1;
  }
  100% {
    transform: rotate(calc(var(--i) * 45deg + 45deg)) translateY(0) scale(0.3);
    opacity: 0;
  }
}

/* Loader inner size override */
.loader-inner {
  position: relative;
  width: 150px;
  height: 150px;
}
</style>
