import { useEffect, useRef, useState } from "react";
import { Settings2, RotateCcw, X, Check, Sun, Moon, Type, Sparkles, Palette, Layout, Eye, Zap } from "lucide-react";
import {
  useCustomization,
  ACCENT_PRESETS,
  FONT_OPTIONS,
  DEFAULTS,
  type CustomizationState,
  type ButtonStyle,
  type TabStyle,
  type Density,
  type FontFamily,
} from "@/lib/customization";
import { useTheme, type Theme } from "@/lib/theme";

const THEMES: { id: Theme; icon: typeof Sun; label: string }[] = [
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "light", icon: Sun, label: "Light" },
];

interface SettingsPanelProps {
  variant?: "icon" | "full";
  className?: string;
}

export function SettingsPanel({ variant = "icon", className = "" }: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const c = useCustomization();
  const { theme, setTheme } = useTheme();

  // Snapshot taken when modal opens — used for Cancel revert.
  const snapshotRef = useRef<{ theme: Theme; state: CustomizationState } | null>(null);

  useEffect(() => {
    if (open) {
      snapshotRef.current = {
        theme,
        state: {
          radius: c.radius, borderWidth: c.borderWidth,
          glassBlur: c.glassBlur, glassOpacity: c.glassOpacity,
          glowIntensity: c.glowIntensity, shadowIntensity: c.shadowIntensity,
          accentHue: c.accentHue,
          fontFamily: c.fontFamily, fontScale: c.fontScale,
          density: c.density, spacingScale: c.spacingScale,
          buttonStyle: c.buttonStyle, tabStyle: c.tabStyle,
          reducedMotion: c.reducedMotion, animationSpeed: c.animationSpeed,
          highContrast: c.highContrast,
        },
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cancel = () => {
    if (snapshotRef.current) {
      setTheme(snapshotRef.current.theme);
      c.setAll(snapshotRef.current.state);
    }
    setOpen(false);
  };

  const apply = () => setOpen(false); // changes are already live + persisted
  const reset = () => { setTheme("dark"); c.setAll(DEFAULTS); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Customize appearance"
        aria-label="Open settings"
        data-no-glass
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface text-foreground transition-all hover:bg-surface-hover hover:border-primary/40 ${
          variant === "full" ? "px-3 py-2 text-xs font-medium" : "h-9 w-9"
        } ${className}`}
      >
        <Settings2 className="h-4 w-4" />
        {variant === "full" && <span>Customize</span>}
      </button>

      {open && (
        <div
          onClick={cancel}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-md animate-fade-in sm:p-6"
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-fade-scale"
            style={{
              boxShadow:
                "0 0 0 1px color-mix(in oklab, var(--color-primary) 20%, transparent), 0 0 60px -8px color-mix(in oklab, var(--color-primary) 35%, transparent), 0 30px 80px -20px rgba(0,0,0,0.6)",
            }}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-card/90 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Settings2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground sm:text-base">Customize</h2>
                  <p className="hidden text-[11px] text-muted-foreground sm:block">Live preview — Apply to keep, Cancel to revert</p>
                </div>
              </div>
              <button
                onClick={cancel}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-7 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
              {/* Theme + accent */}
              <Section icon={<Palette className="h-3.5 w-3.5" />} label="Theme & color">
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => {
                    const active = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <t.icon className="h-4 w-4" /> {t.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ACCENT_PRESETS.map((p) => {
                    const active = Math.abs(c.accentHue - p.hue) < 4;
                    return (
                      <button
                        key={p.id}
                        onClick={() => c.set("accentHue", p.hue)}
                        title={p.label}
                        data-no-glass
                        className={`h-9 w-9 rounded-full border-2 transition-all ${
                          active ? "border-foreground scale-110" : "border-white/30 hover:scale-105"
                        }`}
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${p.swatch}, ${p.swatch}cc)`,
                          boxShadow: active
                            ? `0 0 0 2px var(--background), 0 0 0 4px ${p.swatch}, 0 0 18px ${p.swatch}80`
                            : `0 0 12px ${p.swatch}40`,
                        }}
                      />
                    );
                  })}
                </div>
                <Slider label="Custom hue" value={c.accentHue} min={0} max={360} unit="°" onChange={(v) => c.set("accentHue", v)} />
              </Section>

              {/* Typography */}
              <Section icon={<Type className="h-3.5 w-3.5" />} label="Typography">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {FONT_OPTIONS.map((f) => {
                    const active = c.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => c.set("fontFamily", f.id as FontFamily)}
                        className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition-all ${
                          active ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                        style={{ fontFamily: f.stack }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <Slider label="Font size" value={c.fontScale} min={0.85} max={1.25} step={0.05} unit="×" onChange={(v) => c.set("fontScale", v)} />
              </Section>

              {/* Layout */}
              <Section icon={<Layout className="h-3.5 w-3.5" />} label="Layout & spacing">
                <Segmented
                  value={c.density}
                  onChange={(v) => c.set("density", v as Density)}
                  options={[
                    { id: "compact", label: "Compact" },
                    { id: "cozy", label: "Cozy" },
                    { id: "comfortable", label: "Roomy" },
                  ]}
                />
                <Slider label="Spacing scale" value={c.spacingScale} min={0.75} max={1.5} step={0.05} unit="×" onChange={(v) => c.set("spacingScale", v)} />
                <Slider label="Corner radius" value={c.radius} min={0} max={28} unit="px" onChange={(v) => c.set("radius", v)} />
                <Slider label="Border width" value={c.borderWidth} min={0} max={3} unit="px" onChange={(v) => c.set("borderWidth", v)} />
              </Section>

              {/* Glass + Glow */}
              <Section icon={<Sparkles className="h-3.5 w-3.5" />} label="Glass & glow">
                <Slider label="Glass blur" value={c.glassBlur} min={0} max={60} unit="px" onChange={(v) => c.set("glassBlur", v)} />
                <Slider label="Glass opacity" value={c.glassOpacity} min={20} max={95} unit="%" onChange={(v) => c.set("glassOpacity", v)} />
                <Slider label="Glow intensity" value={c.glowIntensity} min={0} max={100} unit="%" onChange={(v) => c.set("glowIntensity", v)} />
                <Slider label="Shadow depth" value={c.shadowIntensity} min={0} max={100} unit="%" onChange={(v) => c.set("shadowIntensity", v)} />
              </Section>

              {/* Components */}
              <Section icon={<Zap className="h-3.5 w-3.5" />} label="Components">
                <Label>Button shape</Label>
                <Segmented
                  value={c.buttonStyle}
                  onChange={(v) => c.set("buttonStyle", v as ButtonStyle)}
                  options={[
                    { id: "default", label: "Default" },
                    { id: "pill", label: "Pill" },
                    { id: "square", label: "Square" },
                    { id: "glass", label: "Glass" },
                  ]}
                />
                <Label>Tabs style</Label>
                <Segmented
                  value={c.tabStyle}
                  onChange={(v) => c.set("tabStyle", v as TabStyle)}
                  options={[
                    { id: "default", label: "Default" },
                    { id: "pill", label: "Pill" },
                    { id: "underline", label: "Underline" },
                    { id: "glass", label: "Glass" },
                  ]}
                />
              </Section>

              {/* Motion + accessibility */}
              <Section icon={<Eye className="h-3.5 w-3.5" />} label="Motion & accessibility">
                <Slider label="Animation speed" value={c.animationSpeed} min={0.25} max={2} step={0.05} unit="×" onChange={(v) => c.set("animationSpeed", v)} />
                <Toggle label="Reduce motion" checked={c.reducedMotion} onChange={(v) => c.set("reducedMotion", v)} />
                <Toggle label="High contrast" checked={c.highContrast} onChange={(v) => c.set("highContrast", v)} />
              </Section>
            </div>

            {/* Sticky action bar */}
            <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-xl sm:px-6">
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancel}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={apply}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-3.5 w-3.5" /> Apply
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

/* ----- small UI helpers ----- */

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function Slider({
  label, value, min, max, step = 1, unit, onChange,
}: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-foreground/80">{label}</span>
        <span className="font-mono text-[11px] text-foreground">{step < 1 ? value.toFixed(2) : value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}

function Segmented<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[] }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all ${
              active ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-xs">
      <span className="text-foreground">{label}</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
        <input
          type="checkbox" checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </label>
  );
}
