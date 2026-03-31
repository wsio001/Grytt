import { Plus, X } from "lucide-react";

export default function LibraryHeader({ showAdd, onToggleAdd }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Exercise Library</h2>
      <button
        onClick={onToggleAdd}
        className={`p-2 rounded-lg transition-colors ${
          showAdd
            ? "bg-red-500/20 text-red-400"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}>
        {showAdd ? <X size={20} /> : <Plus size={20} />}
      </button>
    </div>
  );
}
