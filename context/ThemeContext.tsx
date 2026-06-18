import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  primary: string;
};

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const lightTheme: Theme = {
  background: "#F5F5F5",
  card: "#FFFFFF",
  text: "#111827",
  secondaryText: "#6B7280",
  border: "#E5E7EB",
  primary: "#007AFF",
};

const darkTheme: Theme = {
  background: "#111827",
  card: "#1F2937",
  text: "#F9FAFB",
  secondaryText: "#D1D5DB",
  border: "#374151",
  primary: "#60A5FA",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      setIsDark(savedTheme === "dark");
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem("theme", newValue ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: isDark ? darkTheme : lightTheme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme mora da se koristi unutar ThemeProvider-a");
  }

  return context;
}