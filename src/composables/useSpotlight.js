// Этот композабл можно использовать в любом компоненте,
// где нужен эффект фонарика (Spotlight) при движении мыши.
export function useSpotlight() {
  const handleMouseMove = (e) => {
    // Получаем координаты элемента относительно окна
    const rect = e.currentTarget.getBoundingClientRect();
    // Вычисляем положение курсора внутри элемента
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Передаем координаты в CSS-переменные
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return {
    handleMouseMove,
  };
}
