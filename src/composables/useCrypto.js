import { ref, onMounted, onUnmounted } from 'vue';
import { API_ENDPOINTS, DEFAULT_DATA } from '../config';

export function useCrypto() {
  const getImageUrl = (path) => {
    return new URL(`../assets/img/svg/white/${path}`, import.meta.url).href;
  };

  const coins = ref(
    DEFAULT_DATA.CRYPTO_COINS.map((coin) => ({
      ...coin,
      price: '...',
      icon: getImageUrl(`${coin.symbol.toLowerCase()}.svg`),
    })),
  );

  let intervalId;

  const fetchPrices = async () => {
    const ids = coins.value.map((c) => c.id).join(',');
    const url = `${API_ENDPOINTS.COINGECKO}?ids=${ids}&vs_currencies=usd`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('CoinGecko Rate Limit reached.');
          coins.value.forEach((c) => (c.price = 'Limit'));
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      coins.value.forEach((coin) => {
        if (data[coin.id] && data[coin.id].usd) {
          coin.price = `$${data[coin.id].usd.toLocaleString()}`;
        }
      });
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      coins.value.forEach((c) => (c.price = 'Error'));
    }
  };

  onMounted(() => {
    fetchPrices();
    intervalId = setInterval(fetchPrices, 60000);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    coins,
  };
}
