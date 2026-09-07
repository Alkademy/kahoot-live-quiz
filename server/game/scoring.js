export function calculateScore(basePoints, remainingTime, duration) {
  if (remainingTime <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, remainingTime / duration));
  return Math.max(100, Math.round(basePoints * (0.5 + ratio * 0.5)));
}
