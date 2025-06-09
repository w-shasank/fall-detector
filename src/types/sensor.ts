export interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

export interface FallDetectionConfig {
  accelerometerThreshold: number;
  gyroscopeThreshold: number;
  impactThreshold: number;
  recoveryTime: number;
} 