import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_WEBSOCKET_URL, STORAGE_KEYS, DEFAULT_FALL_DETECTION_CONFIG, URL_VALIDATION } from '../constants/config';
import { AppSettings, UserProfile, FallDetectionConfig } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateWebSocketUrl: (url: string) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  updateFallDetectionConfig: (config: FallDetectionConfig) => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleVibration: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const validateWebSocketUrl = (url: string): boolean => {
  if (!url) return false;
  if (!url.startsWith(URL_VALIDATION.PROTOCOL)) return false;
  if (url.length > URL_VALIDATION.MAX_LENGTH) return false;
  // More lenient validation for IP addresses and domain names
  return /^ws:\/\/[a-zA-Z0-9\-\.]+(:\d+)?(\/[^\s]*)?$/.test(url);
};

const defaultUserProfile: UserProfile = {
  name: '',
  age: 0,
  weight: 0,
  height: 0,
  emergencyContacts: [],
};

const defaultSettings: AppSettings = {
  serverUrl: DEFAULT_WEBSOCKET_URL,
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: false,
  userProfile: defaultUserProfile,
  fallDetectionConfig: DEFAULT_FALL_DETECTION_CONFIG,
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Only use default URL if no URL is present
          if (!parsedSettings.serverUrl) {
            parsedSettings.serverUrl = DEFAULT_WEBSOCKET_URL;
          }
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const updateWebSocketUrl = async (url: string) => {
    try {
      if (!validateWebSocketUrl(url)) {
        throw new Error('Invalid WebSocket URL format');
      }
      await saveSettings({ ...settings, serverUrl: url });
    } catch (error) {
      console.error('Error updating WebSocket URL:', error);
      throw error;
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    await saveSettings({ ...settings, userProfile: profile });
  };

  const updateFallDetectionConfig = async (config: FallDetectionConfig) => {
    await saveSettings({ ...settings, fallDetectionConfig: config });
  };

  const toggleSound = async () => {
    await saveSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleVibration = async () => {
    await saveSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled });
  };

  if (isLoading) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateWebSocketUrl,
        updateUserProfile,
        updateFallDetectionConfig,
        toggleSound,
        toggleVibration,
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