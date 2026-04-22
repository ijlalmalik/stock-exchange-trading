import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Settings2, RotateCcw } from "lucide-react";
import { usePortfolio } from "@/lib/portfolio-store";
import type { StockHolding } from "@/lib/google-sheets";

type EditDraft = {
  script: string;
  company: string;
  shares: string;
  ldcp: string;
  purchasedRate: string;
  week52Low: string;
  week52High: string;
  dividend: string;
};

const empty: EditDraft = {
  script: "",
  company: "",
  shares: "",
  ldcp: "",
  purchasedRate: "",
  week52Low: "",
  week52High: "",
  dividend: "",
};

function toDraft(h: StockHolding): EditDraft {
  return {
    script: h.script,
    company: h.company,
    shares: String(h.shares),
    ldcp: String(h.ldcp),
    purchasedRate: String(h.purchasedRate),
    week52Low: String(h.week52Low),
    week52High: String(h.week52High),
    dividend: String(h.dividend),
  };
}

export function HoldingsManager() {
  const { holdings, addHolding, updateHolding, deleteHolding, resetOverrides } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<EditDraft>(empty);

  const startEdit = (h: StockHolding) => {
    setEditing(h.script);
    setAdding(false);
    setDraft(toDraft(h));
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setDraft(empty);
  };

  const cancel = () => {
    setEditing(null);
    setAdding(false);
    setDraft(empty);
  };

  const save = () => {
    const num = (s: string) => parseFloat(s) || 0;
    const patch = {
      company: draft.company,
      shares: num(draft.shares),
      ldcp: num(draft.ldcp),
      purchasedRate: num(draft.purchasedRate),
      week52Low: num(draft.week52Low),
      week52High: num(draft.week52High),
      dividend: num(draft.dividend),
    };
    if (adding) {
      if (!draft.script.trim()) return;
      addHolding({ script: draft.script.trim().toUpperCase(), ...patch });
    } else if (editing) {
      updateHolding(editing, patch);
    }
    cancel();
  };

  const onDelete = (script: string) => {
    if (confirm(`Remove ${script} from your portfolio? You can reset overrides anytime.`)) {
      deleteHolding(script);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-all duration-300 hover:bg-surface-hover hover:border-primary/40"
      >
        <Settings2 className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline">Manage Holdings</span>
        <span className="sm:hidden">Manage</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4" onClick={() => setOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Manage Holdings</h2>
                <p className="text-xs text-muted-foreground">Add, edit, or remove stocks. Changes are saved locally.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (confirm("Reset all local changes and restore sheet data?")) resetOverrides(); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
                  title="Reset all local edits"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
                <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {!adding && !editing && (
                <button
                  onClick={startAdd}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface/50 py-3 text-sm font-medium text-primary transition-all duration-300 hover:bg-surface hover:border-primary/50"
                >
                  <Plus className="h-4 w-4" />
                  Add New Stock
                </button>
              )}

              {(adding || editing) && (
                <div className="rounded-xl border border-primary/40 bg-surface p-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Field label="Symbol" value={draft.script} onChange={(v) => setDraft({ ...draft, script: v })} disabled={!adding} />
                    <Field label="Company" value={draft.company} onChange={(v) => setDraft({ ...draft, company: v })} className="col-span-2 sm:col-span-3" />
                    <Field label="Shares" value={draft.shares} onChange={(v) => setDraft({ ...draft, shares: v })} type="number" />
                    <Field label="LDCP" value={draft.ldcp} onChange={(v) => setDraft({ ...draft, ldcp: v })} type="number" />
                    <Field label="Avg Cost" value={draft.purchasedRate} onChange={(v) => setDraft({ ...draft, purchasedRate: v })} type="number" />
                    <Field label="Dividend" value={draft.dividend} onChange={(v) => setDraft({ ...draft, dividend: v })} type="number" />
                    <Field label="52W Low" value={draft.week52Low} onChange={(v) => setDraft({ ...draft, week52Low: v })} type="number" />
                    <Field label="52W High" value={draft.week52High} onChange={(v) => setDraft({ ...draft, week52High: v })} type="number" />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={cancel} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Cancel
                    </button>
                    <button onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                      <Check className="h-3.5 w-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-surface border-b border-border">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Symbol</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shares</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">LDCP</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => (
                      <tr key={h.script} className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors">
                        <td className="px-3 py-2 font-bold text-foreground">{h.script}</td>
                        <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{h.company}</td>
                        <td className="px-3 py-2 text-right font-mono">{h.shares}</td>
                        <td className="px-3 py-2 text-right font-mono">{h.ldcp.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex gap-1">
                            <button onClick={() => startEdit(h)} className="rounded p-1.5 text-muted-foreground hover:bg-surface hover:text-primary transition-colors" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => onDelete(h.script)} className="rounded p-1.5 text-muted-foreground hover:bg-loss-bg hover:text-loss transition-colors" title="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = "text", disabled, className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        step="any"
        className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
      />
    </label>
  );
}
