import { Job, SearchParams } from "@/types";
import { BaseAdapter } from "./base-adapter";
import { MOCK_JOBS } from "./mock-data";

/**
 * Indeed Adapter
 *
 * Production path: Indeed deprecated their public API.
 * Options when ready to go live:
 *  1. Indeed Publisher API (requires approval: https://www.indeed.com/publisher)
 *  2. Indeed Hiring Solutions partner program
 *
 * For MVP: returns filtered mock data.
 */
export class IndeedAdapter extends BaseAdapter {
  name = "indeed" as const;

  async fetchJobs(params: SearchParams): Promise<Job[]> {
    await new Promise((r) => setTimeout(r, 110));

    return MOCK_JOBS.filter(
      (job) =>
        job.source === "indeed" &&
        this.matchesQuery(job, params.query) &&
        this.matchesLocation(job, params.location) &&
        this.matchesExperience(job, params.experience)
    );
  }
}
