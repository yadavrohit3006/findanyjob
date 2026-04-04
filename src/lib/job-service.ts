import { Job, SearchParams, FilterState, SortOption } from "@/types";
import { adapters } from "./adapters";
import { getCached, setCached, buildCacheKey } from "./cache/search-cache";

/**
 * Fetches jobs from all adapters in parallel, with caching.
 */
export async function searchJobs(params: SearchParams): Promise<Job[]> {
  const cacheKey = buildCacheKey({
    query: params.query,
    location: params.location,
    experience: params.experience,
  });

  const cached = getCached(cacheKey);
  if (cached) return cached;

  // Fetch from all adapters in parallel; don't let one failure block others
  const results = await Promise.allSettled(
    adapters.map((adapter) => adapter.fetchJobs(params))
  );

  const jobs: Job[] = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  setCached(cacheKey, jobs);
  return jobs;
}

/**
 * Apply client-side filters to a job list.
 */
export function applyFilters(jobs: Job[], filters: FilterState): Job[] {
  return jobs.filter((job) => {
    if (filters.sources.length > 0 && !filters.sources.includes(job.source)) return false;
    if (filters.workModes.length > 0 && !filters.workModes.includes(job.workMode)) return false;
    if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(job.jobType)) return false;
    if (job.minExperience > filters.experienceMax) return false;
    if (job.maxExperience < filters.experienceMin) return false;
    return true;
  });
}

/**
 * Sort jobs by a given option.
 */
export function sortJobs(jobs: Job[], sort: SortOption): Job[] {
  const copy = [...jobs];
  if (sort === "latest") {
    copy.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }
  // "relevance" keeps the adapter-defined order (already sorted by match quality)
  return copy;
}
