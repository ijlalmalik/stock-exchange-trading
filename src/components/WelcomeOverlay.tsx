import { WelcomeScreen } from "@/routes/welcome";

/**
 * Renders the welcome screen as an overlay component (not a route).
 * Used by AppShell to gate the dashboard — the dashboard never mounts
 * while this is shown.
 */
export function WelcomeOverlay({ onDone }: { onDone: () => void }) {
  return <WelcomeScreen onDone={onDone} />;
}
