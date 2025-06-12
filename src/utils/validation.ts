// URL validation constants
const URL_VALIDATION = {
  PROTOCOL: 'ws://',
  MAX_LENGTH: 200,
  PATTERN: /^ws:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(:[0-9]+)?(\/[^\s]*)?$/,
};

/**
 * Validates a WebSocket URL
 * @param url The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export const validateUrl = (url: string): boolean => {
  if (!url) return false;
  if (!url.startsWith(URL_VALIDATION.PROTOCOL)) return false;
  if (url.length > URL_VALIDATION.MAX_LENGTH) return false;
  return URL_VALIDATION.PATTERN.test(url);
}; 