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
 * Ask Claude Haiku to infer experience from the job title + description.
 * Returns null only if genuinely indeterminate.
 */
/**
 * Extract the requirements/qualifications section from a job description.
 * Requirements are usually in the bottom half — we search for section headers.
 */
function extractRequirementsSection(description: string): string {
  const headers = [
    "requirements", "qualifications", "what you'll need", "what you need",
    "minimum qualifications", "basic qualifications", "you have", "you bring",
    "must have", "required skills", "experience required",
  ];
  const lower = description.toLowerCase();
  let earliest = -1;
  for (const h of headers) {
    const idx = lower.indexOf(h);
    if (idx !== -1 && (earliest === -1 || idx < earliest)) earliest = idx;
  }
  // Return from the section header to end, capped at 2000 chars
  if (earliest !== -1) return description.slice(earliest, earliest + 2000);
  // No header found — return last 2000 chars where requirements usually live
  return description.slice(-2000);
}

async function extractFromJob(
  title: string,
  description: string
): Promise<ExtractedExperience | null> {
  // Use requirements section + first 500 chars for context
  const context = description.slice(0, 500);
  const requirements = extractRequirementsSection(description);
  const snippet = `${context}\n\n...\n\n${requirements}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 64,
    messages: [
      {
        role: "user",
        content: `You are parsing a job posting to find the years of experience required.

Job title: ${title}
Job description (excerpt):
${snippet}

Instructions:
1. Look for explicit experience requirements (e.g. "5+ years", "3-5 years experience").
2. If none found, infer from the job title level:
   - "Intern" or "Trainee" → {"min": 0, "max": 1}
   - "Junior" or "Associate" or "Entry" → {"min": 0, "max": 2}
   - No level prefix (e.g. "Software Engineer") → {"min": 2, "max": 5}
   - "Senior" or "Sr." → {"min": 5, "max": 9}
   - "Staff" or "Lead" → {"min": 7, "max": 12}
   - "Principal" or "Architect" → {"min": 10, "max": 15}
   - "Manager" or "Director" → {"min": 6, "max": 12}
   - "VP" or "Head of" → {"min": 10, "max": 18}
3. Reply with ONLY a JSON object: {"min": <integer>, "max": <integer>}
4. Never reply with null — always make a best estimate.`,
      },
    ],
  });

  const raw = (message.content[0] as { text: string }).text.trim();

  try {
    // Strip any markdown code fences if Claude adds them
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (typeof parsed.min === "number" && typeof parsed.max === "number") {
      const min = Math.max(0, parsed.min);
      // Ensure a sensible range — if Claude collapses min==max (e.g. "2+ years" → 2,2),
      // expand max by 3 to reflect the open-ended "+" nature
      const max = parsed.max <= parsed.min ? parsed.min + 3 : parsed.max;
      return { min, max };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Enriches jobs that have unknown experience by inferring it via Claude Haiku.
 * Results are cached by job ID to avoid redundant API calls.
 *
 * Only runs when ANTHROPIC_API_KEY is set — skips silently otherwise.
 */
export async function enrichExperience(jobs: Job[]): Promise<Job[]> {
  if (!process.env.ANTHROPIC_API_KEY) return jobs;

  const unknownJobs = jobs.filter((j) => j.experienceUnknown);
  if (unknownJobs.length === 0) return jobs;

  // Run extractions in parallel (max 10 at a time to stay within rate limits)
  const BATCH_SIZE = 10;
  for (let i = 0; i < unknownJobs.length; i += BATCH_SIZE) {
    const batch = unknownJobs.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (job) => {
        if (experienceCache.has(job.id)) return; // already parsed this session
        try {
          const result = await extractFromJob(job.title, job.description);
          experienceCache.set(job.id, result);
        } catch (err) {
          console.error(`[ExperienceExtractor] Failed for ${job.id}:`, err);
          experienceCache.set(job.id, null);
        }
      })
    );
  }

  // Merge cached results back into jobs
  return jobs.map((job) => {
    if (!job.experienceUnknown) return job;
    const cached = experienceCache.get(job.id);
    if (!cached) return job; // Claude couldn't determine — keep "Exp. not specified"
    return {
      ...job,
      minExperience: cached.min,
      maxExperience: cached.max,
      experienceUnknown: false,
    };
  });
}
