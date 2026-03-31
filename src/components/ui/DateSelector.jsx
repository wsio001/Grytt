import { Check, Edit2 } from "lucide-react";
import { DAYS } from "../../constants";

export default function DateSelector({
  activeDay,
  setActiveDay,
  dayNames,
  editingName,
  setEditingName,
  nameDraft,
  setNameDraft,
  confirmName
}) {
  return (
    <div className="flex gap-1 mb-4">
      {DAYS.map(day => (
        <button
          key={day}
          onClick={() => setActiveDay(day)}
          className={`flex-1 py-1.5 text-center rounded-lg text-sm font-medium transition-colors ${
            activeDay === day
              ? "bg-orange-500 text-white"
              : "bg-gray-900 text-gray-400 hover:bg-gray-800"
          }`}>
          <div>{day}</div>
          <div className={`text-xs truncate mt-0.5 ${activeDay === day ? "text-orange-200" : "text-gray-600"}`}>
            {dayNames[day] || "Rest"}
          </div>
        </button>
      ))}
    </div>
  );
}
