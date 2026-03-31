export default function MuscleCounterCard({ category, muscles, vol, goals }) {
  return (
    <div className="bg-gray-800 rounded-lg p-2">
      <p className="text-xs font-semibold text-white mb-2 text-center">{category}</p>
      <div className="space-y-1">
        {muscles.filter(m => m in goals).map(muscle => {
          const curr = vol[muscle] || 0;
          const tgt = goals[muscle] || 0;
          const done = tgt > 0 && curr >= tgt;
          return (
            <div
              key={muscle}
              className={`text-xs px-1 py-0.5 rounded text-center leading-tight ${
                done
                  ? "bg-green-500/20 text-green-400"
                  : curr > 0
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-gray-700 text-gray-500"
              }`}>
              <div className="truncate">{muscle}</div>
              <div className="font-semibold">{curr}{tgt > 0 ? `/${tgt}` : "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
