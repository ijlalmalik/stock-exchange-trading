import { useState } from "react";
import { Settings2, RotateCcw, X } from "lucide-react";
import { useCustomization, ACCENT_PRESETS } from "@/lib/customization";
import { useTheme, type Theme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

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
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-scale-in"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Customize</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={c.reset}
                  title="Reset to defaults"
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="space-y-6 overflow-y-auto px-5 py-5">
              <Section label="Theme">
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((t) => {
                    const active = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-[11px] font-medium transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Slider
                label="Corner radius"
                value={c.radius}
                min={0}
                max={28}
                unit="px"
                onChange={(v) => c.set("radius", v)}
              />

              <Section label="Accent color">
                <div className="mb-2 flex flex-wrap gap-2">
                  {ACCENT_PRESETS.map((p) => {
                    const active = Math.abs(c.accentHue - p.hue) < 4;
                    return (
                      <button
                        key={p.id}
                        onClick={() => c.set("accentHue", p.hue)}
                        title={p.label}
                        data-no-glass
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          active ? "border-foreground scale-110" : "border-white/30 hover:scale-105"
                        }`}
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${p.swatch}, ${p.swatch}cc)`,
                          boxShadow: active ? `0 0 0 2px var(--background), 0 0 0 4px ${p.swatch}` : undefined,
                        }}
                      />
                    );
                  })}
                </div>
                <Slider
                  label="Custom hue"
                  value={c.accentHue}
                  min={0}
                  max={360}
                  unit="°"
                  onChange={(v) => c.set("accentHue", v)}
                />
              </Section>

              <Slider
                label="Animation speed"
                value={c.animationSpeed}
                min={0.25}
                max={2}
                step={0.05}
                unit="×"
                onChange={(v) => c.set("animationSpeed", v)}
              />

              <Slider
                label="Glass blur"
                value={c.glassBlur}
                min={0}
                max={48}
                unit="px"
                onChange={(v) => c.set("glassBlur", v)}
              />

              <Slider
                label="Glass opacity"
                value={c.glassOpacity}
                min={20}
                max={95}
                unit="%"
                onChange={(v) => c.set("glassOpacity", v)}
              />

              <Section label="Motion">
                <label className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-xs">
                  <span className="text-foreground">Reduce motion</span>
                  <input
                    type="checkbox"
                    checked={c.reducedMotion}
                    onChange={(e) => c.set("reducedMotion", e.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                </label>
              </Section>

              <p className="pt-2 text-center text-[10px] text-muted-foreground">
                Settings sync to this device automatically.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span className="font-mono text-[11px] text-foreground">
          {step < 1 ? value.toFixed(2) : value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}
