import { ref, shallowRef } from 'vue';
import { API_ENDPOINTS, DEFAULT_DATA } from '../config';

const TOPICS = DEFAULT_DATA.WALLPAPER_TOPICS;

export function useWallhaven() {
  const images = shallowRef([]);
  const isLoading = ref(false);
  const error = ref(null);
  const page = ref(1);
  const searchQuery = ref('');
  const seed = ref(Math.random().toString(36).substring(7));

  const pickRandomTopic = () => {
    const random = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    searchQuery.value = random;
    seed.value = Math.random().toString(36).substring(7);
  };

  const fetchImages = async (isNewSearch = true) => {
    if (isNewSearch) {
      page.value = 1;
      images.value = [];
      seed.value = Math.random().toString(36).substring(7);
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Wallhaven API v1
      const q = searchQuery.value.trim();
      const sorting = isNewSearch ? 'random' : 'relevance';

      // categories: 111 (general/anime/people)
      // purity: 100 (sfw)
      let url = `${API_ENDPOINTS.WALLHAVEN}?categories=111&purity=100&page=${page.value}`;

      if (q) {
        url += `&q=${encodeURIComponent(q)}`;
      }

      if (sorting === 'random') {
        url += `&sorting=random&seed=${seed.value}`;
      } else if (!q) {
        // Fallback for empty search
        url += `&sorting=toplist`;
      } else {
        url += `&sorting=relevance`;
      }

      console.log('Fetching Wallhaven via Proxy:', url);

      // Safety check: if 'chrome' is not defined, we are likely running in a regular browser tab
      // instead of as an installed extension.
      const isExtension =
        typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.sendMessage;

      let result;
      if (isExtension) {
        // Using chrome.runtime.sendMessage to bypass CORS via background script
        result = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'FETCH_DATA', url },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
              }
              if (response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response.error || 'Unknown proxy error'));
              }
            },
          );
        });
      } else {
        console.warn(
          'Chrome Extension API not found. Falling back to direct fetch (may fail due to CORS).',
        );
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        result = await response.json();
      }

      console.log('Wallhaven Response:', result);

      if (!result.data || !Array.isArray(result.data)) {
        console.warn('Wallhaven result has no data array:', result);
        images.value = isNewSearch ? [] : images.value;
        return;
      }

      const newImages = result.data.map((item) => ({
        id: item.id,
        raw_id: item.id,
        thumb:
          item.thumbs?.large || item.thumbs?.small || item.thumbs?.original,
        full: item.path,
        user: item.uploader?.username || `ID: ${item.id}`,
        resolution: item.resolution,
        category: item.category,
      }));

      if (isNewSearch) {
        images.value = newImages;
      } else {
        images.value = [...images.value, ...newImages];
      }
    } catch (err) {
      console.error('Wallhaven Fetch Failure:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchNextPage = () => {
    page.value++;
    fetchImages(false);
  };

  return {
    images,
    isLoading,
    error,
    searchQuery,
    pickRandomTopic,
    fetchImages,
    fetchNextPage,
  };
}
