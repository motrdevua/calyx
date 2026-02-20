import { ref, onMounted } from 'vue';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS, DEFAULT_DATA } from '@/config';

const STORAGE_KEY = STORAGE_KEYS.LINKS;
const defaultLinks = DEFAULT_DATA.QUICK_LINKS;

// Singleton state shared across all component instances
const links = ref([]);
const isLoading = ref(true);
let isLoaded = false;
let loadPromise = null;

export function useLinks() {
  /**
   * Safe loader that prevents race conditions and redundant loads.
   */
  const loadLinks = async () => {
    if (isLoaded) {
      isLoading.value = false;
      return links.value;
    }

    if (loadPromise) return loadPromise;

    console.log('[Links] Loading sequence initiated...');
    isLoading.value = true;

    loadPromise = (async () => {
      try {
        const stored = await storage.get(STORAGE_KEY);

        if (Array.isArray(stored)) {
          // Deep clone to ensure we have a clean array without reactive proxies
          links.value = JSON.parse(JSON.stringify(stored));
          console.log(
            '[Links] Loaded successfully from storage, count:',
            links.value.length,
          );
        } else {
          console.log(
            '[Links] No stored links found (or invalid data), using defaults:',
            defaultLinks.length,
          );
          links.value = [...defaultLinks];
        }

        isLoaded = true;
        return links.value;
      } catch (e) {
        console.error('[Links] Load failed unexpectedly:', e);
        links.value = [...defaultLinks];
        return links.value;
      } finally {
        loadPromise = null;
        isLoading.value = false;
        console.log('[Links] Loading sequence finished.');
      }
    })();

    return loadPromise;
  };

  /**
   * Persists current links to storage.
   */
  const saveLinks = async () => {
    try {
      // Create a clean, reactive-free copy of the data
      const plainData = JSON.parse(JSON.stringify(links.value));
      console.log('[Links] Saving to storage...', plainData.length, 'items');
      await storage.set(STORAGE_KEY, plainData);
      console.log('[Links] Save successful.');
    } catch (e) {
      console.error('[Links] Save failed:', e);
    }
  };

  const addLink = async (name, url) => {
    await loadLinks();
    links.value.push({ name, url });
    console.log('[Links] Adding link:', name);
    await saveLinks();
  };

  const removeLink = async (index) => {
    await loadLinks();
    const removed = links.value.splice(index, 1);
    console.log('[Links] Removing link at index', index, ':', removed[0]?.name);
    await saveLinks();
  };

  const editLink = async (index, name, url) => {
    await loadLinks();
    if (index >= 0 && index < links.value.length) {
      console.log('[Links] Editing link at index', index, ':', name);
      links.value[index] = { name, url };
      await saveLinks();
    }
  };

  const reorderLinks = async (oldIndex, newIndex) => {
    await loadLinks();
    console.log('[Links] Reordering:', oldIndex, '->', newIndex);
    const movedLink = links.value.splice(oldIndex, 1)[0];
    links.value.splice(newIndex, 0, movedLink);
    await saveLinks();
  };

  const updateLinks = async (newLinks) => {
    console.log('[Links] Bulk update, count:', newLinks.length);
    links.value = [...newLinks];
    await saveLinks();
  };

  // Initial load when used in a component
  onMounted(() => {
    loadLinks();
  });

  return {
    links,
    isLoading,
    addLink,
    editLink,
    removeLink,
    reorderLinks,
    updateLinks,
    loadLinks,
  };
}
