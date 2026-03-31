import { Plus } from "lucide-react";
import MuscleTagSelector from "./MuscleTagSelector";

export default function AddExerciseForm({
  newName,
  setNewName,
  newTags,
  setNewTags,
  allMuscles,
  onPreview
}) {
  const toggle = (tag) => {
    setNewTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 mb-4 ring-1 ring-orange-500/30">
      <p className="font-medium mb-3">Add New Exercise</p>
      <input
        value={newName}
        onChange={e => setNewName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && newTags.length && onPreview()}
        placeholder="Exercise name"
        className="w-full bg-gray-800 rounded-lg px-3 py-2 mb-3 text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500"
      />
      <MuscleTagSelector
        selectedTags={newTags}
        allMuscles={allMuscles}
        onToggleTag={toggle}
        collapsed={true}
      />
      <button
        onClick={onPreview}
        disabled={!newName.trim() || !newTags.length}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
        <Plus size={18} /> Preview &amp; Add
      </button>
    </div>
  );
}
