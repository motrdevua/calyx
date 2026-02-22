<template>
  <div>
    <Loader :manual="true" :loading="!isLoaded" />
    <BackgroundSettings ref="settingsRef" />

    <ControlCenter />

    <WeatherWidget v-if="showWeather" />

    <NotesWidget v-if="showNotes" />

    <div
      class="wrapper"
      v-show="isLoaded"
      :class="{ visible: isLoaded }"
      :style="bgStyle"
      @contextmenu.prevent="handleContextMenu"
    >
      <Clock v-if="showClock" />

      <QuickLinks v-if="showLinks" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Loader from "@/components/Loader.vue";
import Clock from "@/components/Clock.vue";
import QuickLinks from "@/components/QuickLinks.vue";
import WeatherWidget from "@/components/WeatherWidget.vue";
import BackgroundSettings from "@/components/BackgroundSettings.vue";
import NotesWidget from "@/components/NotesWidget.vue";
// import CryptoPrices from "./components/CryptoPrices.vue";

// НОВОЕ: Импортируем компонент ControlCenter и логику настроек
import ControlCenter from "@/components/ControlCenter.vue";
import { useWidgets } from "@/composables/useWidgets";

import { useBackground } from "@/composables/useBackground";
import defaultBg from "@/assets/img/bg.jpg";

const isLoaded = ref(false);
const settingsRef = ref(null);
const { currentBackground } = useBackground();

// НОВОЕ: Достаем реактивные переменные для показа/скрытия виджетов
const { showClock, showWeather, showLinks, showNotes, showSeconds } =
  useWidgets();

const handleContextMenu = () => {
  if (settingsRef.value) {
    settingsRef.value.toggleModal();
  }
};

const bgStyle = computed(() => {
  const common = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  if (currentBackground.value && currentBackground.value !== "undefined") {
    return {
      ...common,
      backgroundImage: currentBackground.value,
    };
  }
  if (defaultBg) {
    return {
      ...common,
      backgroundImage: `url(${defaultBg})`,
    };
  }
  return { background: "#000" };
});

onMounted(async () => {
  const minLoadTime = new Promise((resolve) => setTimeout(resolve, 1000));

  const imgLoad = new Promise((resolve) => {
    let urlToLoad = defaultBg;

    if (currentBackground.value && currentBackground.value.includes("url(")) {
      const match = currentBackground.value.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        urlToLoad = match[1];
      }
    } else if (currentBackground.value) {
      resolve();
      return;
    }

    if (!urlToLoad) {
      resolve();
      return;
    }

    const img = new Image();
    img.src = urlToLoad;
    img.onload = resolve;
    img.onerror = resolve;
  });

  await Promise.all([minLoadTime, imgLoad]);
  isLoaded.value = true;
});
</script>

<style scoped>
.wrapper {
  display: flex;
  overflow: hidden;
  align-items: center;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 100vh;
  opacity: 0;
  transition: opacity 0.5s ease-in;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.wrapper.visible {
  opacity: 1;
}
</style>