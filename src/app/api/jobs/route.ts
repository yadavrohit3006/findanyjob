import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/job-service";
import { SearchParams } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const params: SearchParams = {
    query: searchParams.get("query") ?? "",
    location: searchParams.get("location") ?? "",
    experience: Number(searchParams.get("experience") ?? 0),
  };

  try {
    const jobs = await searchJobs(params);

    return NextResponse.json(
      { jobs, total: jobs.length },
      {
        headers: {
          // Cache at the CDN level for 2 minutes
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[/api/jobs] Error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
