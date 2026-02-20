/**
 * Global Configuration for the Chrome Extension
 */

export const STORAGE_KEYS = {
  LINKS: 'calyx-quick-links',
  BACKGROUND: 'calyx-background',
  COLLECTION: 'calyx-collection',
};

export const API_ENDPOINTS = {
  WALLHAVEN: 'https://wallhaven.cc/api/v1/search',
  COINGECKO: 'https://api.coingecko.com/api/v3/simple/price',
  FAVICON: 'https://www.google.com/s2/favicons',
};

export const DEFAULT_DATA = {
  QUICK_LINKS: [
    { name: 'Google', url: 'https://www.google.com/' },
    { name: 'YouTube', url: 'https://www.youtube.com/' },
    { name: 'Filmix', url: 'https://filmix.my/' },
    { name: 'Rozetka', url: 'https://rozetka.com.ua/' },
    { name: 'OLX', url: 'https://www.olx.ua/uk/' },
  ],
  COMMON_SITES: [
    'google.com',
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'linkedin.com',
    'github.com',
    'reddit.com',
    'amazon.com',
    'netflix.com',
    'wikipedia.org',
    'discord.com',
    'twitch.tv',
    'openai.com',
    'gemini.google.com',
  ],
  WALLPAPER_TOPICS: [
    'Cyberpunk',
    'Space',
    'Tokyo Night',
    'Landscape',
    'Architecture',
    'Abstract',
    'Minimalism',
    'Nature',
    'Futuristic',
    'Art Station',
  ],
  CRYPTO_COINS: [
    { id: 'bitcoin', symbol: 'BTC' },
    { id: 'litecoin', symbol: 'LTC' },
    { id: 'ethereum', symbol: 'ETH' },
  ],
};

export const UI_CONSTANTS = {
  WEEK_DAYS: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  THEME: {
    PRIMARY: '#1da2fc',
    DANGER: '#ff4757',
    SUCCESS: '#2ed573',
    // Вот этот массив нужен нашему лоадеру для 7 лепестков
    RAINBOW: [
      '#FF4D4D',
      '#FF9E4D',
      '#F9FF4D',
      '#4DFF4D',
      '#4DFFFF',
      '#4D4DFF',
      '#9E4DFF',
    ],
  },
};
