<template>
  <div>
    <Loader :manual="true" :loading="!isLoaded" />
    <BackgroundSettings ref="settingsRef" />

    <div
      class="wrapper"
      v-show="isLoaded"
      :class="{ visible: isLoaded }"
      :style="bgStyle"
      @contextmenu.prevent="handleContextMenu"
    >
      <Clock />
      <QuickLinks />
      <!-- <CryptoPrices /> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Loader from "@/components/Loader.vue";
import Clock from "@/components/Clock.vue";
import QuickLinks from "@/components/QuickLinks.vue";
// import CryptoPrices from "./components/CryptoPrices.vue";
import BackgroundSettings from "@/components/BackgroundSettings.vue";
import { useBackground } from "@/composables/useBackground";
// Import main background to get path
import defaultBg from "@/assets/img/bg.jpg";

const isLoaded = ref(false);
const settingsRef = ref(null);
const { currentBackground } = useBackground();

const handleContextMenu = () => {
  if (settingsRef.value) {
    settingsRef.value.toggleModal();
  }
};

// Computed background style to verify validity and fallbacks
const bgStyle = computed(() => {
  const common = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed", // Optional: parallax-like feel, ensures coverage
  };

  // 1. Priority: User selected background
  if (currentBackground.value && currentBackground.value !== "undefined") {
    // If it's a gradient, size/position might not matter as much, but 'cover' is fine
    return {
      ...common,
      backgroundImage: currentBackground.value, // Changed from background to backgroundImage to prevent shorthand reset
    };
  }
  // 2. Fallback: Default Image
  if (defaultBg) {
    return {
      ...common,
      backgroundImage: `url(${defaultBg})`,
    };
  }
  // 3. Last Resort: Black
  return { background: "#000" };
});

onMounted(async () => {
  const minLoadTime = new Promise((resolve) => setTimeout(resolve, 1000));

  const imgLoad = new Promise((resolve) => {
    // Determine what URL we are trying to load
    let urlToLoad = defaultBg;

    // Check if currentBackground is a URL
    if (currentBackground.value && currentBackground.value.includes("url(")) {
      const match = currentBackground.value.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        urlToLoad = match[1];
      }
    } else if (currentBackground.value) {
      // It's a gradient or invalid
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
    img.onerror = resolve; // Fail safe
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
