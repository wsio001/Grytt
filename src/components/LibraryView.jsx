import { useState } from "react";
import { Plus, X, Edit2, Check, Trash2 } from "lucide-react";
import ExerciseModal from "./ExerciseModal";
import { uid } from "../constants";

export default function LibraryView({ exercises, setExercises, goals, muscleCats, setPlan }) {
  const [newName, setNewName] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState([]);
  const [catTab, setCatTab] = useState(Object.keys(muscleCats)[0]);
  const [modal, setModal] = useState(null);
  const [isNewModal, setIsNewModal] = useState(false);

  const allMuscles = Object.keys(goals);
  const toggle = (tag, set) => set(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);
  const getCatEx = cat => { const muscles = muscleCats[cat] || []; return exercises.filter(ex => ex.tags.some(t => muscles.includes(t))); };

  const generateInstructions = async (name, tags) => {
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `Generate clear, concise workout instructions for "${name}" targeting: ${tags.join(", ")}.\nFormat as numbered steps (1. 2. 3. etc). Cover: starting position, movement execution, breathing, and common cues. Keep it practical and under 200 words. Plain text only, no markdown.` }]
        })
      });
      const data = await resp.json();
      return data.content?.[0]?.text || "Could not generate instructions.";
    } catch {
      return "Could not generate instructions. Please try again.";
    }
  };

  const openNewPreview = async () => {
    if (!newName.trim() || !newTags.length) return;
    const draft = { name: newName.trim(), tags: newTags, instructions: "", generating: true };
    setIsNewModal(true); setModal(draft); setShowAdd(false);
    const instructions = await generateInstructions(draft.name, draft.tags);
    setModal(prev => prev ? { ...prev, instructions, generating: false } : null);
  };

  const confirmAdd = () => {
    if (!modal) return;
    setExercises(p => [...p, { id: uid(), name: modal.name, tags: modal.tags, instructions: modal.instructions }]);
    setNewName(""); setNewTags([]);
    setModal(null); setIsNewModal(false);
  };

  const openDetail = ex => {
    setIsNewModal(false);
    setModal({ id: ex.id, name: ex.name, tags: ex.tags, instructions: ex.instructions || "", generating: false });
  };

  const save = () => {
    if (!editName.trim()) return;
    setExercises(p => p.map(e => e.id === editId ? { ...e, name: editName, tags: editTags } : e));
    setEditId(null);
  };

  const del = id => {
    setExercises(p => p.filter(e => e.id !== id));
    setPlan(p => { const o = {}; Object.keys(p).forEach(day => { o[day] = p[day].map(row => row.filter(pe => pe.exerciseId !== id)).filter(r => r.length > 0); }); return o; });
  };

  return (
    <div>
      {modal && (
        <ExerciseModal exercise={modal} isNewExercise={isNewModal}
          onClose={() => { setModal(null); setIsNewModal(false); }}
          onConfirmAdd={confirmAdd} />
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Exercise Library</h2>
        <button onClick={() => setShowAdd(!showAdd)} className={`p-2 rounded-lg transition-colors ${showAdd ? "bg-red-500/20 text-red-400" : "bg-orange-500 text-white hover:bg-orange-600"}`}>
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>
      {showAdd && (
        <div className="bg-gray-900 rounded-xl p-4 mb-4 ring-1 ring-orange-500/30">
          <p className="font-medium mb-3">Add New Exercise</p>
          <input value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && newTags.length && openNewPreview()}
            placeholder="Exercise name"
            className="w-full bg-gray-800 rounded-lg px-3 py-2 mb-3 text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-orange-500" />
          <p className="text-sm text-gray-500 mb-2">Muscle Groups</p>
          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto mb-3">
            {allMuscles.map(m => <button key={m} onClick={() => toggle(m, setNewTags)}
              className={`text-xs px-2 py-1 rounded-full transition-colors ${newTags.includes(m) ? "bg-orange-500 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>{m}</button>)}
          </div>
          <button onClick={openNewPreview} disabled={!newName.trim() || !newTags.length}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Plus size={18} /> Preview &amp; Add
          </button>
        </div>
      )}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
        {Object.keys(muscleCats).map(cat => (
          <button key={cat} onClick={() => setCatTab(cat)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0 transition-colors ${catTab === cat ? "bg-orange-500 text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {getCatEx(catTab).map(ex => (
          <div key={ex.id} className="bg-gray-900 rounded-xl p-4">
            {editId === ex.id ? (
              <div>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-3 py-2 mb-3 text-white outline-none focus:ring-1 focus:ring-orange-500" />
                <p className="text-sm text-gray-500 mb-2">Muscle Groups</p>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto mb-3">
                  {allMuscles.map(m => <button key={m} onClick={() => toggle(m, setEditTags)}
                    className={`text-xs px-2 py-1 rounded-full ${editTags.includes(m) ? "bg-orange-500 text-white" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>{m}</button>)}
                </div>
                <div className="flex gap-2">
                  <button onClick={save} className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 py-2 rounded-lg flex items-center justify-center gap-1"><Check size={16} />Save</button>
                  <button onClick={() => setEditId(null)} className="flex-1 bg-gray-800 text-gray-400 hover:bg-gray-700 py-2 rounded-lg flex items-center justify-center gap-1"><X size={16} />Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button className="flex-1 min-w-0 text-left" onClick={() => openDetail(ex)}>
                  <p className="font-medium text-white">{ex.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ex.tags.map(t => <span key={t} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                </button>
                <div className="flex gap-2 ml-2 flex-shrink-0">
                  <button onClick={() => { setEditId(ex.id); setEditName(ex.name); setEditTags([...ex.tags]); }} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"><Edit2 size={16} /></button>
                  <button onClick={() => del(ex.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!getCatEx(catTab).length && (
          <div className="text-center text-gray-600 py-10 border-2 border-dashed border-gray-800 rounded-xl">No exercises in {catTab}</div>
        )}
      </div>
    </div>
  );
}