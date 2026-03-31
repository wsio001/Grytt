import { Edit2, Check, X, Trash2 } from "lucide-react";
import MuscleTagSelector from "./MuscleTagSelector";

export default function ExerciseCard({
  exercise,
  isEditing,
  editName,
  setEditName,
  editTags,
  allMuscles,
  toggleTag,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onOpenDetail
}) {
  return (
    <div className="bg-gray-900 rounded-xl p-4">
      {isEditing ? (
        <div>
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="w-full bg-gray-800 rounded-lg px-3 py-2 mb-3 text-white outline-none focus:ring-1 focus:ring-orange-500"
          />
          <MuscleTagSelector
            selectedTags={editTags}
            allMuscles={allMuscles}
            onToggleTag={toggleTag}
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2 rounded-lg flex items-center justify-center gap-1">
              <Check size={16} />
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-800 text-gray-400 hover:bg-gray-700 py-2 rounded-lg flex items-center justify-center gap-1">
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button className="flex-1 min-w-0 text-left" onClick={onOpenDetail}>
            <p className="font-medium text-white">{exercise.name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {exercise.tags.map(t => (
                <span
                  key={t}
                  className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </button>
          <div className="flex gap-2 ml-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
