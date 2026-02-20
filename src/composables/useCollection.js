import { ref, onMounted } from 'vue';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/config';

const COLLECTION_KEY = STORAGE_KEYS.COLLECTION;

// Global state shared across all components
const collection = ref([]);
let loadPromise = null;
let isLoaded = false;

export function useCollection() {
  /**
   * Safe loader that prevents race conditions by returning a shared promise.
   */
  const loadCollection = async () => {
    if (isLoaded) return collection.value;
    if (loadPromise) return loadPromise;

    console.log('[Collection] Loading from storage...');
    loadPromise = (async () => {
      try {
        const stored = await storage.get(COLLECTION_KEY);

        // Safety check: ensure stored data is an array
        if (Array.isArray(stored)) {
          collection.value = stored;
        } else {
          console.warn(
            '[Collection] Data in storage is not an array, resetting to empty:',
            stored,
          );
          collection.value = [];
          // Repair immediately if data was corrupted
          if (stored !== undefined && stored !== null) {
            await storage.set(COLLECTION_KEY, []);
          }
        }

        isLoaded = true;
        console.log(
          '[Collection] Loaded successfully, count:',
          collection.value.length,
        );
        return collection.value;
      } catch (e) {
        console.error('[Collection] Failed to load:', e);
        return [];
      } finally {
        loadPromise = null;
      }
    })();

    return loadPromise;
  };

  /**
   * Persists current state to storage.
   */
  const saveCollection = async () => {
    try {
      const plainData = JSON.parse(JSON.stringify(collection.value));
      console.log(
        '[Collection] Saving to storage...',
        plainData.length,
        'items',
      );
      await storage.set(COLLECTION_KEY, plainData);
    } catch (e) {
      console.error('[Collection] Failed to save:', e);
    }
  };

  /**
   * Adds an item if it doesn't already exist based on multiple ID checks.
   */
  const addToCollection = async (item) => {
    await loadCollection();

    const targetId = item.id || item.raw_id;
    if (!targetId) {
      console.warn('[Collection] Cannot add item without ID:', item);
      return;
    }

    const existing = collection.value.find(
      (i) => i.raw_id === targetId || i.id === targetId,
    );

    if (!existing) {
      console.log('[Collection] Adding new item:', targetId);
      collection.value.unshift(item);
      await saveCollection();
    } else {
      console.log('[Collection] Item already exists:', targetId);
    }
  };

  /**
   * Removes an item and ensures state stays in sync.
   */
  const removeFromCollection = async (id) => {
    await loadCollection();

    console.log('[Collection] Removing item:', id);
    const initialCount = collection.value.length;

    collection.value = collection.value.filter(
      (i) => i.raw_id !== id && i.id !== id,
    );

    if (collection.value.length !== initialCount) {
      await saveCollection();
      console.log(
        '[Collection] Item removed. New count:',
        collection.value.length,
      );
    } else {
      console.warn('[Collection] Item not found for deletion:', id);
    }
  };

  // Auto-load when composable is initialized
  onMounted(loadCollection);

  return {
    collection,
    addToCollection,
    removeFromCollection,
    loadCollection,
  };
}
