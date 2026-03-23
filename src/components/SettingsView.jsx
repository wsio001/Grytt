import { useState } from "react";
import { Plus, X, Minus, Trash2 } from "lucide-react";

export default function SettingsView({ goals, setGoals, setExercises, muscleCats, setMuscleCats }) {
  const [newMuscle, setNewMuscle] = useState("");
  const [newMuscleCat, setNewMuscleCat] = useState(Object.keys(muscleCats)[0]);
  const [showAdd, setShowAdd] = useState(false);

  const upd = (muscle, v) => setGoals(p => ({ ...p, [muscle]: Math.max(0, v) }));
  const add = () => {
    const t = newMuscle.trim();
    if (!t || t in goals) return;
    setMuscleCats(prev => ({ ...prev, [newMuscleCat]: [...(prev[newMuscleCat] || []), t] }));
    setGoals(p => ({ ...p, [t]: 0 }));
    setNewMuscle(""); setShowAdd(false);
  };
  const del = muscle => {
    setGoals(p => { const n = { ...p }; delete n[muscle]; return n; });
    setMuscleCats(prev => { const next = {}; Object.entries(prev).forEach(([cat, ms]) => { next[cat] = ms.filter(m => m !== muscle); }); return next; });
    setExercises(p => p.map(e => ({ ...e, tags: e.tags.filter(t => t !== muscle) })));
  };

  const MuscleRow = ({ muscle }) => (
    <div className="bg-gray-900 rounded-xl px-3 py-2.5 flex items-center justify-between">
      <span className="text-sm font-medium">{muscle}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => upd(muscle, (goals[muscle] || 0) - 1)} className="p-1 bg-gray-800 rounded hover:bg-gray-700"><Minus size={13} /></button>
        <span className="w-6 text-center text-orange-400 font-bold text-sm">{goals[muscle] || 0}</span>
        <button onClick={() => upd(muscle, (goals[muscle] || 0) + 1)} className="p-1 bg-gray-800 rounded hover:bg-gray-700"><Plus size={13} /></button>
        <button onClick={() => del(muscle)} className="p-1 text-red-400 rounded hover:bg-red-500/20 ml-0.5"><Trash2 size={13} /></button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Muscle Groups</h2>
        <button onClick={() => setShowAdd(!showAdd)} className={`p-2 rounded-lg transition-colors ${showAdd ? "bg-red-500/20 text-red-400" : "bg-orange-500 text-white hover:bg-orange-600"}`}>
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>
      {showAdd && (
        <div className="bg-gray-900 rounded-xl p-4 mb-4 ring-1 ring-orange-500/30 space-y-3">
          <p className="text-sm text-gray-400">Add a new muscle to an existing group and set its weekly target.</p>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Main Muscle Group</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(muscleCats).map(cat => (
                <button key={cat} onClick={() => setNewMuscleCat(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${newMuscleCat === cat ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Muscle Name</p>
            <input value={newMuscle} onChange={e => setNewMuscle(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
              placeholder={`e.g. Inner ${newMuscleCat}`}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500" />
          </div>
          <button onClick={add} disabled={!newMuscle.trim() || newMuscle.trim() in goals}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Add to {newMuscleCat}
          </button>
        </div>
      )}
      <div className="space-y-4">
        {Object.entries(muscleCats).map(([cat, muscles]) => {
          const active = muscles.filter(m => m in goals);
          if (!active.length) return null;
          return (
            <div key={cat}>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">{cat}</p>
              <div className="grid grid-cols-2 gap-2">{active.map(muscle => <MuscleRow key={muscle} muscle={muscle} />)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}