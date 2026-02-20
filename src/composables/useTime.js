import { ref, onMounted, onUnmounted } from 'vue';
import { UI_CONSTANTS } from '@/config';

export function useTime() {
  const time = ref({ hours: '00', minutes: '00', seconds: '00' });
  const currentDay = ref('');
  let intervalId;

  const updateTime = () => {
    const date = new Date();

    // Day Logic
    const weekDays = UI_CONSTANTS.WEEK_DAYS;
    currentDay.value = weekDays[date.getDay()];

    // Time Logic
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    time.value = { hours: h, minutes: m, seconds: s };
  };

  onMounted(() => {
    updateTime();
    intervalId = setInterval(updateTime, 1000);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    time,
    currentDay,
  };
}
