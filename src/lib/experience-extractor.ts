import Anthropic from "@anthropic-ai/sdk";
import { Job } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory cache: job ID → parsed experience
// In production, replace with Redis to persist across serverless invocations
const experienceCache = new Map<string, { min: number; max: number } | null>();

interface ExtractedExperience {
  min: number;
  max: number;
}

/**
 * Ask Claude Haiku to extract the experience requirement from a job description.
 * Returns null if no experience requirement is found.
 */
async function extractFromDescription(
  description: string
): Promise<ExtractedExperience | null> {
  // Truncate to ~1500 chars — enough to find experience mentions, keeps cost low
  const snippet = description.slice(0, 1500);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 64,
    messages: [
      {
        role: "user",
        content: `Extract the years of experience required from this job description.
Reply with ONLY a JSON object like {"min": 2, "max": 5} using integers.
If no experience is mentioned, reply with null.
If only a minimum is mentioned (e.g. "5+ years"), set max to min + 3.
If it says "fresher" or "0 years", reply with {"min": 0, "max": 1}.

Job description:
${snippet}`,
      },
    ],
  });

  const raw = (message.content[0] as { text: string }).text.trim();

  if (raw === "null") return null;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.min === "number" && typeof parsed.max === "number") {
      return { min: parsed.min, max: parsed.max };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Enriches jobs that have unknown experience by extracting it from their
 * description using Claude Haiku. Results are cached by job ID.
 *
 * Only runs when ANTHROPIC_API_KEY is set — skips silently otherwise.
 */
export async function enrichExperience(jobs: Job[]): Promise<Job[]> {
  if (!process.env.ANTHROPIC_API_KEY) return jobs;

  const unknownJobs = jobs.filter((j) => j.experienceUnknown);
  if (unknownJobs.length === 0) return jobs;

  // Run extractions in parallel (max 10 at a time to avoid rate limits)
  const BATCH_SIZE = 10;
  for (let i = 0; i < unknownJobs.length; i += BATCH_SIZE) {
    const batch = unknownJobs.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (job) => {
        if (experienceCache.has(job.id)) return; // already parsed
        try {
          const result = await extractFromDescription(job.description);
          experienceCache.set(job.id, result);
        } catch (err) {
          console.error(`[ExperienceExtractor] Failed for ${job.id}:`, err);
          experienceCache.set(job.id, null); // don't retry on error
        }
      })
    );
  }

  // Apply cached results back to jobs
  return jobs.map((job) => {
    if (!job.experienceUnknown) return job;
    const cached = experienceCache.get(job.id);
    if (!cached) return job; // still unknown
    return {
      ...job,
      minExperience: cached.min,
      maxExperience: cached.max,
      experienceUnknown: false,
    };
  });
}
