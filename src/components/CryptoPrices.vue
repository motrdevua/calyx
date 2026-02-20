<template>
  <div class="prices">
    <div class="prices__block">
      <div
        v-for="coin in coins"
        :key="coin.id"
        class="prices__item animate-border"
        :data-coin="coin.id"
        @click="copyPrice(coin)"
        @mouseenter="showTooltip(coin.id)"
        @mouseleave="hideTooltip(coin.id)"
      >
        <div class="img-wrap">
          <img :src="coin.icon" alt="coin icon" />
        </div>
        <div class="separator"></div>
        <div class="coin-info">
          <h4 class="coin-info__symbol">{{ coin.symbol }}</h4>
          <div class="separator small"></div>
          <span class="coin-info__price">{{ coin.price }}</span>
        </div>

        <!-- Custom Tooltip -->
        <Transition name="fade">
          <div v-if="tooltipItem === coin.id" class="crypto-tooltip">
            {{ tooltipText }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useCrypto } from "@/composables/useCrypto";

const { coins } = useCrypto();
const tooltipItem = ref(null);
const tooltipText = ref("Copy");

const showTooltip = (id) => {
  tooltipItem.value = id;
  tooltipText.value = "Copy";
};

const hideTooltip = (id) => {
  if (tooltipItem.value === id) {
    tooltipItem.value = null;
  }
};

const copyPrice = async (coin) => {
  try {
    // Strip symbols for a cleaner copy if desired, or keep as is.
    // Let's keep as is but remove the $ for raw number if preferred.
    // User asked to copy "kurs", usually as displayed.
    await navigator.clipboard.writeText(coin.price);
    tooltipText.value = "Copied!";
    setTimeout(() => {
      if (tooltipItem.value === coin.id) {
        tooltipText.value = "Copy";
      }
    }, 2000);
  } catch (err) {
    console.error("Failed to copy!", err);
  }
};
</script>

<style scoped>
.prices {
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  z-index: 10;
}

.prices__block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prices__item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s linear;
  min-width: 180px;
  overflow: visible; /* Changed from hidden to show tooltip */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  cursor: copy; /* Visual hint for copying */
}

.prices__item:hover {
  background: rgba(0, 0, 0, 0.82);
  box-shadow: 0 0 20px 5px rgba(29, 162, 252, 0.25),
    0 4px 15px rgba(0, 0, 0, 0.5);
}

.separator {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 10px;
}

.separator.small {
  height: 12px;
  margin: 0 8px;
}

.img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 8px rgba(29, 162, 252, 0.8));
}

.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.coin-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
}

.coin-info__symbol {
  font-family: "Orbitron", sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #1da2fc;
  margin: 0;
  text-shadow: 0 0 8px rgba(29, 162, 252, 0.8);
}

.coin-info__price {
  font-family: "Orbitron", sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #ff006a;
  white-space: nowrap;
  text-shadow: 0 0 5px rgba(255, 0, 106, 0.4);
  min-width: 75px;
}

/* Tooltip Styling */
.crypto-tooltip {
  position: absolute;
  left: -90px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 4px;
  font-family: "Orbitron", sans-serif;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid rgba(29, 162, 252, 0.5);
  box-shadow: 0 0 15px rgba(29, 162, 252, 0.3);
  pointer-events: none;
  white-space: nowrap;
  z-index: 100;
}

.crypto-tooltip::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  border-width: 5px 0 5px 5px;
  border-style: solid;
  border-color: transparent transparent transparent rgba(29, 162, 252, 0.5);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(10px);
}
</style>
