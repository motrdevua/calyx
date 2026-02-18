<template>
  <div
    class="modal-backdrop"
    :class="{ 'is-peeking': peek }"
    @click.self="$emit('close')"
  >
    <div
      class="modal-content"
      @mouseenter="$emit('peek:stop')"
      @mouseleave="$emit('peek:start')"
    >
      <header v-if="$slots.header">
        <slot name="header"></slot>
      </header>

      <main>
        <slot name="body"></slot>
      </main>

      <footer v-if="$slots.footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  peek: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close", "peek:start", "peek:stop"]);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-backdrop.is-peeking {
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(0px);
}

.modal-content {
  background: rgba(18, 18, 18, 0.85);
  border: 1.5px solid rgba(29, 162, 252, 0.15);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5), 0 0 20px rgba(29, 162, 252, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  padding: 24px;
  border-radius: 12px;
  min-width: 320px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: white;
  animation: slideUp 0.3s ease;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto; /* Ensure events always fire */
}

.modal-backdrop.is-peeking .modal-content {
  opacity: 0.1;
  transform: translateY(10px) scale(0.98);
}

header {
  font-size: 1.25rem;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
