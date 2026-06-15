import { createFileRoute } from "@tanstack/react-router";
import { fetchPSXPrices } from "@/lib/psx-prices";

export const Route = createFileRoute("/api/public/psx-prices")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const data = await fetchPSXPrices();
          return Response.json(data, {
            headers: { "Cache-Control": "no-store, max-age=0" },
          });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "PSX fetch failed" },
            { status: 502, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
