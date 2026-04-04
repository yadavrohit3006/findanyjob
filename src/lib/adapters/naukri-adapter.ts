import { Job, SearchParams } from "@/types";
import { BaseAdapter } from "./base-adapter";
import { MOCK_JOBS } from "./mock-data";

/**
 * Naukri Adapter
 *
 * Production path: Naukri.com does not have a public API.
 * Options when ready to go live:
 *  1. Naukri Affiliate Program (if eligible)
 *  2. RapidAPI wrappers for Naukri (paid, unofficial)
 *  3. Naukri Campus API (for campus hiring partnerships)
 *
 * For MVP: returns filtered mock data.
 */
export class NaukriAdapter extends BaseAdapter {
  name = "naukri" as const;

  async fetchJobs(params: SearchParams): Promise<Job[]> {
    await new Promise((r) => setTimeout(r, 100));

    return MOCK_JOBS.filter(
      (job) =>
        job.source === "naukri" &&
        this.matchesQuery(job, params.query) &&
        this.matchesLocation(job, params.location) &&
        this.matchesExperience(job, params.experience)
    );
  }
}
