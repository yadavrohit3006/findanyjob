"use client";

import { useState, FormEvent } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { SearchParams } from "@/types";
import { Button } from "@/components/ui/Button";

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  defaultValues?: Partial<SearchParams>;
  compact?: boolean;
}

const EXPERIENCE_OPTIONS = [
  { label: "Any experience", value: 0 },
  { label: "Fresher (0–1 yr)", value: 1 },
  { label: "1–3 years", value: 2 },
  { label: "3–5 years", value: 4 },
  { label: "5–8 years", value: 6 },
  { label: "8–12 years", value: 9 },
  { label: "12+ years", value: 13 },
];

export function SearchBar({ onSearch, isLoading, defaultValues, compact }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValues?.query ?? "");
  const [location, setLocation] = useState(defaultValues?.location ?? "");
  const [experience, setExperience] = useState(defaultValues?.experience ?? 0);
  const [touched, setTouched] = useState(false);

  const queryEmpty = query.trim() === "";
  const showError = touched && queryEmpty;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (queryEmpty) {
      setTouched(true);
      return;
    }
    onSearch({ query, location, experience });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${compact ? "flex gap-2 flex-wrap" : "flex flex-col gap-3"}`}
    >
      {!compact && (
        <p className="text-gray-500 text-sm mb-1">
          Search across LinkedIn, Naukri, Instahyre &amp; more
        </p>
      )}

      <div className={`flex ${compact ? "flex-row gap-2 flex-1 flex-wrap" : "flex-col sm:flex-row gap-3"} ${showError ? "pb-5 sm:pb-0 sm:items-start" : ""}`}>
        {/* Job Title */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${showError ? "text-red-400" : "text-gray-400"}`} />
          <input
            type="text"
            placeholder="Job title, role, or skill"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setTouched(false); }}
            className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
              showError
                ? "border-red-400 focus:ring-red-400 placeholder-red-300"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
          />
          {showError && (
            <p className="absolute -bottom-5 left-0 text-xs text-red-500">
              Please enter a job title to search
            </p>
          )}
        </div>

        {/* Location */}
        <div className="relative flex-1 min-w-[160px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="City or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Experience */}
        <div className="relative flex-1 min-w-[160px]">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <select
            value={experience}
            onChange={(e) => setExperience(Number(e.target.value))}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" loading={isLoading} size={compact ? "md" : "lg"}>
          Search Jobs
        </Button>
      </div>
    </form>
  );
}
