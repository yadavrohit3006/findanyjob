import { Job, SearchParams } from "@/types";
import { BaseAdapter } from "./base-adapter";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  category: string;
  tags: string[];
  job_type: string; // "full_time" | "contract" | "part_time" | "internship"
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

function mapJobType(type: string): Job["jobType"] {
  switch (type) {
    case "contract": return "contract";
    case "part_time": return "part-time";
    case "internship": return "internship";
    default: return "full-time";
  }
}

function mapJob(raw: RemotiveJob): Job {
  return {
    id: `remotive-${raw.id}`,
    title: raw.title,
    company: raw.company_name,
    location: raw.candidate_required_location || "Remote",
    minExperience: 0,
    maxExperience: 10,
    source: "instahyre", // visual slot
    applyUrl: raw.url,
    postedAt: raw.publication_date,
    description: raw.description,
    skills: raw.tags ?? [],
    salary: raw.salary || undefined,
    jobType: mapJobType(raw.job_type),
    workMode: "remote",
    logo: raw.company_logo || undefined,
  };
}

/**
 * Remotive Adapter
 *
 * 100% free, no API key needed. Remote jobs only.
 *
 * Docs: https://remotive.com/api/remote-jobs
 */
export class RemotiveAdapter extends BaseAdapter {
  name = "instahyre" as const;

  async fetchJobs(params: SearchParams): Promise<Job[]> {
    const url = new URL("https://remotive.com/api/remote-jobs");
    if (params.query) url.searchParams.set("search", params.query);
    url.searchParams.set("limit", "20");

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`[RemotiveAdapter] API error: ${res.status}`);
      return [];
    }

    const data: RemotiveResponse = await res.json();
    return (data.jobs ?? [])
      .map(mapJob)
      .filter((job) => this.matchesLocation(job, params.location));
  }
}
