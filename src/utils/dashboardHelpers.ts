/**
 * Dashboard utility functions for consistent UI elements
 */

export type SeverityLevel = 'Minimal' | 'Mild' | 'Moderate' | 'Severe' | 'Extreme' | null | undefined;

/**
 * Get Tailwind color classes for severity levels
 */
export function getSeverityClasses(severity: SeverityLevel): {
  bg: string;
  text: string;
  icon: string;
} {
  const map: Record<string, { bg: string; text: string; icon: string }> = {
    Minimal: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
    Mild: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    Moderate: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' },
    Severe: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-600' },
    Extreme: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
  };

  return map[severity || ''] || { bg: 'bg-gray-50', text: 'text-gray-500', icon: 'text-gray-400' };
}

/**
 * Get severity label for display
 */
export function getSeverityLabel(severity: SeverityLevel): string {
  return severity || '—';
}

/**
 * Get HRV label based on RMSSD value
 */
export function getHrvLabel(rmssd: number): string {
  if (rmssd >= 50) return 'Normal';
  if (rmssd >= 40) return 'Slightly Reduced';
  if (rmssd >= 30) return 'Moderately Reduced';
  if (rmssd >= 20) return 'Low';
  if (rmssd >= 10) return 'Very Low';
  return 'Extremely Low';
}

/**
 * Get fatigue label based on VAS score
 */
export function getFatigueLabel(vas: number): string {
  if (vas < 3) return 'Low';
  if (vas < 6) return 'Moderate';
  return 'High';
}

/**
 * Get mood label based on score
 */
export function getMoodLabel(score: number): string {
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Neutral';
  if (score >= 3) return 'Mild';
  return 'Poor';
}

/**
 * Get risk severity label from score (0-1)
 */
export function getRiskSeverityLabel(score: number): string {
  if (score < 0.25) return 'Minimal';
  if (score < 0.5) return 'Mild';
  if (score < 0.75) return 'Moderate';
  if (score < 0.9) return 'Severe';
  return 'Extreme';
}
