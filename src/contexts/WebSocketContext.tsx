import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';
import { SensorData } from '../types';
import { createMockWebSocket, devLog, measurePerformance } from '../utils/devTools';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sensorData: SensorData | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [socket, setSocket] = useState<WebSocket | ReturnType<typeof createMockWebSocket> | null>(null);

  const connect = async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      measurePerformance('WebSocket Connection', () => {
        if (__DEV__) {
          // Use mock WebSocket in development
          const mockSocket = createMockWebSocket((data) => {
            setSensorData(data);
          });
          mockSocket.connect();
          setSocket(mockSocket);
          setIsConnected(true);
        } else {
          // Use real WebSocket in production
          const ws = new WebSocket(settings.serverUrl);
          
          ws.onopen = () => {
            devLog('WebSocket connected');
            setIsConnected(true);
          };
          
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              setSensorData(data);
            } catch (err) {
              devLog('Error parsing WebSocket message:', err);
            }
          };
          
          ws.onerror = (event) => {
            devLog('WebSocket error:', event);
            setError('Connection error occurred');
            setIsConnected(false);
          };
          
          ws.onclose = () => {
            devLog('WebSocket disconnected');
            setIsConnected(false);
          };
          
          setSocket(ws);
        }
      });
    } catch (err) {
      devLog('Error connecting to WebSocket:', err);
      setError('Failed to connect to server');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (socket) {
      if (__DEV__) {
        (socket as ReturnType<typeof createMockWebSocket>).disconnect();
      } else {
        (socket as WebSocket).close();
      }
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // Reconnect when server URL changes
  useEffect(() => {
    if (isConnected) {
      disconnect();
      connect();
    }
  }, [settings.serverUrl]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isConnecting,
        error,
        sensorData,
        connect,
        disconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 