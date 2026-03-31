export default function MuscleCarousel({ muscleCats, catTab, setCatTab }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
      {Object.keys(muscleCats).map(cat => (
        <button
          key={cat}
          onClick={() => setCatTab(cat)}
          className={`px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0 transition-colors ${
            catTab === cat
              ? "bg-orange-500 text-white"
              : "bg-gray-900 text-gray-400 hover:bg-gray-800"
          }`}>
          {cat}
        </button>
      ))}
    </div>
  );
}
