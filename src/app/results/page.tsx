"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/jobs/SearchBar";
import { JobList } from "@/components/jobs/JobList";
import { FiltersPanel } from "@/components/jobs/FiltersPanel";
import { useJobs } from "@/hooks/useJobs";
import { SearchParams } from "@/types";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filteredJobs, isLoading, error, hasSearched, filters, sort, search, updateFilters, updateSort, resetFilters } =
    useJobs();

  // On mount, run search from URL params
  useEffect(() => {
    const query = searchParams.get("query") ?? "";
    const location = searchParams.get("location") ?? "";
    const experience = Number(searchParams.get("experience") ?? 0);
    search({ query, location, experience });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  function handleSearch(params: SearchParams) {
    const qs = new URLSearchParams({
      query: params.query,
      location: params.location,
      experience: String(params.experience),
    });
    router.push(`/results?${qs}`, { scroll: false });
    search(params);
  }

  const defaultValues: Partial<SearchParams> = {
    query: searchParams.get("query") ?? "",
    location: searchParams.get("location") ?? "",
    experience: Number(searchParams.get("experience") ?? 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Compact search bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          defaultValues={defaultValues}
          compact
        />
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FiltersPanel
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            totalResults={filteredJobs.length}
          />
        </div>

        {/* Job list */}
        <div className="flex-1 min-w-0">
          <JobList
            jobs={filteredJobs}
            isLoading={isLoading}
            error={error}
            hasSearched={hasSearched}
            sort={sort}
            onSortChange={updateSort}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
