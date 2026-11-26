"use client";

import { useState } from "react";

const PRESETS = [
  { label: "Python",       keywords: "python developer backend" },
  { label: "Java",         keywords: "java spring boot developer" },
  { label: "React / FE",   keywords: "react nextjs frontend developer" },
  { label: "Data Science", keywords: "data scientist machine learning python" },
  { label: "Full Stack",   keywords: "fullstack developer python javascript" },
  { label: "DevOps",       keywords: "devops engineer kubernetes docker aws" },
  { label: "Fresher IT",   keywords: "fresher software engineer entry level" },
  { label: "AI / ML",      keywords: "machine learning engineer artificial intelligence" },
];

const EXPERIENCE_LEVELS = [
  { value: "any",     label: "Any Level" },
  { value: "fresher", label: "Fresher (0–1 yr)" },
  { value: "junior",  label: "Junior (1–3 yrs)" },
  { value: "mid",     label: "Mid (3–5 yrs)" },
];

const JOB_TYPES = [
  { value: "any",    label: "Any Type" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export default function SearchPanel({ onSearch, loading }) {
  const [filters, setFilters] = useState({
    keywords: "python java developer",
    location: "India",
    maxDaysOld: 7,
    minSalaryLPA: 0,
    resultsCount: 10,
    experienceLevel: "any",
    jobType: "any",
  });

  const [advanced, setAdvanced] = useState(false);
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
      <h2 className="font-semibold text-white text-sm flex items-center gap-2">
        🎛️ Search Filters
      </h2>

      {/* Quick presets */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Quick Presets</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => set("keywords", p.keywords)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filters.keywords === p.keywords
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Keywords</label>
        <input
          value={filters.keywords}
          onChange={(e) => set("keywords", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && onSearch(filters)}
          placeholder="e.g. python django developer"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Location</label>
        <select
          value={filters.location}
          onChange={(e) => set("location", e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="India">🇮🇳 All India</option>
          <option value="Bangalore">📍 Bangalore</option>
          <option value="Mumbai">📍 Mumbai</option>
          <option value="Hyderabad">📍 Hyderabad</option>
          <option value="Chennai">📍 Chennai</option>
          <option value="Delhi">📍 Delhi / NCR</option>
          <option value="Pune">📍 Pune</option>
          <option value="Kolkata">📍 Kolkata</option>
          <option value="Ahmedabad">📍 Ahmedabad</option>
          <option value="Remote">🌐 Remote (India)</option>
        </select>
      </div>

      {/* Experience + Job Type (2 col) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Experience</label>
          <select
            value={filters.experienceLevel}
            onChange={(e) => set("experienceLevel", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Job Type</label>
          <select
            value={filters.jobType}
            onChange={(e) => set("jobType", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setAdvanced(!advanced)}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
      >
        {advanced ? "▲" : "▼"} Advanced filters
      </button>

      {advanced && (
        <div className="space-y-4 pt-1">
          {/* Posted within */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Posted within — <span className="text-blue-400">{filters.maxDaysOld} days</span>
            </label>
            <input
              type="range" min={1} max={30} value={filters.maxDaysOld}
              onChange={(e) => set("maxDaysOld", parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-700 mt-0.5">
              <span>1d</span><span>30d</span>
            </div>
          </div>

          {/* Min salary */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Min Salary — <span className="text-blue-400">
                {filters.minSalaryLPA === 0 ? "Any" : `₹${filters.minSalaryLPA} LPA`}
              </span>
            </label>
            <input
              type="range" min={0} max={30} step={1} value={filters.minSalaryLPA}
              onChange={(e) => set("minSalaryLPA", parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-700 mt-0.5">
              <span>Any</span><span>₹30 LPA</span>
            </div>
          </div>

          {/* Results count */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Results — <span className="text-blue-400">{filters.resultsCount} jobs</span>
            </label>
            <input
              type="range" min={5} max={20} step={5} value={filters.resultsCount}
              onChange={(e) => set("resultsCount", parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-700 mt-0.5">
              <span>5</span><span>20</span>
            </div>
          </div>
        </div>
      )}

      {/* Search button */}
      <button
        onClick={() => onSearch(filters)}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching & Verifying…
          </>
        ) : "🔍 Find Jobs"}
      </button>

      <p className="text-xs text-gray-700 text-center leading-relaxed">
        AI verifies each URL is live<br />then generates a WhatsApp-ready post
      </p>
    </div>
  );
}
