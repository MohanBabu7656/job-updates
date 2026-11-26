"use client";

import { useState } from "react";

const STATUS = {
  pending:   { label: "Queued",          bg: "bg-gray-800",       dot: "bg-gray-500",                 text: "text-gray-400"   },
  verifying: { label: "Checking URL…",   bg: "bg-yellow-900/20",  dot: "bg-yellow-400 animate-pulse", text: "text-yellow-400" },
  framing:   { label: "AI Formatting…",  bg: "bg-purple-900/20",  dot: "bg-purple-400 animate-pulse", text: "text-purple-400" },
  active:    { label: "✅ Verified Live", bg: "bg-green-900/20",   dot: "bg-green-400",                text: "text-green-400"  },
  dead:      { label: "🚫 Inactive",     bg: "bg-red-900/20",     dot: "bg-red-500",                  text: "text-red-400"    },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function salaryLabel(min, max) {
  if (min && max) return `₹${Math.round(min / 100000)}–${Math.round(max / 100000)} LPA`;
  if (min)        return `₹${Math.round(min / 100000)}+ LPA`;
  return null;
}

function saveToHistory(job) {
  try {
    const history = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
    const entry = {
      id: job.id,
      title: job.title,
      company: job.company,
      postedAt: new Date().toISOString(),
      post: job.formattedPost,
    };
    // avoid duplicates
    const updated = [entry, ...history.filter((h) => h.id !== job.id)].slice(0, 50);
    localStorage.setItem("posted_jobs", JSON.stringify(updated));
  } catch {
    // localStorage not available (SSR guard)
  }
}

export default function JobCard({ job }) {
  const [copied, setCopied]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [posted, setPosted]     = useState(false);

  const cfg       = STATUS[job.status] || STATUS.pending;
  const isLoading = ["pending", "verifying", "framing"].includes(job.status);
  const salary    = salaryLabel(job.salary_min, job.salary_max);

  const copy = async () => {
    if (!job.formattedPost) return;
    await navigator.clipboard.writeText(job.formattedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const markPosted = () => {
    saveToHistory(job);
    setPosted(true);
  };

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${
      job.status === "active"
        ? "border-gray-700 hover:border-gray-600 shadow-sm"
        : job.status === "dead"
        ? "border-gray-800/40 opacity-60"
        : "border-gray-800"
    } ${posted ? "ring-1 ring-green-700/50" : ""}`}>

      {/* ── Card Header ── */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Status badge + time */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
              {job.created && (
                <span className="text-xs text-gray-600">{timeAgo(job.created)}</span>
              )}
              {posted && (
                <span className="text-xs text-green-600 bg-green-900/20 px-2 py-0.5 rounded-full">
                  📤 Marked Posted
                </span>
              )}
            </div>

            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{job.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {job.company} · {job.location}
            </p>
          </div>

          {/* Salary badge */}
          {salary && (
            <span className="text-xs font-semibold text-green-400 bg-green-900/20 px-2 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
              {salary}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mt-3 space-y-1.5 animate-pulse">
            <div className="h-2.5 bg-gray-800 rounded w-2/3" />
            <div className="h-2.5 bg-gray-800 rounded w-1/2" />
          </div>
        )}

        {/* Skills + experience */}
        {job.status === "active" && job.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <span key={s} className="text-xs bg-blue-900/30 text-blue-300 border border-blue-800/40 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
            {job.experience && job.experience !== "Not specified" && (
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                💼 {job.experience}
              </span>
            )}
          </div>
        )}

        {/* Dead reason */}
        {job.status === "dead" && job.verifyReason && (
          <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {job.verifyReason}
          </p>
        )}
      </div>

      {/* ── Action bar (active jobs only) ── */}
      {job.status === "active" && (
        <div className="border-t border-gray-800 px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <a
            href={job.redirect_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            🔗 View Job ↗
          </a>

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
            >
              {expanded ? "▲ Hide" : "👁 Preview Post"}
            </button>
            <button
              onClick={copy}
              className="text-xs bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors font-medium"
            >
              {copied ? "✅ Copied!" : "📋 Copy Post"}
            </button>
            {!posted && (
              <button
                onClick={markPosted}
                className="text-xs bg-green-800 hover:bg-green-700 text-green-200 px-2.5 py-1 rounded-lg transition-colors"
                title="Mark as posted to WhatsApp"
              >
                📤 Mark Posted
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Post preview ── */}
      {expanded && job.formattedPost && (
        <div className="border-t border-gray-800 bg-black/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">📱 WhatsApp Post Preview</span>
            <button onClick={copy} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed bg-gray-900 rounded-lg p-3 border border-gray-800 overflow-x-auto max-h-96 overflow-y-auto">
            {job.formattedPost}
          </pre>
        </div>
      )}
    </div>
  );
}
