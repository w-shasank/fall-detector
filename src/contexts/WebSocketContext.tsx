import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSettings } from './SettingsContext';
import { RECONNECTION_DELAY, MAX_RECONNECTION_ATTEMPTS } from '../constants/config';
import { SensorData } from '../types/sensor';

interface WebSocketContextType {
  isConnected: boolean;
  sensorData: SensorData | null;
  error: string | null;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { websocketUrl } = useSettings();
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const ws = new WebSocket(websocketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = () => {
        setIsConnected(false);
        handleReconnect();
      };

      ws.onerror = (event) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as SensorData;
          setSensorData(data);
        } catch (err) {
          console.error('Error parsing sensor data:', err);
        }
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  };

  const handleReconnect = () => {
    if (reconnectAttemptsRef.current < MAX_RECONNECTION_ATTEMPTS) {
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1;
        connect();
      }, RECONNECTION_DELAY);
    } else {
      setError('Maximum reconnection attempts reached');
    }
  };

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectAttemptsRef.current = 0;
    connect();
  };

  // Connect when URL changes
  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [websocketUrl]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sensorData,
        error,
        reconnect,
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