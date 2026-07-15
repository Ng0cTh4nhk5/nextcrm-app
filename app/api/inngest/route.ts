import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { syncExchangeRates } from "@/inngest/functions/ecb/sync-exchange-rates";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncExchangeRates],
});
