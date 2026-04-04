import { Job, JobAdapter, SearchParams } from "@/types";

/**
 * Abstract base adapter — all platform adapters extend this.
 * Override `fetchJobs` to integrate a real API or RSS feed.
 */
export abstract class BaseAdapter implements JobAdapter {
  abstract name: import("@/types").JobSource;

  abstract fetchJobs(params: SearchParams): Promise<Job[]>;

  /** Utility: fuzzy match for title/skills search */
  protected matchesQuery(job: Job, query: string): boolean {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.skills.some((s) => s.toLowerCase().includes(q))
    );
  }

  /** Utility: match location */
  protected matchesLocation(job: Job, location: string): boolean {
    if (!location.trim()) return true;
    const loc = location.toLowerCase();
    return (
      job.location.toLowerCase().includes(loc) ||
      (loc === "remote" && job.workMode === "remote")
    );
  }

  /** Utility: match experience */
  protected matchesExperience(job: Job, experience: number): boolean {
    if (experience === 0) return true;
    return job.minExperience <= experience && job.maxExperience >= experience;
  }
}
