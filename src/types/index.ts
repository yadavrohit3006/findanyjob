export type JobSource =
  | "linkedin"
  | "naukri"
  | "instahyre"
  | "indeed"
  | "glassdoor"
  | "ziprecruiter"
  | "monster"
  | "ladders"
  | "builtin"
  | "other";

export type JobType = "full-time" | "part-time" | "contract" | "internship" | "freelance";

export type WorkMode = "remote" | "onsite" | "hybrid";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  minExperience: number; // years
  maxExperience: number; // years
  experienceUnknown?: boolean; // true when the source didn't provide experience data
  source: JobSource;
  sourceLabel?: string; // exact publisher name from the source API (e.g. "ZipRecruiter", "Cisco Careers")
  applyUrl: string;
  postedAt: string; // ISO date string
  description: string;
  skills: string[];
  salary?: string;
  jobType: JobType;
  workMode: WorkMode;
  logo?: string;
}

export interface SearchParams {
  query: string;
  location: string;
  experience: number; // years
}

export interface FilterState {
  sources: JobSource[];
  workModes: WorkMode[];
  jobTypes: JobType[];
  experienceMin: number;
  experienceMax: number;
}

export type SortOption = "latest" | "relevance";

export interface SearchResult {
  jobs: Job[];
  total: number;
  page: number;
  perPage: number;
}

export interface JobAdapter {
  name: JobSource;
  fetchJobs(params: SearchParams): Promise<Job[]>;
}
