<template>
  <div class="tab-panel">
    <div class="colors-container">
      <button class="btn btn-primary animate-border" @click="generateGradient">
        Generate Random Gradient
      </button>
      <p class="hint">Click to preview dynamic color combinations</p>
    </div>
  </div>
</template>

<script setup>
import { useBackground } from "../../composables/useBackground";

const { generateGradient } = useBackground();
</script>

<style scoped>
.colors-container {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
}
.hint {
  color: #888;
  font-size: 0.9em;
}
</style>
