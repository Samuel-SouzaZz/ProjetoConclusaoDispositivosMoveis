import React, { createContext, useContext, useState, ReactNode } from "react";
import { Appearance } from "react-native";

interface ThemeContextData {
  theme: "light" | "dark";
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({
  theme: "light",
  isDarkMode: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Detecta o tema do sistema ao iniciar
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState<"light" | "dark">(colorScheme || "light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDarkMode = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
