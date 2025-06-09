export const DEFAULT_WEBSOCKET_URL = 'ws://192.168.1.100:8080'; // Default ESP32 WebSocket server

export const STORAGE_KEYS = {
  WEBSOCKET_URL: '@NoFall:websocket_url',
  ALERT_PREFERENCES: '@NoFall:alert_preferences',
  THEME: '@NoFall:theme',
} as const;

export const RECONNECTION_DELAY = 3000; // 3 seconds
export const MAX_RECONNECTION_ATTEMPTS = 5; 