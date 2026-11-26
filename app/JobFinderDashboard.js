"use client";

import { useState } from "react";
import SearchPanel from "./SearchPanel";
import JobCard from "./JobCard";
import StatsBar from "./StatsBar";
import HistoryPanel from "./HistoryPanel";

export default function JobFinderDashboard() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searchMeta, setMeta]     = useState(null);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("search"); // "search" | "history"

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);
    setJobs([]);
    setMeta(null);
    setActiveTab("search");

    try {
      // 1️⃣ Fetch from Adzuna
      const searchRes = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });
      const { jobs: rawJobs, total, error: searchErr } = await searchRes.json();

      if (searchErr) throw new Error(searchErr);
      if (!rawJobs?.length) {
        setError("No jobs found. Try different keywords or filters.");
        setLoading(false);
        return;
      }

      setMeta({ total, query: filters.keywords });

      // 2️⃣ Render all as "pending" immediately
      setJobs(rawJobs.map((j) => ({
        ...j, status: "pending", isActive: false,
        verifyReason: "", skills: [], experience: "", formattedPost: "", verifiedAt: "",
      })));

      // 3️⃣ Verify + AI-frame in batches of 3 (parallel within batch)
      for (let i = 0; i < rawJobs.length; i += 3) {
        const batch = rawJobs.slice(i, i + 3);

        setJobs((prev) =>
          prev.map((j) => batch.find((b) => b.id === j.id) ? { ...j, status: "verifying" } : j)
        );

        await Promise.all(batch.map(async (job) => {
          try {
            setJobs((prev) =>
              prev.map((j) => j.id === job.id ? { ...j, status: "framing" } : j)
            );

            const res = await fetch("/api/jobs/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ job }),
            });
            const verified = await res.json();

            setJobs((prev) =>
              prev.map((j) =>
                j.id === job.id
                  ? { ...j, ...verified, status: verified.isActive ? "active" : "dead" }
                  : j
              )
            );
          } catch {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === job.id ? { ...j, status: "dead", verifyReason: "Verification failed" } : j
              )
            );
          }
        }));
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Check API credentials.");
    } finally {
      setLoading(false);
    }
  };

  const activeJobs  = jobs.filter((j) => j.status === "active");
  const deadJobs    = jobs.filter((j) => j.status === "dead");
  const pendingJobs = jobs.filter((j) => ["pending","verifying","framing"].includes(j.status));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* ── Header ── */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white select-none shrink-0">
            SS
          </div>
          <div>
            <h1 className="font-bold text-white leading-none text-sm">Stack School</h1>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Job Finder · AI Dashboard</p>
          </div>

          {/* Tabs */}
          <div className="ml-auto flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("search")}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${
                activeTab === "search"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🔍 Search
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${
                activeTab === "history"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📋 Posted History
            </button>
          </div>

          <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-full hidden md:inline shrink-0">
            🤖 NVIDIA NIM + Adzuna
          </span>
        </div>
      </header>

      {/* ── History Tab ── */}
      {activeTab === "history" && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <HistoryPanel />
        </div>
      )}

      {/* ── Search Tab ── */}
      {activeTab === "search" && (
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <SearchPanel onSearch={handleSearch} loading={loading} />
          </aside>

          {/* Results */}
          <main>
            {(jobs.length > 0 || searchMeta) && (
              <StatsBar
                total={searchMeta?.total || 0}
                active={activeJobs.length}
                dead={deadJobs.length}
                pending={pendingJobs.length}
                query={searchMeta?.query || ""}
              />
            )}

            {error && (
              <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm mb-4 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-medium">Search failed</p>
                  <p className="text-red-400 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {!loading && jobs.length === 0 && !error && (
              <div className="text-center py-24">
                <div className="text-7xl mb-4">🔍</div>
                <p className="text-lg font-medium text-gray-400">Configure filters and search</p>
                <p className="text-sm mt-2 text-gray-600 max-w-xs mx-auto leading-relaxed">
                  AI verifies each URL is live, extracts skills, then generates a copy-ready WhatsApp post
                </p>
              </div>
            )}

            <div className="space-y-3">
              {/* Active jobs first */}
              {activeJobs.map((j) => <JobCard key={j.id} job={j} />)}
              {/* Still processing */}
              {pendingJobs.map((j) => <JobCard key={j.id} job={j} />)}
              {/* Dead — collapsed by default */}
              {deadJobs.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-400 py-2 select-none flex items-center gap-2">
                    <span>🚫</span>
                    <span>{deadJobs.length} inactive / expired job{deadJobs.length > 1 ? "s" : ""} — click to expand</span>
                  </summary>
                  <div className="space-y-3 mt-2 opacity-50 pointer-events-none">
                    {deadJobs.map((j) => <JobCard key={j.id} job={j} />)}
                  </div>
                </details>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
