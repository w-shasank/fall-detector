import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSettings } from './SettingsContext';
import { WebSocketManagerImpl } from '../utils/websocket';
import { SensorData, WebSocketState } from '../types';

interface WebSocketContextType extends WebSocketState {
  sensorData: SensorData | null;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessageTime: null,
    reconnectAttempts: 0,
  });

  const wsManagerRef = useRef<WebSocketManagerImpl | null>(null);

  useEffect(() => {
    // Initialize WebSocket manager
    wsManagerRef.current = new WebSocketManagerImpl(
      (newState) => setState(newState),
      (data) => setSensorData(data)
    );

    return () => {
      wsManagerRef.current?.disconnect();
    };
  }, []);

  // Connect when URL changes
  useEffect(() => {
    if (wsManagerRef.current) {
      wsManagerRef.current.connect(settings.serverUrl);
    }
  }, [settings.serverUrl]);

  const reconnect = () => {
    wsManagerRef.current?.reconnect();
  };

  return (
    <WebSocketContext.Provider
      value={{
        ...state,
        sensorData,
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