import { createFileRoute } from "@tanstack/react-router";
import { fetchKSE100Snapshot } from "@/lib/psx";

export const Route = createFileRoute("/api/public/kse100")({
  server: {
    handlers: {
      GET: async () => {
        const snapshot = await fetchKSE100Snapshot();
        return Response.json(snapshot, {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        });
      },
    },
  },
});