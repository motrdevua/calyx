import { ref, computed, onMounted } from 'vue';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS, DEFAULT_DATA } from '@/config';

const STORAGE_KEY = STORAGE_KEYS.LINKS;
const SETTINGS_KEY = 'calyx_grid_settings'; // Ключ для настроек сетки

// Генератор уникальных ID (используем встроенный crypto API или fallback)
const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id_' +
        Math.random().toString(36).substring(2, 9) +
        Date.now().toString(36);
};

// Миграция старых плоских ссылок в новый формат с ID и типами
const migrateOldLinks = (linksArray) => {
  return linksArray.map((item) => {
    if (!item.id) {
      return {
        id: generateId(),
        type: 'link', // Может быть 'link' или 'folder'
        name: item.name,
        url: item.url,
      };
    }
    return item;
  });
};

const defaultLinks = migrateOldLinks(DEFAULT_DATA.QUICK_LINKS || []);

// Singleton state
const links = ref([]);
const gridSettings = ref({ cols: 5, rows: 2 }); // Настройки сетки (по умолчанию 10 элементов на страницу)
const isLoading = ref(true);
let isLoaded = false;
let loadPromise = null;

export function useLinks() {
  // --- ЗАГРУЗКА ---
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
        // Загружаем ссылки
        const stored = await storage.get(STORAGE_KEY);
        if (Array.isArray(stored)) {
          links.value = migrateOldLinks(JSON.parse(JSON.stringify(stored)));
          console.log(
            '[Links] Loaded successfully, count:',
            links.value.length,
          );
        } else {
          console.log('[Links] No stored links found, using defaults.');
          links.value = [...defaultLinks];
        }

        // Загружаем настройки сетки
        const storedSettings = await storage.get(SETTINGS_KEY);
        if (storedSettings) {
          gridSettings.value = { ...gridSettings.value, ...storedSettings };
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

  // --- СОХРАНЕНИЕ ---
  const saveLinks = async () => {
    try {
      const plainData = JSON.parse(JSON.stringify(links.value));
      await storage.set(STORAGE_KEY, plainData);
      console.log('[Links] Save successful.');
    } catch (e) {
      console.error('[Links] Save failed:', e);
    }
  };

  const saveSettings = async () => {
    try {
      await storage.set(
        SETTINGS_KEY,
        JSON.parse(JSON.stringify(gridSettings.value)),
      );
    } catch (e) {
      console.error('[Settings] Save failed:', e);
    }
  };

  // --- ПОИСК И МОДИФИКАЦИЯ (Рекурсия для папок) ---

  // Рекурсивный поиск элемента по ID (может быть в корне или внутри папки)
  const findItemInfo = (
    id,
    currentList = links.value,
    parentList = null,
    indexInParent = -1,
  ) => {
    for (let i = 0; i < currentList.length; i++) {
      const item = currentList[i];
      if (item.id === id) {
        return { item, parentList: currentList, index: i };
      }
      if (item.type === 'folder' && item.children) {
        const found = findItemInfo(id, item.children, currentList, i);
        if (found) return found;
      }
    }
    return null;
  };

  // --- ДЕЙСТВИЯ ---

  const addLink = async (name, url, targetFolderId = null) => {
    await loadLinks();
    const newLink = { id: generateId(), type: 'link', name, url };

    if (targetFolderId) {
      const info = findItemInfo(targetFolderId);
      if (info && info.item.type === 'folder') {
        if (!info.item.children) info.item.children = [];
        info.item.children.push(newLink);
      }
    } else {
      links.value.push(newLink);
    }

    console.log('[Links] Added link:', name);
    await saveLinks();
  };

  const createFolder = async (name, initialItems = []) => {
    await loadLinks();
    const newFolder = {
      id: generateId(),
      type: 'folder',
      name,
      children: initialItems,
    };
    links.value.push(newFolder);
    console.log('[Links] Created folder:', name);
    await saveLinks();
  };

  const removeItem = async (id) => {
    await loadLinks();
    const info = findItemInfo(id);
    if (info) {
      console.log('[Links] Removing item:', info.item.name);
      info.parentList.splice(info.index, 1);
      await saveLinks();
    }
  };

  const editItem = async (id, updates) => {
    await loadLinks();
    const info = findItemInfo(id);
    if (info) {
      console.log('[Links] Editing item:', info.item.name);
      Object.assign(info.item, updates);
      await saveLinks();
    }
  };

  const updateGridSettings = async (cols, rows) => {
    gridSettings.value = { cols, rows };
    await saveSettings();
  };

  // Вспомогательный computed для UI: вычисляет количество элементов на одной странице
  const itemsPerPage = computed(() => {
    return gridSettings.value.cols * gridSettings.value.rows;
  });

  // Вспомогательный computed: разбивает плоский массив верхнего уровня на страницы
  const paginatedLinks = computed(() => {
    const pages = [];
    // Отнимаем 1 место для кнопки "+", которая всегда будет в конце
    const limit = itemsPerPage.value - 1;

    for (let i = 0; i < links.value.length; i += limit) {
      pages.push(links.value.slice(i, i + limit));
    }

    // Если страниц нет вообще, создаем хотя бы одну пустую
    if (pages.length === 0) pages.push([]);

    return pages;
  });

  onMounted(() => {
    loadLinks();
  });

  return {
    links,
    gridSettings,
    paginatedLinks,
    itemsPerPage,
    isLoading,
    addLink,
    createFolder,
    removeItem,
    editItem,
    updateGridSettings,
    loadLinks,
    saveLinks, // <--- ДОБАВИТЬ ЭТУ СТРОЧКУ
  };
}
