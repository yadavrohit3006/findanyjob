"use client";

import { Job, SortOption } from "@/types";
import { JobCard } from "./JobCard";
import { ArrowUpDown, Loader2 } from "lucide-react";

interface JobListProps {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function JobList({ jobs, isLoading, error, hasSearched, sort, onSortChange }: JobListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm">Searching across all platforms…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-red-600 font-medium">{error}</p>
        <p className="text-sm text-gray-500">Please try a different search or refresh the page.</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <div className="text-5xl">🔍</div>
        <p className="text-base font-medium text-gray-500">Search for your next role</p>
        <p className="text-sm text-center max-w-xs">
          Enter a job title, location, and experience to find matching opportunities.
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <div className="text-5xl">😕</div>
        <p className="text-base font-medium text-gray-600">No jobs found</p>
        <p className="text-sm text-center max-w-xs">
          Try a different title, location, or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{jobs.length}</span> jobs found
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="relevance">Relevance</option>
            <option value="latest">Latest</option>
          </select>
        </div>
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
