"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/jobs/SearchBar";
import { SearchParams } from "@/types";

const POPULAR_SEARCHES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Frontend Developer",
  "DevOps Engineer",
  "Machine Learning Engineer",
];

export default function HomePage() {
  const router = useRouter();

  function handleSearch(params: SearchParams) {
    const qs = new URLSearchParams({
      query: params.query,
      location: params.location,
      experience: String(params.experience),
    });
    router.push(`/results?${qs}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      {/* Hero */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Find Your Next Role,{" "}
          <span className="text-indigo-600">All in One Place</span>
        </h1>
        <p className="text-lg text-gray-500">
          Search across LinkedIn, Naukri, Instahyre, Indeed and more — instantly.
        </p>
      </div>

      {/* Search card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Popular searches */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
        <span className="text-sm text-gray-500 mr-1">Popular:</span>
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            onClick={() => handleSearch({ query: term, location: "", experience: 0 })}
            className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>

      {/* Platform logos */}
      <div className="mt-14 text-center">
        <p className="text-xs text-gray-400 mb-4 uppercase tracking-widest">
          Aggregating jobs from
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {["LinkedIn", "Naukri", "Instahyre", "Indeed"].map((platform) => (
            <span
              key={platform}
              className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
