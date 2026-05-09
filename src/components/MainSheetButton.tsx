import { FileSpreadsheet } from "lucide-react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/15UyH-mxMLU1BwjJpHIEav2gwDgwT4YwCAHK2vfCYgW4/edit?gid=0#gid=0";

export function MainSheetButton() {
  return (
    <a
      href={SHEET_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Open the source Google Sheet"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-all duration-300 hover:bg-surface-hover hover:border-primary/40 hover:-translate-y-0.5"
    >
      <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
      <span>Main Sheet</span>
    </a>
  );
}
