"use client";

import { useState } from "react";
import { MapPin, Clock, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Building2 } from "lucide-react";
import { Job, JobSource } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "@/lib/utils";

interface JobCardProps {
  job: Job;
}

const SOURCE_LABELS: Record<JobSource, string> = {
  linkedin: "LinkedIn",
  naukri: "Naukri",
  instahyre: "Instahyre",
  indeed: "Indeed",
  glassdoor: "Glassdoor",
};

const WORK_MODE_LABELS = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

const WORK_MODE_COLORS = {
  remote: "bg-green-100 text-green-800 border-green-200",
  onsite: "bg-gray-100 text-gray-700 border-gray-200",
  hybrid: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export function JobCard({ job }: JobCardProps) {
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") ?? "[]") as string[];
    return savedJobs.includes(job.id);
  });

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") ?? "[]") as string[];
    const next = saved
      ? savedJobs.filter((id) => id !== job.id)
      : [...savedJobs, job.id];
    localStorage.setItem("savedJobs", JSON.stringify(next));
    setSaved(!saved);
  }

  const expLabel =
    job.minExperience === job.maxExperience
      ? `${job.minExperience} yr`
      : `${job.minExperience}–${job.maxExperience} yrs`;

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group">
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
          {job.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.logo}
              alt={job.company}
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Building2 className="h-6 w-6 text-gray-400" />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                {job.title}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
            </div>
            <button
              onClick={toggleSave}
              aria-label={saved ? "Unsave job" : "Save job"}
              className="flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {saved ? (
                <BookmarkCheck className="h-5 w-5 text-indigo-600" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              {expLabel}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(job.postedAt)}
            </span>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 5 && (
                <Badge variant="outline">+{job.skills.length - 5}</Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="source">{SOURCE_LABELS[job.source]}</Badge>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${WORK_MODE_COLORS[job.workMode]}`}
              >
                {WORK_MODE_LABELS[job.workMode]}
              </span>
              {job.salary && (
                <span className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                  {job.salary}
                </span>
              )}
            </div>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Apply <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
