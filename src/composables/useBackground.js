import { ref, onMounted, watch } from 'vue';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../config';

const STORAGE_KEY = STORAGE_KEYS.BACKGROUND;
const COLLECTION_KEY = STORAGE_KEYS.COLLECTION;

// Default background is null (falls back to CSS default)
const currentBackground = ref(null);
const backgroundType = ref('default'); // 'default', 'image', 'gradient'
const collection = ref([]);

export function useBackground() {
  const loadBackground = async () => {
    try {
      const stored = await storage.get(STORAGE_KEY);
      if (stored) {
        currentBackground.value = stored.value;
        backgroundType.value = stored.type;
      }
    } catch (e) {
      console.error('Failed to load background:', e);
    }
  };

  const saveBackground = async () => {
    if (currentBackground.value) {
      await storage.set(STORAGE_KEY, {
        type: backgroundType.value,
        value: currentBackground.value,
      });
    } else {
      await storage.remove(STORAGE_KEY);
    }
  };

  const setBackground = async (type, value) => {
    currentBackground.value = value;
    backgroundType.value = type;
    await saveBackground();
  };

  const previewBackground = (type, value) => {
    currentBackground.value = value;
    backgroundType.value = type;
  };

  const cancelPreview = async () => {
    await loadBackground();
  };

  const generateGradient = () => {
    const hex = () => '#' + Math.floor(Math.random() * 16777215).toString(16);
    const deg = Math.floor(Math.random() * 360);
    const grad = `linear-gradient(${deg}deg, ${hex()}, ${hex()})`;
    previewBackground('gradient', grad);
  };

  onMounted(loadBackground);

  return {
    currentBackground,
    backgroundType,
    setBackground,
    previewBackground,
    saveBackground,
    cancelPreview,
    generateGradient,
  };
}
