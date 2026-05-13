import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ButtonStyle = "default" | "pill" | "square" | "glass";
export type TabStyle = "default" | "pill" | "underline" | "glass";
export type FontFamily = "inter" | "system" | "mono" | "serif" | "rounded";
export type Density = "compact" | "cozy" | "comfortable";

export interface CustomizationState {
  // Shape
  radius: number;          // px
  borderWidth: number;     // px (0-3)
  // Glass
  glassBlur: number;       // px
  glassOpacity: number;    // 0-100
  glowIntensity: number;   // 0-100
  shadowIntensity: number; // 0-100
  // Color
  accentHue: number;       // 0-360
  // Typography
  fontFamily: FontFamily;
  fontScale: number;       // 0.85 - 1.25 multiplier
  // Layout
  density: Density;
  spacingScale: number;    // 0.75 - 1.5 multiplier
  // Components
  buttonStyle: ButtonStyle;
  tabStyle: TabStyle;
  // Motion / a11y
  reducedMotion: boolean;
  animationSpeed: number;  // 0.25 - 2 multiplier
  highContrast: boolean;
}

export const DEFAULTS: CustomizationState = {
  radius: 14,
  borderWidth: 1,
  glassBlur: 36,
  glassOpacity: 42,
  glowIntensity: 55,
  shadowIntensity: 50,
  accentHue: 250,
  fontFamily: "inter",
  fontScale: 1,
  density: "cozy",
  spacingScale: 1,
  buttonStyle: "default",
  tabStyle: "default",
  reducedMotion: false,
  animationSpeed: 1,
  highContrast: false,
};

export const ACCENT_PRESETS: { id: string; label: string; hue: number; swatch: string }[] = [
  { id: "emerald", label: "Emerald", hue: 152, swatch: "#34d399" },
  { id: "blue", label: "Blue", hue: 220, swatch: "#3b82f6" },
  { id: "indigo", label: "Indigo", hue: 250, swatch: "#6366f1" },
  { id: "purple", label: "Purple", hue: 280, swatch: "#a855f7" },
  { id: "rose", label: "Rose", hue: 350, swatch: "#f43f5e" },
  { id: "amber", label: "Amber", hue: 45, swatch: "#f59e0b" },
  { id: "cyan", label: "Cyan", hue: 200, swatch: "#06b6d4" },
];

export const FONT_OPTIONS: { id: FontFamily; label: string; stack: string }[] = [
  { id: "inter", label: "Inter", stack: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: "system", label: "System", stack: 'ui-sans-serif, system-ui, -apple-system, sans-serif' },
  { id: "rounded", label: "Rounded", stack: '"Nunito", "SF Pro Rounded", ui-rounded, system-ui, sans-serif' },
  { id: "serif", label: "Serif", stack: '"Source Serif Pro", Georgia, ui-serif, serif' },
  { id: "mono", label: "Mono", stack: '"JetBrains Mono", ui-monospace, monospace' },
];

interface CustomizationContextType extends CustomizationState {
  set: <K extends keyof CustomizationState>(key: K, value: CustomizationState[K]) => void;
  setAll: (s: CustomizationState) => void;
  reset: () => void;
}

const Ctx = createContext<CustomizationContextType>({
  ...DEFAULTS,
  set: () => {},
  setAll: () => {},
  reset: () => {},
});

const STORAGE_KEY = "portfolio-customization-v2";

function applyToDom(state: CustomizationState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--radius", `${state.radius / 16}rem`);
  root.style.setProperty("--c-border-width", `${state.borderWidth}px`);
  root.style.setProperty("--c-glass-blur", `${state.glassBlur}px`);
  root.style.setProperty("--c-glass-opacity", `${state.glassOpacity}%`);
  root.style.setProperty("--c-glow", String(state.glowIntensity / 100));
  root.style.setProperty("--c-shadow", String(state.shadowIntensity / 100));
  root.style.setProperty("--c-accent-hue", String(state.accentHue));
  root.style.setProperty("--c-font-scale", String(state.fontScale));
  root.style.setProperty("--c-spacing", String(state.spacingScale));
  root.style.setProperty(
    "--c-density-y",
    state.density === "compact" ? "0.35rem" : state.density === "comfortable" ? "0.75rem" : "0.55rem",
  );
  root.style.setProperty("--c-anim-speed", String(state.animationSpeed));
  const fontStack = FONT_OPTIONS.find((f) => f.id === state.fontFamily)?.stack ?? FONT_OPTIONS[0].stack;
  root.style.setProperty("--font-sans", fontStack);
  root.dataset.buttonStyle = state.buttonStyle;
  root.dataset.tabStyle = state.tabStyle;
  root.dataset.density = state.density;
  root.dataset.reducedMotion = state.reducedMotion ? "true" : "false";
  root.dataset.highContrast = state.highContrast ? "true" : "false";
}

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CustomizationState>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
    applyToDom(state);
  }, [state]);

  const set: CustomizationContextType["set"] = (key, value) =>
    setState((s) => ({ ...s, [key]: value }));
  const setAll = (s: CustomizationState) => setState(s);
  const reset = () => setState(DEFAULTS);

  return <Ctx.Provider value={{ ...state, set, setAll, reset }}>{children}</Ctx.Provider>;
}

export const useCustomization = () => useContext(Ctx);
