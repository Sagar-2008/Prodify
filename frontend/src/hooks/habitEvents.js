export const HABIT_UPDATED = "HABIT_UPDATED";

export const emitHabitUpdate = () => {
  window.dispatchEvent(new Event(HABIT_UPDATED));
};
