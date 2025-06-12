import { Vector3D } from '../types';

// Mock sensor data for testing without hardware
export const mockSensorData = {
  accelerometer: {
    x: 0,
    y: 0,
    z: 9.81, // Earth's gravity
  } as Vector3D,
  gyroscope: {
    x: 0,
    y: 0,
    z: 0,
  } as Vector3D,
};

// Simulate sensor movement
export const simulateSensorMovement = (callback: (data: typeof mockSensorData) => void) => {
  let angle = 0;
  
  const interval = setInterval(() => {
    angle += 0.1;
    
    // Simulate circular motion
    const mockData = {
      accelerometer: {
        x: Math.sin(angle) * 2,
        y: Math.cos(angle) * 2,
        z: 9.81 + Math.sin(angle * 2) * 0.5,
      } as Vector3D,
      gyroscope: {
        x: Math.cos(angle) * 0.5,
        y: Math.sin(angle) * 0.5,
        z: Math.sin(angle * 3) * 0.2,
      } as Vector3D,
    };
    
    callback(mockData);
  }, 100); // Update every 100ms
  
  return () => clearInterval(interval);
};

// Development logging utility
export const devLog = (message: string, data?: any) => {
  if (__DEV__) {
    console.log(`[DEV] ${message}`, data || '');
  }
};

// Mock WebSocket connection for testing
export const createMockWebSocket = (onMessage: (data: any) => void) => {
  let isConnected = false;
  
  const mockSocket = {
    connect: () => {
      isConnected = true;
      devLog('Mock WebSocket connected');
      
      // Start sending mock data
      simulateSensorMovement((data) => {
        if (isConnected) {
          onMessage(data);
        }
      });
    },
    disconnect: () => {
      isConnected = false;
      devLog('Mock WebSocket disconnected');
    },
    send: (data: any) => {
      if (isConnected) {
        devLog('Mock WebSocket message sent:', data);
      }
    },
  };
  
  return mockSocket;
};

// Performance monitoring utility
export const measurePerformance = (label: string, fn: () => void) => {
  if (__DEV__) {
    const start = performance.now();
    fn();
    const end = performance.now();
    devLog(`Performance [${label}]:`, `${(end - start).toFixed(2)}ms`);
  } else {
    fn();
  }
}; 