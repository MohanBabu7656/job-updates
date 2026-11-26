"use client";

import { useState, useEffect } from "react";

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [copied, setCopied]   = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, []);

  const copy = async (post, id) => {
    await navigator.clipboard.writeText(post);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const remove = (id) => {
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem("posted_jobs", JSON.stringify(updated));
    setHistory(updated);
  };

  const clearAll = () => {
    localStorage.removeItem("posted_jobs");
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-lg font-medium text-gray-400">No posts saved yet</p>
        <p className="text-sm text-gray-600 mt-1">
          Click "📤 Mark Posted" on any job card to save it here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">
          📋 Posted History <span className="text-gray-500 font-normal text-sm">({history.length} jobs)</span>
        </h2>
        <button
          onClick={clearAll}
          className="text-xs text-red-400 hover:text-red-300 border border-red-800/50 px-2.5 py-1 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-medium text-white text-sm">{entry.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{entry.company}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Posted: {new Date(entry.postedAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => copy(entry.post, entry.id)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copied === entry.id ? "✅ Copied!" : "📋 Copy"}
                </button>
                <button
                  onClick={() => remove(entry.id)}
                  className="text-xs text-gray-500 hover:text-red-400 border border-gray-700 px-2 py-1 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans leading-relaxed bg-gray-950 rounded-lg p-3 border border-gray-800 max-h-40 overflow-y-auto">
              {entry.post}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
