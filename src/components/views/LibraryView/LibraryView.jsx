import { useState } from "react";
import ExerciseModal from "../../ExerciseModal";
import MuscleCarousel from "../../ui/MuscleCarousel";
import ExerciseCard from "../../ui/ExerciseCard";
import AddExerciseForm from "../../ui/AddExerciseForm";
import LibraryHeader from "../../ui/LibraryHeader";
import EmptyState from "../../ui/EmptyState";
import { uid } from "../../../constants";
import styles from "./LibraryView.module.css";

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
      const resp = await fetch("/api/generate-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tags })
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error("API error:", data);
        return "Could not generate instructions. Please try again.";
      }
      return data.instructions || "Could not generate instructions.";
    } catch (error) {
      console.error("Failed to generate instructions:", error);
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
      <LibraryHeader showAdd={showAdd} onToggleAdd={() => setShowAdd(!showAdd)} />
      {showAdd && (
        <AddExerciseForm
          newName={newName}
          setNewName={setNewName}
          newTags={newTags}
          setNewTags={setNewTags}
          allMuscles={allMuscles}
          onPreview={openNewPreview}
        />
      )}
      <MuscleCarousel muscleCats={muscleCats} catTab={catTab} setCatTab={setCatTab} />
      <div className={styles.exerciseList}>
        {getCatEx(catTab).map(ex => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            isEditing={editId === ex.id}
            editName={editName}
            setEditName={setEditName}
            editTags={editTags}
            allMuscles={allMuscles}
            toggleTag={(m) => toggle(m, setEditTags)}
            onSave={save}
            onCancel={() => setEditId(null)}
            onEdit={() => { setEditId(ex.id); setEditName(ex.name); setEditTags([...ex.tags]); }}
            onDelete={() => del(ex.id)}
            onOpenDetail={() => openDetail(ex)}
          />
        ))}
        {!getCatEx(catTab).length && (
          <EmptyState message={`No exercises in ${catTab}`} />
        )}
      </div>
    </div>
  );
}