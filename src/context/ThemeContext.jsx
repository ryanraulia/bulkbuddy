// context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Update body background color
    if (darkMode) {
      document.body.style.backgroundColor = '#2a2a2a';  // Dark grey
      document.documentElement.style.backgroundColor = '#2a2a2a';
    } else {
      document.body.style.backgroundColor = '#ffffff';  // White
      document.documentElement.style.backgroundColor = '#ffffff';
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}