import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function MuscleTagSelector({ selectedTags, allMuscles, onToggleTag, collapsed = false }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const availableMuscles = allMuscles.filter(m => !selectedTags.includes(m));
  const hasNoTags = selectedTags.length === 0;

  // If collapsed mode and no tags selected, show single "Add Tags" button
  if (collapsed && hasNoTags) {
    return (
      <div className="relative mb-3">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-sm bg-gray-700 text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          <Plus size={16} />
          Add Tags
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute top-full left-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 z-20 max-h-48 overflow-y-auto min-w-[200px]">
              {availableMuscles.map(muscle => (
                <button
                  key={muscle}
                  onClick={() => {
                    onToggleTag(muscle);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-700 text-white transition-colors">
                  {muscle}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <p className="text-sm text-gray-500 mb-2">Muscle Groups</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {/* Selected tags as removable pills */}
        {selectedTags.map(tag => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded-full hover:bg-orange-600 transition-colors">
            {tag}
            <X size={12} />
          </button>
        ))}

        {/* Add button */}
        {availableMuscles.length > 0 && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full hover:bg-gray-600 transition-colors">
            <Plus size={12} />
            Add
          </button>
        )}
      </div>

      {/* Dropdown menu */}
      {showDropdown && availableMuscles.length > 0 && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 z-20 max-h-48 overflow-y-auto min-w-[200px]">
            {availableMuscles.map(muscle => (
              <button
                key={muscle}
                onClick={() => {
                  onToggleTag(muscle);
                  setShowDropdown(false);
                }}
                className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-700 text-white transition-colors">
                {muscle}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
