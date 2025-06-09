// WebSocket Configuration
export const DEFAULT_WEBSOCKET_URL = 'ws://192.168.1.73:8080';
export const WEBSOCKET_RECONNECT_INTERVAL = 3000; // 3 seconds
export const MAX_RECONNECTION_ATTEMPTS = 5;

// Sensor Configuration
export const SENSOR_UPDATE_RATE = 100; // 100ms between updates
export const ACCELEROMETER_RANGE = {
  min: -15,
  max: 15,
} as const;

export const GYROSCOPE_RANGE = {
  min: -500,
  max: 500,
} as const;

// Fall Detection Configuration
export const DEFAULT_FALL_DETECTION_CONFIG = {
  accelerometerThreshold: 15,
  gyroscopeThreshold: 500,
  impactThreshold: 20,
  recoveryTime: 5000, // 5 seconds
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  WEBSOCKET_URL: '@NoFall:websocket_url',
  USER_PROFILE: '@NoFall:user_profile',
  APP_SETTINGS: '@NoFall:app_settings',
  THEME: '@NoFall:theme',
} as const;

// Alert Configuration
export const ALERT_CONFIG = {
  SOUND_DURATION: 5000, // 5 seconds
  VIBRATION_PATTERN: [0, 1000, 500, 1000], // [wait, vibrate, wait, vibrate]
  MAX_ALERT_RETRIES: 3,
} as const;

// Validation
export const URL_VALIDATION = {
  PROTOCOL: 'ws://',
  MAX_LENGTH: 200,
  PATTERN: /^ws:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(:[0-9]+)?(\/[^\s]*)?$/,
} as const; 