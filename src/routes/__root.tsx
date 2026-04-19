import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import appCss from "../styles.css?url";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader, ViewModeFloating } from "@/components/MobileHeader";
import { ThemeProvider } from "@/lib/theme";
import { ViewModeProvider, useViewMode } from "@/lib/view-mode";
import { PortfolioProvider } from "@/lib/portfolio-store";
import { CustomizationProvider } from "@/lib/customization";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ijlal's Portfolio — PSX Stock Tracker" },
      { name: "description", content: "Track your Pakistan Stock Exchange portfolio performance in real-time" },
      { property: "og:title", content: "Ijlal's Portfolio — PSX Stock Tracker" },
      { name: "twitter:title", content: "Ijlal's Portfolio — PSX Stock Tracker" },
      { property: "og:description", content: "Track your Pakistan Stock Exchange portfolio performance in real-time" },
      { name: "twitter:description", content: "Track your Pakistan Stock Exchange portfolio performance in real-time" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/XB6quJMgV2ZgEtkKW0MFzsRxQNS2/social-images/social-1776353425496-ChatGPT_Image_Apr_16,_2026,_08_30_05_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/XB6quJMgV2ZgEtkKW0MFzsRxQNS2/social-images/social-1776353425496-ChatGPT_Image_Apr_16,_2026,_08_30_05_PM.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <CustomizationProvider>
        <ViewModeProvider>
          <PortfolioProvider>
            <AppShell />
          </PortfolioProvider>
        </ViewModeProvider>
      </CustomizationProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode } = useViewMode();
  const forceMobile = mode === "mobile";

  return (
    <div className={`flex min-h-screen ${forceMobile ? "mx-auto max-w-[430px] border-x border-border shadow-2xl" : ""}`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`flex flex-1 flex-col min-w-0 ${forceMobile ? "" : "lg:ml-56"}`}>
        <div className={forceMobile ? "" : "lg:hidden"}>
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ViewModeFloating />
    </div>
  );
}
