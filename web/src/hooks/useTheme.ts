import { useState, useEffect } from 'react';
import { Theme } from '@mui/material';
import { lightTheme, darkTheme } from '@constants/theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme(darkTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme === darkTheme ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
