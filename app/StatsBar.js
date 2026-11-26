export default function StatsBar({ total, active, dead, pending, query }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-4">
      <div className="min-w-0">
        <p className="text-xs text-gray-600">Search query</p>
        <p className="text-sm font-medium text-white truncate max-w-[180px]">"{query}"</p>
      </div>
      <div className="ml-auto flex items-center gap-5 flex-wrap">
        <Stat label="Found" value={total} color="text-gray-300" />
        <Stat label="✅ Active" value={active} color="text-green-400" />
        <Stat label="⏳ Processing" value={pending} color="text-yellow-400" />
        <Stat label="🚫 Dead" value={dead} color="text-red-400" />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-0.5 whitespace-nowrap">{label}</p>
    </div>
  );
}
