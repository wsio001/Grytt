import { Plus } from "lucide-react";

export default function DropZone({ active, highlight, label, onOver, onLeave, onDrop, className = "" }) {
  if (!active) return null;
  return (
    <div
      className={`rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${highlight ? "border-orange-500 bg-orange-500/10" : "border-gray-700"} ${className}`}
      onDragOver={e => { e.preventDefault(); onOver?.(); }}
      onDragLeave={onLeave}
      onDrop={e => { e.preventDefault(); onDrop?.(); }}
    >
      <span className={`text-xs flex items-center gap-1 ${highlight ? "text-orange-400" : "text-gray-600"}`}>
        <Plus size={11} />{label}
      </span>
    </div>
  );
}