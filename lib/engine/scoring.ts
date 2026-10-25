export interface GuesserScoreInput {
  timeRemaining: number;
  drawTime: number;
  isFirstGuesser: boolean;
}

export function calculateGuesserPoints(input: GuesserScoreInput): number {
  const { timeRemaining, drawTime, isFirstGuesser } = input;
  if (drawTime <= 0 || timeRemaining <= 0) return 0;

  const ratio = Math.max(0, Math.min(1, timeRemaining / drawTime));
  const timePoints = Math.round(400 * ratio);
  const basePoints = 100 + timePoints;
  const firstBonus = isFirstGuesser ? 50 : 0;

  return basePoints + firstBonus;
}

export function calculateDrawerPoints(guesserPointsList: number[]): number {
  if (!guesserPointsList || guesserPointsList.length === 0) return 0;

  const sum = guesserPointsList.reduce((acc, pts) => acc + pts, 0);
  const avg = sum / guesserPointsList.length;
  const rawPoints = Math.round(avg * 0.5 * guesserPointsList.length);

  // Capped at 250 per round
  return Math.min(250, rawPoints);
}
