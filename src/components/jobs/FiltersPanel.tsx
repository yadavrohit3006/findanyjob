"use client";

import { FilterState, JobSource, WorkMode, JobType } from "@/types";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface FiltersPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

const SOURCES: { label: string; value: JobSource }[] = [
  { label: "LinkedIn", value: "linkedin" },
  { label: "Indeed", value: "indeed" },
  { label: "ZipRecruiter", value: "ziprecruiter" },
  { label: "Naukri", value: "naukri" },
  { label: "Instahyre", value: "instahyre" },
  { label: "Glassdoor", value: "glassdoor" },
  { label: "Monster", value: "monster" },
  { label: "Ladders", value: "ladders" },
  { label: "Other", value: "other" },
];

const WORK_MODES: { label: string; value: WorkMode }[] = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];

const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  selected: T[];
  onChange: (val: T[]) => void;
}) {
  function toggle(value: T) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function FiltersPanel({ filters, onChange, onReset, totalResults }: FiltersPanelProps) {
  const hasActiveFilters =
    filters.sources.length > 0 ||
    filters.workModes.length > 0 ||
    filters.jobTypes.length > 0 ||
    filters.experienceMin > 0 ||
    filters.experienceMax < 20;

  return (
    <aside className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 sticky top-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs flex items-center gap-1">
            <X className="h-3 w-3" /> Clear all
          </Button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">{totalResults}</span> jobs found
      </p>

      <CheckboxGroup
        label="Platform"
        options={SOURCES}
        selected={filters.sources}
        onChange={(sources) => onChange({ ...filters, sources })}
      />

      <div className="border-t border-gray-100" />

      <CheckboxGroup
        label="Work Mode"
        options={WORK_MODES}
        selected={filters.workModes}
        onChange={(workModes) => onChange({ ...filters, workModes })}
      />

      <div className="border-t border-gray-100" />

      <CheckboxGroup
        label="Job Type"
        options={JOB_TYPES}
        selected={filters.jobTypes}
        onChange={(jobTypes) => onChange({ ...filters, jobTypes })}
      />

      <div className="border-t border-gray-100" />

      {/* Experience range */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Experience (years)
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={filters.experienceMax}
            value={filters.experienceMin}
            onChange={(e) =>
              onChange({ ...filters, experienceMin: Number(e.target.value) })
            }
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="number"
            min={filters.experienceMin}
            max={30}
            value={filters.experienceMax}
            onChange={(e) =>
              onChange({ ...filters, experienceMax: Number(e.target.value) })
            }
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </aside>
  );
}
