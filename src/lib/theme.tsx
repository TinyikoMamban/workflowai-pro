import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void; resolved: "light" | "dark" };
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem("theme")) as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const apply = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", isDark);
      setResolved(isDark ? "dark" : "light");
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof localStorage !== "undefined") localStorage.setItem("theme", t);
  };

  return <Ctx.Provider value={{ theme, setTheme, resolved }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("ThemeProvider missing");
  return c;
}
