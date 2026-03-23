export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const INITIAL_MUSCLE_CATS = {
  Chest: ["Chest"],
  Back: ["Traps", "Upper Back", "Lower Back"],
  Shoulders: ["Front Delt", "Mid Delt", "Rear Delt"],
  Arms: ["Bicep", "Tricep", "Forearm"],
  Legs: ["Quad", "Hamstring", "Glute", "Calf"],
  Core: ["Abs"],
};

export const ALL_INITIAL_MUSCLES = Object.values(INITIAL_MUSCLE_CATS).flat();
export const DEFAULT_GOALS = Object.fromEntries(ALL_INITIAL_MUSCLES.map(m => [m, 0]));

export const todayDay = () => DAYS[new Date().getDay()];
export const todayFullName = () => DAYS_FULL[new Date().getDay()];
export const todayStr = () => new Date().toISOString().split("T")[0];
export const emptyPlan = () => Object.fromEntries(DAYS.map(d => [d, []]));
export const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);