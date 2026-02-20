// src/utils/faviconController.js

// --- НАСТРОЙКИ ---
const CANVAS_SIZE = 32; // Размер канваса (стандарт для favicon)
const ICON_SRC = '/favicon.svg'; // Путь к твоей статической иконке в папке public

// --- ПЕРЕМЕННЫЕ СОСТОЯНИЯ ---
let canvas = null;
let ctx = null;
let link = null;
let animationId = null;
let faviconImage = null;
let angle = 0;

// Инициализация (создаем элементы один раз)
function init() {
  if (canvas) return;

  // 1. Ищем или создаем <link rel="icon">
  link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  document.getElementsByTagName('head')[0].appendChild(link);

  // 2. Создаем невидимый канвас
  canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  ctx = canvas.getContext('2d', { willReadFrequently: true }); // Оптимизация для плавной отрисовки

  // 3. Предзагружаем картинку фавиконки
  faviconImage = new Image();
  faviconImage.src = ICON_SRC;
}

// Функция отрисовки одного кадра (Анимация "Турбина")
function drawFrame() {
  // Ждем, пока картинка физически загрузится в память
  if (
    !ctx ||
    !faviconImage ||
    !faviconImage.complete ||
    faviconImage.naturalHeight === 0
  ) {
    animationId = requestAnimationFrame(drawFrame);
    return;
  }

  // Очищаем канвас перед новым кадром
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;

  // Сохраняем состояние канваса
  ctx.save();

  // Сдвигаем центр вращения в середину иконки
  ctx.translate(cx, cy);
  ctx.rotate(angle); // Поворачиваем на текущий угол
  ctx.translate(-cx, -cy); // Возвращаем координаты обратно

  // Рисуем иконку (она нарисуется уже повернутой)
  ctx.drawImage(faviconImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Восстанавливаем состояние (чтобы смещение не накапливалось)
  ctx.restore();

  // Применяем отрисованный кадр к вкладке браузера
  link.href = canvas.toDataURL('image/png');

  // Увеличиваем угол для следующего кадра (скорость вращения)
  angle += 0.9;

  // Запрашиваем следующий кадр анимации
  animationId = requestAnimationFrame(drawFrame);
}

/**
 * ЗАПУСК АНИМАЦИИ (Вызывается при монтировании Loader.vue)
 */
export function startFaviconLoading() {
  init();

  // Если анимация уже идет - не дублируем
  if (animationId) return;

  drawFrame();
}

/**
 * ОСТАНОВКА АНИМАЦИИ (Вызывается при скрытии Loader.vue)
 */
export function stopFaviconLoading() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  // Возвращаем оригинальную статичную иконку без вращения
  if (link) {
    link.href = ICON_SRC;
  }
}
