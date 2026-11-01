export function normalizeTimerDuration(value, maximum) {
  return Math.max(1, Math.min(maximum, Math.round(Number(value) || 1)));
}

export function readTimerDuration(value, fallback, maximum) {
  const saved = Number(value);
  return Number.isInteger(saved) && saved >= 1 && saved <= maximum ? saved : fallback;
}
