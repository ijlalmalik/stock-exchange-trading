import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FileSpreadsheet, RefreshCw } from "lucide-react";
import { useState } from "react";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/15UyH-mxMLU1BwjJpHIEav2gwDgwT4YwCAHK2vfCYgW4/edit?sharingaction=ownershiptransfer&pli=1&gid=0#gid=0";
const EMBED_URL = "https://docs.google.com/spreadsheets/d/15UyH-mxMLU1BwjJpHIEav2gwDgwT4YwCAHK2vfCYgW4/preview?gid=0";

export const Route = createFileRoute("/sheet")({
  component: SheetPage,
});

function SheetPage() {
  const [key, setKey] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass glass-hover-lift rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Original Backend Sheet</h1>
            <p className="text-xs text-muted-foreground">Live Google Sheet powering the dashboard data</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-all duration-300 hover:bg-surface-hover hover:border-primary/40 hover:-translate-y-0.5"
          >
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            Reload
          </button>
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Google Sheets
          </a>
        </div>
      </div>

      <div className="glass-strong rounded-2xl overflow-hidden border border-border animate-fade-scale">
        <iframe
          key={key}
          src={EMBED_URL}
          title="Portfolio Backend Sheet"
          className="w-full h-[calc(100vh-220px)] min-h-[600px] bg-card"
        />
      </div>
    </div>
  );
}
