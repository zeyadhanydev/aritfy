import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";
// Keep API traffic on the current origin, including isolated preview deployments.
export const client = hc<AppType>("");
