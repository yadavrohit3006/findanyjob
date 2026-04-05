import { JobAdapter } from "@/types";

// ─── Mock adapters (always on, used as fallback when API keys not set) ───────
import { LinkedInAdapter } from "./linkedin-adapter";
import { NaukriAdapter } from "./naukri-adapter";
import { InstahyreAdapter } from "./instahyre-adapter";
import { IndeedAdapter } from "./indeed-adapter";

// ─── Real API adapters (activate by setting env vars) ────────────────────────
import { JSearchAdapter } from "./jsearch-adapter";     // RAPIDAPI_KEY
import { AdzunaAdapter } from "./adzuna-adapter";       // ADZUNA_APP_ID + ADZUNA_APP_KEY
import { RemotiveAdapter } from "./remotive-adapter";   // No key needed

const hasJSearch = !!process.env.RAPIDAPI_KEY;
const hasAdzuna = !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);

export const adapters: JobAdapter[] = [
  // JSearch — aggregates LinkedIn, Indeed, ZipRecruiter, Glassdoor etc.
  ...(hasJSearch ? [new JSearchAdapter()] : []),

  // Adzuna — free public API covering India + global
  ...(hasAdzuna ? [new AdzunaAdapter()] : []),

  // Remotive — always on, no key needed, remote jobs
  new RemotiveAdapter(),

  // Mock adapters intentionally removed — they produce fake apply links.
  // Add real adapters here as new API integrations become available.
];

export {
  LinkedInAdapter, NaukriAdapter, InstahyreAdapter, IndeedAdapter,
  JSearchAdapter, AdzunaAdapter, RemotiveAdapter,
};
