import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSettings } from './SettingsContext';
import { WEBSOCKET_RECONNECT_INTERVAL, MAX_RECONNECTION_ATTEMPTS } from '../constants/config';
import { SensorData, WebSocketState } from '../types';

interface WebSocketContextType extends WebSocketState {
  sensorData: SensorData | null;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const ws = new WebSocket(settings.serverUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
      };

      ws.onclose = (event) => {
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
          setLastMessageTime(Date.now());
        } catch (err) {
          console.error('Error parsing sensor data:', err);
          setError('Invalid sensor data format');
        }
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  };

  const handleReconnect = () => {
    if (reconnectAttempts < MAX_RECONNECTION_ATTEMPTS) {
      reconnectTimeoutRef.current = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, WEBSOCKET_RECONNECT_INTERVAL);
    } else {
      setError('Maximum reconnection attempts reached');
    }
  };

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setReconnectAttempts(0);
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
  }, [settings.serverUrl]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sensorData,
        error,
        lastMessageTime,
        reconnectAttempts,
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