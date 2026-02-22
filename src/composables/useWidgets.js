import { ref, watch } from 'vue';

const showWeather = ref(localStorage.getItem('calyx_show_weather') !== 'false');
const showLinks = ref(localStorage.getItem('calyx_show_links') !== 'false');
const showClock = ref(localStorage.getItem('calyx_show_clock') !== 'false');
const showNotes = ref(localStorage.getItem('calyx_show_notes') !== 'false');
// НОВОЕ: Переключатель секунд (по умолчанию включены)
const showSeconds = ref(localStorage.getItem('calyx_show_seconds') !== 'false');

watch(showWeather, (val) => localStorage.setItem('calyx_show_weather', val));
watch(showLinks, (val) => localStorage.setItem('calyx_show_links', val));
watch(showClock, (val) => localStorage.setItem('calyx_show_clock', val));
watch(showNotes, (val) => localStorage.setItem('calyx_show_notes', val));
// НОВОЕ: Сохраняем состояние секунд
watch(showSeconds, (val) => localStorage.setItem('calyx_show_seconds', val));

export function useWidgets() {
  return {
    showWeather,
    showLinks,
    showClock,
    showNotes,
    showSeconds, // НОВОЕ
  };
}
