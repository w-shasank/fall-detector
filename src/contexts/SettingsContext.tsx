import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_WEBSOCKET_URL, STORAGE_KEYS } from '../constants/config';

interface SettingsContextType {
  websocketUrl: string;
  setWebsocketUrl: (url: string) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websocketUrl, setWebsocketUrlState] = useState(DEFAULT_WEBSOCKET_URL);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved WebSocket URL on mount
  useEffect(() => {
    const loadSavedUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem(STORAGE_KEYS.WEBSOCKET_URL);
        if (savedUrl) {
          setWebsocketUrlState(savedUrl);
        }
      } catch (error) {
        console.error('Error loading WebSocket URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedUrl();
  }, []);

  const setWebsocketUrl = async (url: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEBSOCKET_URL, url);
      setWebsocketUrlState(url);
    } catch (error) {
      console.error('Error saving WebSocket URL:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        websocketUrl,
        setWebsocketUrl,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 