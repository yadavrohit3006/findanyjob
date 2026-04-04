import { Job, SearchParams, JobSource } from "@/types";
import { BaseAdapter } from "./base-adapter";

// Exact JSearch API response shape (verified against live API)
interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  employer_website: string | null;
  job_publisher: string;           // e.g. "Cisco Careers", "Indeed", "LinkedIn"
  job_employment_type: string;     // e.g. "Full-time" (human string)
  job_employment_types: string[];  // e.g. ["FULLTIME"] (machine string — use this)
  job_apply_link: string;
  job_description: string;
  job_is_remote: boolean;
  job_posted_at_datetime_utc: string; // ISO 8601
  job_posted_at_timestamp: number;
  job_city: string | null;
  job_country: string | null;       // 2-letter code e.g. "IN", "US"
  job_required_skills: string[] | null;
  job_required_experience: {
    no_experience_required: boolean;
    required_experience_in_months: number | null;
    minimum_years_of_experience: number | null;
    experience_mentioned: boolean;
  } | null;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_salary_period: string | null;
}

interface JSearchResponse {
  status: string;
  data: JSearchJob[];
}

// Publisher → our JobSource. JSearch often uses company career site names,
// so we check for known platform keywords and fall back to "indeed".
function mapPublisher(publisher: string): JobSource {
  const p = publisher.toLowerCase();
  if (p.includes("linkedin")) return "linkedin";
  if (p.includes("naukri") || p.includes("apna")) return "naukri";
  if (p.includes("glassdoor")) return "glassdoor";
  if (p.includes("instahyre")) return "instahyre";
  if (p.includes("indeed")) return "indeed";
  // Company career sites (e.g. "Cisco Careers") → show as LinkedIn
  return "linkedin";
}

function mapEmploymentType(types: string[]): Job["jobType"] {
  if (types.includes("PARTTIME")) return "part-time";
  if (types.includes("CONTRACTOR")) return "contract";
  if (types.includes("INTERN")) return "internship";
  return "full-time";
}

function mapExperience(exp: JSearchJob["job_required_experience"]): { min: number; max: number } {
  if (!exp || exp.no_experience_required) return { min: 0, max: 2 };
  const years = exp.minimum_years_of_experience
    ?? Math.round((exp.required_experience_in_months ?? 0) / 12);
  return { min: years, max: years + 3 };
}

function formatSalary(job: JSearchJob): string | undefined {
  if (!job.job_min_salary && !job.job_max_salary) return undefined;
  const currency = job.job_salary_currency ?? "USD";
  const period = job.job_salary_period?.toLowerCase() ?? "year";
  const fmt = (n: number) => n.toLocaleString();
  if (job.job_min_salary && job.job_max_salary) {
    return `${currency} ${fmt(job.job_min_salary)} – ${fmt(job.job_max_salary)} / ${period}`;
  }
  const single = job.job_min_salary ?? job.job_max_salary!;
  return `${currency} ${fmt(single)} / ${period}`;
}

function mapJob(raw: JSearchJob): Job {
  const { min, max } = mapExperience(raw.job_required_experience);

  const location = raw.job_is_remote
    ? "Remote"
    : [raw.job_city, raw.job_country].filter(Boolean).join(", ");

  return {
    id: `jsearch-${raw.job_id}`,
    title: raw.job_title,
    company: raw.employer_name,
    location,
    minExperience: min,
    maxExperience: max,
    source: mapPublisher(raw.job_publisher),
    applyUrl: raw.job_apply_link,
    postedAt: raw.job_posted_at_datetime_utc,
    description: raw.job_description,
    skills: raw.job_required_skills ?? [],
    salary: formatSalary(raw),
    jobType: mapEmploymentType(raw.job_employment_types ?? []),
    workMode: raw.job_is_remote ? "remote" : "onsite",
    logo: raw.employer_logo ?? undefined,
  };
}

/**
 * JSearch Adapter (RapidAPI)
 *
 * Aggregates jobs from LinkedIn, Indeed, Glassdoor, Naukri, company career
 * sites and more — all from one API.
 *
 * Host:  jsearch.p.rapidapi.com
 * Docs:  https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 * Key:   set RAPIDAPI_KEY in .env.local
 */
export class JSearchAdapter extends BaseAdapter {
  name = "linkedin" as const;

  async fetchJobs(params: SearchParams): Promise<Job[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      console.warn("[JSearchAdapter] RAPIDAPI_KEY not set — skipping.");
      return [];
    }

    // Build natural-language query: "software engineer in Bengaluru"
    const query = params.location
      ? `${params.query || "jobs"} in ${params.location}`
      : params.query || "software engineer jobs";

    const url = new URL("https://jsearch.p.rapidapi.com/search");
    url.searchParams.set("query", query);
    url.searchParams.set("page", "1");
    url.searchParams.set("num_pages", "3");   // 10 per page → 30 results
    url.searchParams.set("date_posted", "all");

    const res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // cache 5 min at Next.js level
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[JSearchAdapter] ${res.status}: ${body}`);
      return [];
    }

    const data: JSearchResponse = await res.json();

    if (data.status !== "OK") {
      console.error("[JSearchAdapter] Non-OK status:", data.status);
      return [];
    }

    return (data.data ?? [])
      .map(mapJob)
      .filter((job) => this.matchesExperience(job, params.experience));
  }
}
