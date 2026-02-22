<template>
  <transition name="fade-scale">
    <div
      v-if="isVisible"
      ref="widgetRef"
      class="weather-corner-widget animate-border"
      :class="['mode-' + displayMode, { 'is-dragging': isDragging }]"
      :style="{ left: posX + 'px', top: posY + 'px' }"
      @mousemove="handleMouseMove"
      @mousedown="startDrag"
    >
      <div class="widget-controls no-drag">
        <button
          class="control-btn"
          @click.stop="cycleMode"
          title="Change Size"
          @mousedown.stop
        >
          <svg
            v-if="displayMode === 'full'"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 14h6v6" />
            <path d="M20 10h-6V4" />
            <path d="M14 10l7-7" />
            <path d="M3 21l7-7" />
          </svg>
          <svg
            v-else-if="displayMode === 'minimal'"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
          <svg
            v-else
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="21 8 21 21 8 21" />
            <line x1="21" y1="21" x2="3" y2="3" />
            <polyline points="3 16 3 3 16 3" />
          </svg>
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" class="weather-loading" key="loading">
          <div class="mini-spinner"></div>
        </div>

        <div v-else-if="activeWeather" class="weather-content" key="content">
          <div
            v-if="displayMode === 'micro'"
            class="micro-layout no-drag"
            @click.stop="cycleMode"
          >
            <span class="micro-icon">{{ activeWeather.icon }}</span>
            <span class="micro-temp"
              >{{ activeWeather.temp
              }}<span class="micro-deg">&deg;</span></span
            >
            <span class="micro-desc">{{ activeWeather.description }}</span>
          </div>

          <template v-else>
            <div class="split-layout">
              <div class="left-block">
                <div class="weather-desc">{{ activeWeather.description }}</div>
                <div class="main-weather-group">
                  <div class="big-icon">{{ activeWeather.icon }}</div>
                  <div class="big-temp">
                    {{ activeWeather.temp }}<span class="degree">&deg;</span>
                  </div>
                </div>
              </div>

              <div class="right-block no-drag">
                <div class="location-container">
                  <div
                    class="location-header"
                    @click.stop="startEditing"
                    v-if="!isEditing"
                  >
                    <span class="edit-icon">📍</span>
                    <span class="location-text">{{ location }}</span>
                  </div>
                  <input
                    v-else
                    ref="locationInput"
                    v-model="searchQuery"
                    @keyup.enter="searchLocation"
                    @blur="searchLocation"
                    class="location-input"
                    type="text"
                    placeholder="Введіть місто..."
                  />
                </div>

                <div class="date-header">{{ activeWeather.dateText }}</div>

                <div class="weather-details">
                  <div class="detail-row">
                    <span class="detail-label">Відчувається:</span>
                    <span class="detail-value"
                      >{{ activeWeather.feelsLike
                      }}<span class="small-deg">&deg;</span></span
                    >
                  </div>
                  <div class="detail-row">
                    <span class="detail-label"
                      >{{ activeWeather.extraLabel }}:</span
                    >
                    <span class="detail-value">{{
                      activeWeather.extraValue
                    }}</span>
                  </div>
                  <div class="detail-row" v-if="displayMode === 'full'">
                    <span class="detail-label">Вітер:</span>
                    <span class="detail-value"
                      >{{ activeWeather.wind }} км/год</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <transition name="slide-up">
              <div
                class="forecast-horizontal no-drag"
                v-if="displayMode === 'full'"
              >
                <div
                  v-for="(day, index) in forecastList"
                  :key="index"
                  class="forecast-col"
                  :class="{ 'is-selected-col': selectedIndex === index }"
                  @click.stop="selectDay(index)"
                  @mousemove="handleMouseMove"
                >
                  <div class="f-date">{{ day.dateString }}</div>
                  <div class="f-day" :class="{ 'today-text': index === 0 }">
                    {{ day.dayName }}
                  </div>
                  <div class="f-icon">{{ day.icon }}</div>
                  <div class="f-temp-max">
                    {{ day.maxTemp }}<span class="small-deg">&deg;</span>
                  </div>
                  <div class="f-temp-min">
                    {{ day.minTemp }}<span class="small-deg">&deg;</span>
                  </div>
                </div>
              </div>
            </transition>
          </template>
        </div>

        <div v-else class="weather-error" key="error">НЕМАЄ ДАНИХ</div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useSpotlight } from "@/composables/useSpotlight";

// --- СОСТОЯНИЯ ВИДЖЕТА ---
const isVisible = ref(true);
const displayMode = ref(localStorage.getItem("calyx_weather_mode") || "full"); // full, minimal, micro
const widgetRef = ref(null);

const { handleMouseMove } = useSpotlight();

// --- ЛОГИКА DRAG & DROP + SNAPPING ---
const isDragging = ref(false);
const posX = ref(
  parseInt(localStorage.getItem("calyx_weather_x")) || window.innerWidth - 404
);
const posY = ref(parseInt(localStorage.getItem("calyx_weather_y")) || 24);
let startMouseX = 0;
let startMouseY = 0;
let initialPosX = 0;
let initialPosY = 0;
const margin = 24; // Отступ от края

const startDrag = (e) => {
  if (e.target.closest(".no-drag")) return;

  isDragging.value = true;
  startMouseX = e.clientX;
  startMouseY = e.clientY;
  initialPosX = posX.value;
  initialPosY = posY.value;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const dx = e.clientX - startMouseX;
  const dy = e.clientY - startMouseY;
  posX.value = initialPosX + dx;
  posY.value = initialPosY + dy;
};

const stopDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);

  // --- МАГНИТНЫЕ КРАЯ (SNAPPING) ---
  const snapThreshold = 30;
  const rect = widgetRef.value.getBoundingClientRect();

  if (posX.value < snapThreshold) posX.value = margin;
  if (posX.value + rect.width > window.innerWidth - snapThreshold) {
    posX.value = window.innerWidth - rect.width - margin;
  }
  if (posY.value < snapThreshold) posY.value = margin;
  if (posY.value + rect.height > window.innerHeight - snapThreshold) {
    posY.value = window.innerHeight - rect.height - margin;
  }

  localStorage.setItem("calyx_weather_x", posX.value);
  localStorage.setItem("calyx_weather_y", posY.value);
};

// --- ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ С УМНЫМ ПОЗИЦИОНИРОВАНИЕМ ---
const cycleMode = async () => {
  const modes = ["full", "minimal", "micro"];
  const currentIndex = modes.indexOf(displayMode.value);
  displayMode.value = modes[(currentIndex + 1) % modes.length];
  localStorage.setItem("calyx_weather_mode", displayMode.value);

  // Ждем рендера нового размера
  await nextTick();

  if (!widgetRef.value) return;
  const rect = widgetRef.value.getBoundingClientRect();
  const winWidth = window.innerWidth;
  const winHeight = window.innerHeight;

  let newX = posX.value;
  let newY = posY.value;
  let positionChanged = false;

  // Проверка правой границы
  if (newX + rect.width + margin > winWidth) {
    newX = winWidth - rect.width - margin;
    if (newX < margin) newX = margin; // Не улетать за левый край
    positionChanged = true;
  }
  // Проверка нижней границы
  if (newY + rect.height + margin > winHeight) {
    newY = winHeight - rect.height - margin;
    if (newY < margin) newY = margin; // Не улетать за верхний край
    positionChanged = true;
  }

  if (positionChanged) {
    posX.value = newX;
    posY.value = newY;
    localStorage.setItem("calyx_weather_x", newX);
    localStorage.setItem("calyx_weather_y", newY);
  }
};

// --- ПОГОДНАЯ ЛОГИКА ---
const location = ref("ЗАВАНТАЖЕННЯ...");
const currentWeather = ref(null);
const forecastList = ref([]);
const loading = ref(true);
const selectedIndex = ref(0);
const isEditing = ref(false);
const searchQuery = ref("");
const locationInput = ref(null);

const getWeatherInfo = (code) => {
  const info = {
    0: { icon: "☀️", text: "Ясно" },
    1: { icon: "🌤️", text: "Переважно ясно" },
    2: { icon: "⛅", text: "Мінлива хмарність" },
    3: { icon: "☁️", text: "Похмуро" },
    45: { icon: "🌫️", text: "Туман" },
    48: { icon: "🌫️", text: "Туман із памороззю" },
    51: { icon: "🌧️", text: "Легка мряка" },
    53: { icon: "🌧️", text: "Помірна мряка" },
    55: { icon: "🌧️", text: "Густа мряка" },
    56: { icon: "🌧️", text: "Крижана мряка" },
    57: { icon: "🌧️", text: "Густа крижана мряка" },
    61: { icon: "🌧️", text: "Невеликий дощ" },
    63: { icon: "🌧️", text: "Помірний дощ" },
    65: { icon: "🌧️", text: "Сильний дощ" },
    66: { icon: "🌧️", text: "Крижаний дощ" },
    67: { icon: "🌧️", text: "Сильний крижаний дощ" },
    71: { icon: "❄️", text: "Невеликий сніг" },
    73: { icon: "❄️", text: "Помірний сніг" },
    75: { icon: "❄️", text: "Сильний сніг" },
    77: { icon: "❄️", text: "Снігові зерна" },
    80: { icon: "🌧️", text: "Слабка злива" },
    81: { icon: "🌧️", text: "Помірна злива" },
    82: { icon: "🌧️", text: "Сильна злива" },
    85: { icon: "❄️", text: "Слабкий снігопад" },
    86: { icon: "❄️", text: "Сильний снігопад" },
    95: { icon: "⛈️", text: "Гроза" },
    96: { icon: "⛈️", text: "Гроза з градом" },
    99: { icon: "⛈️", text: "Сильна гроза" },
  };
  return info[code] || { icon: "☁️", text: "Невідомо" };
};

const getFullDate = (dateStr) =>
  new Intl.DateTimeFormat("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date(dateStr))
    .toUpperCase();
const formatShortDay = (date) =>
  new Intl.DateTimeFormat("uk-UA", { weekday: "short" })
    .format(date)
    .toUpperCase();
const formatShortDate = (date) =>
  new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit" }).format(
    date
  );

const fetchWeather = async (lat, lon, placeName = null) => {
  loading.value = true;
  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,windspeed_10m_max,precipitation_probability_max&timezone=auto`
    );
    const data = await weatherRes.json();
    const currentInfo = getWeatherInfo(data.current.weather_code);

    currentWeather.value = {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      wind: Math.round(data.current.wind_speed_10m),
      icon: currentInfo.icon,
      description: currentInfo.text,
    };

    forecastList.value = data.daily.time.map((timeStr, index) => {
      const date = new Date(timeStr);
      const dailyInfo = getWeatherInfo(data.daily.weathercode[index]);
      return {
        fullDate: getFullDate(timeStr),
        dayName: index === 0 ? "СЬОГ." : formatShortDay(date),
        dateString: formatShortDate(date),
        maxTemp: Math.round(data.daily.temperature_2m_max[index]),
        minTemp: Math.round(data.daily.temperature_2m_min[index]),
        feelsLikeMax: Math.round(data.daily.apparent_temperature_max[index]),
        windMax: Math.round(data.daily.windspeed_10m_max[index]),
        precipProb: data.daily.precipitation_probability_max[index],
        icon: dailyInfo.icon,
        description: dailyInfo.text,
      };
    });
    selectedIndex.value = 0;

    if (placeName) {
      location.value = placeName.toUpperCase();
    } else {
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=uk`
      );
      const geoData = await geoRes.json();
      location.value = (
        geoData.city ||
        geoData.locality ||
        "НЕВІДОМО"
      ).toUpperCase();
    }
  } catch (error) {
    console.error("Помилка:", error);
    location.value = "ПОМИЛКА";
  } finally {
    loading.value = false;
  }
};

const activeWeather = computed(() => {
  if (!currentWeather.value || forecastList.value.length === 0) return null;
  if (selectedIndex.value === 0) {
    return {
      dateText: forecastList.value[0].fullDate,
      temp: currentWeather.value.temp,
      icon: currentWeather.value.icon,
      description: currentWeather.value.description,
      feelsLike: currentWeather.value.feelsLike,
      wind: currentWeather.value.wind,
      extraLabel: "Вологість",
      extraValue: currentWeather.value.humidity + "%",
    };
  } else {
    const day = forecastList.value[selectedIndex.value];
    return {
      dateText: day.fullDate,
      temp: day.maxTemp,
      icon: day.icon,
      description: day.description,
      feelsLike: day.feelsLikeMax,
      wind: day.windMax,
      extraLabel: "Опади",
      extraValue: day.precipProb + "%",
    };
  }
});

const selectDay = (index) => {
  selectedIndex.value = index;
};
const startEditing = async () => {
  searchQuery.value = location.value === "ПОМИЛКА" ? "" : location.value;
  isEditing.value = true;
  await nextTick();
  locationInput.value.focus();
};
const searchLocation = async () => {
  if (!searchQuery.value.trim()) {
    isEditing.value = false;
    return;
  }
  loading.value = true;
  isEditing.value = false;
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        searchQuery.value
      )}&count=1&language=uk&format=json`
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const { latitude, longitude, name } = data.results[0];
      localStorage.setItem("calyx_weather_lat", latitude);
      localStorage.setItem("calyx_weather_lon", longitude);
      localStorage.setItem("calyx_weather_name", name);
      await fetchWeather(latitude, longitude, name);
    } else {
      alert("Місто не знайдено.");
      loading.value = false;
    }
  } catch (e) {
    console.error("Помилка:", e);
    loading.value = false;
  }
};

onMounted(() => {
  // Проверка границ при загрузке
  if (posX.value > window.innerWidth - 100)
    posX.value = window.innerWidth - 380;
  if (posY.value > window.innerHeight - 100) posY.value = 24;

  const savedLat = localStorage.getItem("calyx_weather_lat");
  const savedLon = localStorage.getItem("calyx_weather_lon");
  const savedName = localStorage.getItem("calyx_weather_name");
  if (savedLat && savedLon) {
    fetchWeather(savedLat, savedLon, savedName);
    return;
  }
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        fetchWeather(position.coords.latitude, position.coords.longitude),
      () => fetchWeather(47.8388, 35.1396, "ЗАПОРІЖЖЯ")
    );
  } else {
    fetchWeather(47.8388, 35.1396, "ЗАПОРІЖЖЯ");
  }
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap");

/* --- БАЗОВЫЙ ВИДЖЕТ (DRAGGABLE) --- */
.weather-corner-widget {
  position: fixed;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  color: white;
  font-family: inherit;

  /* ИСПРАВЛЕНИЕ ЗДЕСЬ: Опускаем виджет на уровень рабочего стола */
  z-index: 20;

  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
    min-height 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.3s ease,
    background 0.2s ease, left 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
    top 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: grab;
  user-select: none;
}

.weather-corner-widget.is-dragging {
  cursor: grabbing !important;
  opacity: 0.95;
  transform: scale(1.01);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

/* Фонарик главного виджета */
.weather-corner-widget::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
  background: radial-gradient(
    150px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.12),
    transparent 100%
  );
  z-index: -1;
}
.weather-corner-widget:hover::after {
  opacity: 1;
}

/* --- РЕЖИМЫ ОТОБРАЖЕНИЯ (MODES) --- */
.mode-full {
  width: 380px;
  min-height: 250px;
  border-radius: 20px;
  padding: 24px;
}
.mode-minimal {
  width: 340px;
  min-height: auto;
  border-radius: 16px;
  padding: 20px;
}
.mode-micro {
  width: auto;
  min-width: 150px;
  min-height: auto;
  border-radius: 50px;
  padding: 10px 20px;
  cursor: pointer;
}

/* --- ЭЛЕМЕНТЫ УПРАВЛЕНИЯ --- */
.widget-controls {
  position: absolute;
  top: 8px;
  left: 12px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 50;
}
.weather-corner-widget:hover .widget-controls {
  opacity: 1;
}
.mode-micro .widget-controls {
  display: none;
}

.control-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: scale(1.1);
}

/* --- MICRO LAYOUT --- */
.micro-layout {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
.micro-icon {
  font-family: "Noto Color Emoji", sans-serif !important;
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  line-height: 1;
}
.micro-temp {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: flex-start;
}
.micro-deg {
  font-size: 12px;
  font-weight: normal;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.7);
}
.micro-desc {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 12px;
  text-transform: capitalize;
}

/* --- АНИМАЦИИ --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.slide-up-enter-to {
  max-height: 150px;
}

/* --- СТРУКТУРА РАЗДЕЛИТЕЛЯ (ТВОИ СТИЛИ СОХРАНЕНЫ) --- */
.split-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding-bottom: 15px;
}
.mode-full .split-layout {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

/* ВАЖНО: ТВОИ ФИКСИРОВАННЫЕ ПРОПОРЦИИ И ОТСТУПЫ */
.left-block {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-right: 10px;
}

.right-block {
  width: 60%;
  display: flex;
  justify-content: center;
  padding-left: 20px;
  flex-direction: column;
}

/* Остальные стили без изменений... */
.location-container {
  width: 100%;
  height: 26px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 4px;
}
.location-header {
  font-size: 13px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0);
  transition: all 0.2s ease;
}
.location-header:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}
.edit-icon {
  font-size: 12px;
  opacity: 0.8;
}
.location-text {
  font-weight: 600;
}
.location-input {
  width: 100%;
  text-align: right;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  letter-spacing: 1px;
  padding: 6px 12px;
  outline: none;
  font-family: inherit;
  transition: all 0.3s ease;
}
.location-input:focus {
  border-color: #1da2fc;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(29, 162, 252, 0.15);
}
.date-header {
  text-align: right;
  font-size: 11px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
  font-weight: 500;
}
.weather-desc {
  font-size: 13px;
  color: #fff;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-weather-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.big-icon,
.f-icon {
  font-family: "Noto Color Emoji", sans-serif !important;
}
.big-icon {
  font-size: 46px;
  line-height: 1;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
}
.big-temp {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-start;
}
.degree {
  font-size: 20px;
  font-weight: normal;
  margin-top: 6px;
  margin-left: 2px;
  color: rgba(255, 255, 255, 0.7);
}
.weather-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  letter-spacing: 1px;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 10px;
  border-radius: 6px;
}
.detail-label {
  color: rgba(255, 255, 255, 0.6);
}
.detail-value {
  color: #fff;
  font-weight: 600;
  text-align: right;
}
.forecast-horizontal {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
  margin-top: 10px;
}
.forecast-col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 4px;
  border-radius: 12px;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}
.forecast-col::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    50px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.25),
    transparent 100%
  );
  z-index: 1;
}
.forecast-col:hover::after {
  opacity: 1;
}
.f-date,
.f-day,
.f-icon,
.f-temp-max,
.f-temp-min {
  position: relative;
  z-index: 2;
}
.forecast-col:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}
.is-selected-col {
  background: rgba(29, 162, 252, 0.15) !important;
  border-color: #1da2fc !important;
  box-shadow: 0 8px 20px rgba(29, 162, 252, 0.25);
  transform: scale(1.05) translateY(-2px);
}
.is-selected-col .f-day,
.is-selected-col .f-date,
.is-selected-col .f-temp-min {
  color: white;
}
.f-date {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}
.f-day {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1px;
  margin-bottom: 6px;
  font-weight: 700;
}
.today-text {
  font-size: 11px;
}
.f-icon {
  font-size: 22px;
  margin-bottom: 8px;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
}
.f-temp-max {
  font-size: 15px;
  font-weight: bold;
  color: white;
  margin-bottom: 2px;
}
.f-temp-min {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}
.small-deg {
  margin-left: 2px;
  font-weight: normal;
}
.weather-loading,
.weather-error {
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 2px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
.mini-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #1da2fc;
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>