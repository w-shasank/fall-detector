import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode } from '../types';
import { lightThemeColors, darkThemeColors } from '../constants/theme';
import { STORAGE_KEYS } from '../constants/config';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: mode === 'dark' ? darkThemeColors : lightThemeColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(createTheme('light'));
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme) {
          setTheme(createTheme(savedTheme as ThemeMode));
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
      setTheme(createTheme(mode));
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  };

  const toggleTheme = async () => {
    const newMode: ThemeMode = theme.mode === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme.mode === 'dark',
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 