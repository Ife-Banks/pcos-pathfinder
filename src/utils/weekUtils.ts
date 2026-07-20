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
  tool: 'phq4' | 'affect' | 'focus' | 'sleep' | 'mfg'
): void {
  localStorage.setItem(
    `mshm_${tool}_completed_week`,
    getCurrentWeekKey()
  );
}

export function isToolCompleteThisWeek(
  tool: 'phq4' | 'affect' | 'focus' | 'sleep' | 'mfg'
): boolean {
  const stored = localStorage.getItem(`mshm_${tool}_completed_week`);
  return stored === getCurrentWeekKey();
}

export function areAllToolsComplete(): boolean {
  return (
    isToolCompleteThisWeek('phq4') &&
    isToolCompleteThisWeek('affect') &&
    isToolCompleteThisWeek('focus') &&
    isToolCompleteThisWeek('sleep') &&
    isToolCompleteThisWeek('mfg')
  );
}

export function getToolCompletionInfo(
  tool: 'phq4' | 'affect' | 'focus' | 'sleep' | 'mfg'
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

export function markToolCompleteToday(
  tool: 'phq4' | 'affect' | 'focus' | 'sleep'
): void {
  localStorage.setItem(
    `mshm_${tool}_completed_today`,
    getTodayDateString()
  );
}

export function isToolCompleteToday(
  tool: 'phq4' | 'affect' | 'focus' | 'sleep'
): boolean {
  const stored = localStorage.getItem(`mshm_${tool}_completed_today`);
  return stored === getTodayDateString();
}

export function getQuadrantFromValues(valence: number, arousal: number): string {
  if (valence >= 6 && arousal >= 6) return 'Happy-Energised';
  if (valence >= 6 && arousal <= 5) return 'Calm-Relaxed';
  if (valence <= 5 && arousal >= 6) return 'Anxious-Agitated';
  if (valence <= 5 && arousal <= 5) return 'Depressed-Fatigued';
  return 'Neutral';
}

export function recordToolLog(tool: 'affect' | 'focus'): void {
  localStorage.setItem(
    `mshm_${tool}_last_log`,
    Date.now().toString()
  );
}

export function getTimeSinceLastLog(tool: 'affect' | 'focus'): number {
  const stored = localStorage.getItem(`mshm_${tool}_last_log`);
  if (!stored) return Infinity;
  return Date.now() - parseInt(stored);
}

export function canLogNow(tool: 'affect' | 'focus', intervalHours: number): boolean {
  const timeSinceLastLog = getTimeSinceLastLog(tool);
  const intervalMs = intervalHours * 60 * 60 * 1000;
  return timeSinceLastLog >= intervalMs;
}

export function getTimeUntilNextLog(tool: 'affect' | 'focus', intervalHours: number): number {
  const timeSinceLastLog = getTimeSinceLastLog(tool);
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const remaining = intervalMs - timeSinceLastLog;
  return remaining > 0 ? remaining : 0;
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Ready';
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export const TOOL_FREQUENCIES = {
  affect: 1,   // hourly
  focus: 4,    // 4-hourly
} as const;