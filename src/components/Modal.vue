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
      @mousemove="handleMouseMove"
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
import { useSpotlight } from "@/composables/useSpotlight";

const props = defineProps({
  peek: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close", "peek:start", "peek:stop"]);

// ИСПОЛЬЗУЕМ ОБЩИЙ КОМПОЗАБЛ
const { handleMouseMove } = useSpotlight();
</script>

<style scoped>
/* --- ФОН (Оверлей) --- */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* Мягкое затемнение и глубокое размытие */
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  animation: fadeIn 0.3s ease;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Состояние "Подглядывания" */
.modal-backdrop.is-peeking {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* --- САМА МОДАЛКА (Стекло) --- */
.modal-content {
  position: relative;
  /* Glassmorphism */
  background: rgba(30, 30, 30, 0.65);
  backdrop-filter: blur(25px) saturate(200%);
  -webkit-backdrop-filter: blur(25px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);

  padding: 30px;
  border-radius: 24px;
  min-width: 320px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: white;

  animation: modalZoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: auto;
  overflow: hidden; /* Важно для обрезки фонарика по краям */
}

/* Эффект Фонарика (Spotlight) - УМЕНЬШЕНО до 150px */
.modal-content::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
  background: radial-gradient(
    150px circle at var(--x, 50%) var(--y, 50%),
    rgba(255, 255, 255, 0.08),
    transparent 100%
  );
  z-index: -1;
}
.modal-content:hover::after {
  opacity: 1;
}

/* Анимация при Peek */
.modal-backdrop.is-peeking .modal-content {
  opacity: 0.15;
  transform: translateY(15px) scale(0.96);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* --- ВНУТРЕННИЕ ЭЛЕМЕНТЫ --- */
header {
  font-size: 1.25rem;
  font-weight: 600;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
  color: #fff;
}

main {
  flex: 1;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 4px;
}

/* --- АНИМАЦИИ --- */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalZoomIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>