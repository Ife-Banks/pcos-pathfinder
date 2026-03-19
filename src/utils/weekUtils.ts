export function getCurrentWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000
  );
  const weekNum = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNum}`;
}

export function markToolComplete(
  tool: 'phq4' | 'affect' | 'focus' | 'sleep'
): void {
  localStorage.setItem(
    `mshm_${tool}_completed_week`,
    getCurrentWeekKey()
  );
}

export function isToolCompleteThisWeek(
  tool: 'phq4' | 'affect' | 'focus' | 'sleep'
): boolean {
  const stored = localStorage.getItem(`mshm_${tool}_completed_week`);
  return stored === getCurrentWeekKey();
}

export function areAllToolsComplete(): boolean {
  return (
    isToolCompleteThisWeek('phq4') &&
    isToolCompleteThisWeek('affect') &&
    isToolCompleteThisWeek('focus') &&
    isToolCompleteThisWeek('sleep')
  );
}

export function getToolCompletionInfo(
  tool: 'phq4' | 'affect' | 'focus' | 'sleep'
): { completed: boolean; lastCompleted?: string } {
  const stored = localStorage.getItem(`mshm_${tool}_completed_week`);
  if (!stored) return { completed: false };
  
  const currentWeek = getCurrentWeekKey();
  if (stored === currentWeek) {
    return { completed: true };
  }
  
  const [year, weekPart] = stored.split('-W');
  const weekNum = parseInt(weekPart);
  return { completed: false, lastCompleted: `${weekNum} weeks ago` };
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getQuadrantFromValues(valence: number, arousal: number): string {
  if (valence >= 6 && arousal >= 6) return 'Happy-Energised';
  if (valence >= 6 && arousal <= 5) return 'Calm-Relaxed';
  if (valence <= 5 && arousal >= 6) return 'Anxious-Agitated';
  if (valence <= 5 && arousal <= 5) return 'Depressed-Fatigued';
  return 'Neutral';
}