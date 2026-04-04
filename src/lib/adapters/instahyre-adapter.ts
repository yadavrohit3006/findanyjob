import { Job, SearchParams } from "@/types";
import { BaseAdapter } from "./base-adapter";
import { MOCK_JOBS } from "./mock-data";

/**
 * Instahyre Adapter
 *
 * Production path: Instahyre targets senior engineers via invite/referral.
 * Options when ready to go live:
 *  1. Reach out to Instahyre for partner API access
 *  2. Use their public job listing pages with agreed data sharing
 *
 * For MVP: returns filtered mock data.
 */
export class InstahyreAdapter extends BaseAdapter {
  name = "instahyre" as const;

  async fetchJobs(params: SearchParams): Promise<Job[]> {
    await new Promise((r) => setTimeout(r, 90));

    return MOCK_JOBS.filter(
      (job) =>
        job.source === "instahyre" &&
        this.matchesQuery(job, params.query) &&
        this.matchesLocation(job, params.location) &&
        this.matchesExperience(job, params.experience)
    );
  }
}
