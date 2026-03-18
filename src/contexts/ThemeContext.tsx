import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export const THEME_NAMES: Record<number, string> = {
  0: "Default (Blue)",
  1: "Crimson Red",
  2: "Emerald Green",
  3: "Amber Gold",
  4: "Purple Haze",
  5: "Cyber Teal",
  6: "Sunset Orange",
  7: "Rose Pink",
};

type ThemeContextType = {
  themeId: number;
  themeName: string;
  setTheme: (id: number) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeId: 0,
  themeName: "Default (Blue)",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem("shreecloud-theme");
    return saved ? Number(saved) : 0;
  });

  const setTheme = useCallback((id: number) => {
    if (id >= 0 && id <= 7) {
      setThemeId(id);
      localStorage.setItem("shreecloud-theme", String(id));
      // Apply data attribute for CSS
      document.documentElement.setAttribute("data-theme", String(id));
    }
  }, []);

  // Apply on mount
  if (typeof window !== "undefined") {
    document.documentElement.setAttribute("data-theme", String(themeId));
  }

  return (
    <ThemeContext.Provider value={{ themeId, themeName: THEME_NAMES[themeId], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
