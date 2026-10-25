export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export interface MatchResult {
  isExact: boolean;
  isClose: boolean;
  normalizedGuess: string;
  normalizedTarget: string;
}

export function evaluateGuess(guess: string, targetWord: string): MatchResult {
  const normalizedGuess = normalizeText(guess);
  const normalizedTarget = normalizeText(targetWord);

  if (!normalizedGuess || !normalizedTarget) {
    return { isExact: false, isClose: false, normalizedGuess, normalizedTarget };
  }

  if (normalizedGuess === normalizedTarget) {
    return { isExact: true, isClose: false, normalizedGuess, normalizedTarget };
  }

  // Close match if edit distance is 1 and target length >= 5
  const dist = levenshteinDistance(normalizedGuess, normalizedTarget);
  const isClose = dist === 1 && normalizedTarget.length >= 5;

  return { isExact: false, isClose, normalizedGuess, normalizedTarget };
}
