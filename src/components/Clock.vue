<template>
  <div class="clock-wrapper" @mousemove="handleMouseMove">
    <div class="widget-controls">
      <button
        class="control-btn"
        @click="cycleStyle"
        title="Change Clock Style"
      >
        <svg
          v-if="clockStyle === 'digital'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <svg
          v-else-if="clockStyle === 'apple'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      </button>
    </div>

    <transition name="fade-mode" mode="out-in">
      <div
        v-if="clockStyle === 'digital'"
        class="clock mode-digital"
        key="digital"
      >
        <div id="days">
          <div
            v-for="day in daysList"
            :key="day"
            :class="{ active: day === currentDay }"
            :style="day === currentDay ? activeDayStyle : ''"
          >
            {{ day }}
          </div>
        </div>
        <div id="time">
          <div>
            <span id="hours">{{ time.hours }}</span>
            <span>Hours</span>
          </div>
          <div><span class="dots">:</span></div>
          <div>
            <span id="minutes">{{ time.minutes }}</span>
            <span>Minutes</span>
          </div>

          <template v-if="showSeconds">
            <div><span class="dots">:</span></div>
            <div>
              <span id="seconds">{{ time.seconds }}</span>
              <span>Seconds</span>
            </div>
          </template>
        </div>
      </div>

      <div
        v-else-if="clockStyle === 'apple'"
        class="clock mode-apple"
        key="apple"
      >
        <div class="apple-time">
          {{ time.hours }}:{{ time.minutes
          }}<span v-if="showSeconds" class="apple-seconds">{{
            time.seconds
          }}</span>
        </div>
        <div class="apple-date">{{ fullDateApple }}</div>
      </div>

      <div v-else-if="clockStyle === 'flip'" class="clock mode-flip" key="flip">
        <div class="flip-group">
          <div class="flip-card">
            <span>{{ time.hours }}</span>
          </div>
          <span class="flip-label">HOURS</span>
        </div>
        <div class="flip-dots">:</div>
        <div class="flip-group">
          <div class="flip-card">
            <span>{{ time.minutes }}</span>
          </div>
          <span class="flip-label">MINUTES</span>
        </div>

        <template v-if="showSeconds">
          <div class="flip-dots">:</div>
          <div class="flip-group">
            <div class="flip-card">
              <span>{{ time.seconds }}</span>
            </div>
            <span class="flip-label">SECONDS</span>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useTime } from "@/composables/useTime";
import { useSpotlight } from "@/composables/useSpotlight";
import { useWidgets } from "@/composables/useWidgets";

const daysList = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const { time, currentDay } = useTime();
const { handleMouseMove } = useSpotlight();

// ИМПОРТИРУЕМ НАСТРОЙКУ СЕКУНД
const { showSeconds } = useWidgets();

// Состояние стиля часов
const clockStyle = ref(localStorage.getItem("calyx_clock_style") || "digital");

const cycleStyle = () => {
  const styles = ["digital", "apple", "flip"];
  const currentIndex = styles.indexOf(clockStyle.value);
  clockStyle.value = styles[(currentIndex + 1) % styles.length];
  localStorage.setItem("calyx_clock_style", clockStyle.value);
};

// Стили для Digital
const activeDayStyle =
  "font-size: 23px; font-weight: bold; -webkit-box-reflect: below -25px linear-gradient(transparent, #0003);";

// Форматирование даты для Apple режима
const fullDateApple = computed(() => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
});
</script>

<style scoped>
/* --- КОНТЕЙНЕР И УПРАВЛЕНИЕ --- */
.clock-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  /* ИСПРАВЛЕНИЕ: Добавили большой отступ снизу, чтобы отражение не обрезалось */
  padding: 24px 24px 100px 24px;
  border-radius: 24px;
  transition: all 0.4s ease;
  border: 1px solid transparent;
}

/* Стекло появляется только при наведении на весь блок часов */
.clock-wrapper:hover {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.widget-controls {
  position: absolute;
  top: 12px;
  right: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 50;
}
.clock-wrapper:hover .widget-controls {
  opacity: 1;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}
.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Плавная смена режимов */
.fade-mode-enter-active,
.fade-mode-leave-active {
  transition: all 0.3s ease;
}
.fade-mode-enter-from,
.fade-mode-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* =========================================
   РЕЖИМ 1: DIGITAL (Оригинал)
========================================= */
.mode-digital {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  margin: 0;
}
.mode-digital #time {
  display: flex;
}
.mode-digital #time div {
  position: relative;
  margin: 0 0.5em;
  height: 75%;
  -webkit-box-reflect: below 1px linear-gradient(transparent, #0004);
}
.mode-digital #time div span {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 75%;
  color: #ffffff;
  font-weight: 500;
  font-size: 5em;
  font-variant-numeric: tabular-nums;
  font-family: "Orbitron", sans-serif;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.mode-digital #time div .dots {
  min-width: unset;
}
.mode-digital #time div span:nth-child(2) {
  z-index: 9;
  height: 16px;
  border-radius: 0;
  box-shadow: none;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 700;
  font-size: 0.8em;
}
.mode-digital #days {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
  color: #ffffff;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.mode-digital #days div {
  padding: 7px;
  font-size: 13px;
  -webkit-box-reflect: below -19px linear-gradient(transparent, #0003);
  transition: all 0.3s;
}

/* =========================================
   РЕЖИМ 2: APPLE (Минимализм iOS)
========================================= */
.mode-apple {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
}
.apple-time {
  font-size: 8rem;
  font-weight: 200;
  color: #fff;
  letter-spacing: -3px;
  line-height: 1;
  text-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
.apple-seconds {
  font-size: 3.5rem;
  font-weight: 200;
  opacity: 0.7;
  margin-left: 8px;
}
.apple-date {
  font-size: 1.5rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 15px;
  letter-spacing: 0.5px;
  text-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  text-transform: capitalize;
}

/* =========================================
   РЕЖИМ 3: FLIP CLOCK (Ретро-карточки)
========================================= */
.mode-flip {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.flip-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.flip-card {
  position: relative;
  width: 120px;
  height: 140px;
  background: rgba(20, 20, 20, 0.75);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  font-weight: 700;
  color: #f0f0f0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.flip-card::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  background: rgba(0, 0, 0, 0.6);
  transform: translateY(-50%);
  z-index: 5;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
}

.flip-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
}
.flip-dots {
  font-size: 4rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  padding-bottom: 30px;
  animation: blink 1.5s ease-in-out infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>