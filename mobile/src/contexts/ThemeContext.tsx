import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    secondary: '#9c27b0',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90caf9',
    secondary: '#ce93d8',
    accent: '#03dac4',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    error: '#CF6679',
  },
};

interface ThemeContextType {
  theme: typeof lightTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
