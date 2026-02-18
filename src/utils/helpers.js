import { DEFAULT_DATA } from '../config';

/**
 * Popular websites for autocomplete suggestions.
 */
export const commonSites = DEFAULT_DATA.COMMON_SITES;

/**
 * Validates and formats a URL by prepending https:// and www. if needed.
 * @param {string} url
 * @param {boolean} forceTld - If true, appends .com if no dot is present.
 */
export const validateUrl = (url, forceTld = true) => {
  if (!url) return '';
  let formatted = url.trim().toLowerCase();

  // Basic cleanup
  formatted = formatted.replace(/^https?:\/\//, '');

  // Handle common omissions if forced (usually on submit)
  if (forceTld && !formatted.includes('.')) {
    if (formatted === 'localhost') return 'http://localhost';
    formatted += '.com';
  }

  // Prepend www if it looks like a standard domain and lacks it
  if (!formatted.startsWith('www.') && formatted.split('.').length === 2) {
    formatted = 'www.' + formatted;
  }

  // Only return with https if it has a dot (or is forced)
  if (formatted.includes('.') || forceTld) {
    return `https://${formatted}`;
  }

  return formatted;
};

/**
 * Checks if a URL is reachable using a lightweight HEAD request.
 */
export const checkUrlExistence = async (url) => {
  try {
    const validated = validateUrl(url, true);
    // Use a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(validated, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Extracts a display name from a URL or raw string.
 */
export const extractName = (url) => {
  if (!url) return '';

  // Remove protocol and www
  let name = url
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  // Take the first part before dot or slash
  name = name.split(/[./]/)[0];

  if (name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return '';
};

/**
 * Gets the domain (hostname) from a URL.
 */
export const getDomain = (url) => {
  try {
    const validated = validateUrl(url);
    return new URL(validated).hostname;
  } catch (e) {
    return '';
  }
};
