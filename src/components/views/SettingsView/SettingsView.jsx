import { useState } from "react";
import SettingsHeader from "../../ui/SettingsHeader";
import AddMuscleForm from "../../ui/AddMuscleForm";
import MuscleCategorySection from "../../ui/MuscleCategorySection";
import styles from "./SettingsView.module.css";

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

  return (
    <div>
      <SettingsHeader showAdd={showAdd} onToggleAdd={() => setShowAdd(!showAdd)} />

      {showAdd && (
        <AddMuscleForm
          newMuscle={newMuscle}
          setNewMuscle={setNewMuscle}
          newMuscleCat={newMuscleCat}
          setNewMuscleCat={setNewMuscleCat}
          muscleCats={muscleCats}
          goals={goals}
          onAdd={add}
        />
      )}

      <div className={styles.categoryContainer}>
        {Object.entries(muscleCats).map(([cat, muscles]) => (
          <MuscleCategorySection
            key={cat}
            category={cat}
            muscles={muscles}
            goals={goals}
            onUpdateGoal={upd}
            onDelete={del}
          />
        ))}
      </div>
    </div>
  );
}