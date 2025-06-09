// Sensor Data Types
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SensorData {
  accelerometer: Vector3D;  // Range: -15 to +15
  gyroscope: Vector3D;      // Range: -500 to +500
  timestamp: number;
}

// User Profile Types
export interface UserProfile {
  name: string;
  age: number;
  weight: number;  // in kg
  height: number;  // in cm
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// App Settings Types
export interface AppSettings {
  serverUrl: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  userProfile: UserProfile;
  fallDetectionConfig: FallDetectionConfig;
}

export interface FallDetectionConfig {
  accelerometerThreshold: number;  // Default: 15
  gyroscopeThreshold: number;      // Default: 500
  impactThreshold: number;         // Default: 20
  recoveryTime: number;            // Default: 5000 (ms)
}

// Theme Types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
  border: string;
  disabled: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// WebSocket Types
export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessageTime: number | null;
  reconnectAttempts: number;
}

// Navigation Types
export type RootStackParamList = {
  Monitor: undefined;
  Settings: undefined;
}; 