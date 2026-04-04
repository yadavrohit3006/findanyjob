import { Job, SearchParams } from "@/types";
import { BaseAdapter } from "./base-adapter";

interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  created: string; // ISO date
  salary_min?: number;
  salary_max?: number;
  contract_time?: string; // "full_time" | "part_time"
  contract_type?: string; // "permanent" | "contract"
  category: { label: string };
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

function mapJob(raw: AdzunaJob): Job {
  const salary =
    raw.salary_min || raw.salary_max
      ? `₹${raw.salary_min?.toLocaleString() ?? "?"} – ₹${raw.salary_max?.toLocaleString() ?? "?"} / year`
      : undefined;

  const jobType: Job["jobType"] =
    raw.contract_type === "contract"
      ? "contract"
      : raw.contract_time === "part_time"
      ? "part-time"
      : "full-time";

  const isRemote = raw.location.display_name.toLowerCase().includes("remote");

  return {
    id: `adzuna-${raw.id}`,
    title: raw.title,
    company: raw.company.display_name,
    location: raw.location.display_name,
    minExperience: 0,
    maxExperience: 10, // Adzuna doesn't expose experience; show as open
    source: "indeed", // closest visual match
    applyUrl: raw.redirect_url,
    postedAt: raw.created,
    description: raw.description,
    skills: [],
    salary,
    jobType,
    workMode: isRemote ? "remote" : "onsite",
  };
}

/**
 * Adzuna Adapter
 *
 * Free public API — no scraping, fully legal.
 * Covers India, UK, US, AU and 15+ countries.
 *
 * Setup:
 *  1. Register at https://developer.adzuna.com (free, instant)
 *  2. Copy your App ID and App Key
 *  3. Add to .env.local:
 *       ADZUNA_APP_ID=your_app_id
 *       ADZUNA_APP_KEY=your_app_key
 *
 * Docs: https://developer.adzuna.com/docs/search
 */
export class AdzunaAdapter extends BaseAdapter {
  name = "naukri" as const; // displayed under Naukri slot visually

  async fetchJobs(params: SearchParams): Promise<Job[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      console.warn("[AdzunaAdapter] ADZUNA_APP_ID / ADZUNA_APP_KEY not set — skipping.");
      return [];
    }

    const country = "in"; // India; change to "gb", "us", etc. as needed
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("results_per_page", "20");
    url.searchParams.set("what", params.query || "software engineer");
    if (params.location) url.searchParams.set("where", params.location);
    url.searchParams.set("content-type", "application/json");

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`[AdzunaAdapter] API error: ${res.status}`);
      return [];
    }

    const data: AdzunaResponse = await res.json();
    return (data.results ?? []).map(mapJob);
  }
}
