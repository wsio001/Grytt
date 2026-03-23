import { X, Plus } from "lucide-react";

export default function ExerciseModal({ exercise, onClose, onConfirmAdd, isNewExercise }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.75)" }}>
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-6" style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-bold text-white pr-4">{exercise.name}</h2>
          <button onClick={onClose} className="p-1.5 bg-gray-800 rounded-lg text-gray-400 hover:text-white flex-shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">Muscle Groups</p>
          <div className="flex flex-wrap gap-2">
            {exercise.tags.map(t => (
              <span key={t} className="text-sm bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">Instructions</p>
          {exercise.generating ? (
            <div className="flex items-center gap-3 text-gray-500 py-4">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-sm">Generating instructions…</span>
            </div>
          ) : exercise.instructions ? (
            <div className="space-y-3">
              {exercise.instructions.split("\n").filter(l => l.trim()).map((line, i) => {
                const match = line.match(/^(\d+)\.\s*(.*)/s);
                if (match) return (
                  <div key={i} className="flex gap-3">
                    <span className="text-orange-400 font-bold text-xs whitespace-nowrap mt-0.5">Step {match[1]}.</span>
                    <span className="text-sm text-gray-300 leading-relaxed">{match[2]}</span>
                  </div>
                );
                return <p key={i} className="text-sm text-orange-300 italic">{line}</p>;
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">No instructions available.</p>
          )}
        </div>
        {isNewExercise && !exercise.generating && (
          <button onClick={onConfirmAdd} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Plus size={18} /> Add Exercise
          </button>
        )}
      </div>
    </div>
  );
}