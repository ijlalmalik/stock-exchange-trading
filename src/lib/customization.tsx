import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ButtonStyle = "default" | "pill" | "square" | "glass";
export type TabStyle = "default" | "pill" | "underline" | "glass";

export interface CustomizationState {
  radius: number; // px, applied to --radius
  glassBlur: number; // px
  glassOpacity: number; // 0-100 (% white/card mix)
  buttonStyle: ButtonStyle;
  tabStyle: TabStyle;
  accentHue: number; // 0-360, shifts --primary hue
  density: "compact" | "cozy" | "comfortable";
  reducedMotion: boolean;
  animationSpeed: number; // 0.25 - 2 multiplier
}

const DEFAULTS: CustomizationState = {
  radius: 12,
  glassBlur: 24,
  glassOpacity: 55,
  buttonStyle: "default",
  tabStyle: "default",
  accentHue: 250,
  density: "cozy",
  reducedMotion: false,
  animationSpeed: 1,
};

export const ACCENT_PRESETS: { id: string; label: string; hue: number; swatch: string }[] = [
  { id: "emerald", label: "Emerald", hue: 152, swatch: "#34d399" },
  { id: "blue", label: "Blue", hue: 220, swatch: "#3b82f6" },
  { id: "purple", label: "Purple", hue: 280, swatch: "#a855f7" },
  { id: "rose", label: "Rose", hue: 350, swatch: "#f43f5e" },
  { id: "amber", label: "Amber", hue: 45, swatch: "#f59e0b" },
];

interface CustomizationContextType extends CustomizationState {
  set: <K extends keyof CustomizationState>(key: K, value: CustomizationState[K]) => void;
  reset: () => void;
}

const Ctx = createContext<CustomizationContextType>({
  ...DEFAULTS,
  set: () => {},
  reset: () => {},
});

const STORAGE_KEY = "portfolio-customization";

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CustomizationState>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...DEFAULTS, ...parsed });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    const root = document.documentElement;
    root.style.setProperty("--radius", `${state.radius / 16}rem`);
    root.style.setProperty("--c-glass-blur", `${state.glassBlur}px`);
    root.style.setProperty("--c-glass-opacity", `${state.glassOpacity}%`);
    root.style.setProperty("--c-accent-hue", String(state.accentHue));
    root.style.setProperty(
      "--c-density-y",
      state.density === "compact" ? "0.35rem" : state.density === "comfortable" ? "0.75rem" : "0.55rem",
    );
    root.style.setProperty("--c-anim-speed", String(state.animationSpeed));
    root.dataset.buttonStyle = state.buttonStyle;
    root.dataset.tabStyle = state.tabStyle;
    root.dataset.density = state.density;
    root.dataset.reducedMotion = state.reducedMotion ? "true" : "false";
  }, [state]);

  const set: CustomizationContextType["set"] = (key, value) =>
    setState((s) => ({ ...s, [key]: value }));
  const reset = () => setState(DEFAULTS);

  return <Ctx.Provider value={{ ...state, set, reset }}>{children}</Ctx.Provider>;
}

export const useCustomization = () => useContext(Ctx);
