"use client";

import { useState, useCallback, useRef } from "react";
import { Job, SearchParams, FilterState, SortOption } from "@/types";
import { applyFilters, sortJobs } from "@/lib/job-service";

interface UseJobsState {
  allJobs: Job[];
  filteredJobs: Job[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  sources: [],
  workModes: [],
  jobTypes: [],
  experienceMin: 0,
  experienceMax: 20,
};

export function useJobs() {
  const [state, setState] = useState<UseJobsState>({
    allJobs: [],
    filteredJobs: [],
    isLoading: false,
    error: null,
    hasSearched: false,
  });
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("relevance");
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (params: SearchParams) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const qs = new URLSearchParams({
          query: params.query,
          location: params.location,
          experience: String(params.experience),
        });

        const res = await fetch(`/api/jobs?${qs}`, {
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Search failed. Please try again.");

        const data = await res.json();
        const sorted = sortJobs(data.jobs, sort);
        const filtered = applyFilters(sorted, filters);

        setState({
          allJobs: data.jobs,
          filteredJobs: filtered,
          isLoading: false,
          error: null,
          hasSearched: true,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    },
    [filters, sort]
  );

  const updateFilters = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      setState((s) => ({
        ...s,
        filteredJobs: applyFilters(sortJobs(s.allJobs, sort), newFilters),
      }));
    },
    [sort]
  );

  const updateSort = useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      setState((s) => ({
        ...s,
        filteredJobs: applyFilters(sortJobs(s.allJobs, newSort), filters),
      }));
    },
    [filters]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setState((s) => ({
      ...s,
      filteredJobs: sortJobs(s.allJobs, sort),
    }));
  }, [sort]);

  return {
    ...state,
    filters,
    sort,
    search,
    updateFilters,
    updateSort,
    resetFilters,
  };
}
