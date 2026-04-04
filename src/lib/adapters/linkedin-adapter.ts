import { Job, SearchParams } from "@/types";
import { BaseAdapter } from "./base-adapter";
import { MOCK_JOBS } from "./mock-data";

/**
 * LinkedIn Adapter
 *
 * Production path: LinkedIn does not provide a public job search API.
 * Options when ready to go live:
 *  1. LinkedIn Jobs RSS feed (limited, public): https://www.linkedin.com/jobs/search/?keywords=...&location=...
 *  2. Partner API (requires LinkedIn approval)
 *  3. RapidAPI third-party wrapper (paid)
 *
 * For MVP: returns filtered mock data.
 */
export class LinkedInAdapter extends BaseAdapter {
  name = "linkedin" as const;

  async fetchJobs(params: SearchParams): Promise<Job[]> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 80));

    return MOCK_JOBS.filter(
      (job) =>
        job.source === "linkedin" &&
        this.matchesQuery(job, params.query) &&
        this.matchesLocation(job, params.location) &&
        this.matchesExperience(job, params.experience)
    );
  }
}
