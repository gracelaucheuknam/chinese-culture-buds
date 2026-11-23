/**
 * Unlock modes — default free_all for Beta / Dec 2026 launch.
 * 【待團隊確認】見 SPEC 8.2
 *
 * - free_all: everything open
 * - trial_survey: first N activities per theme free; rest need survey unlock
 * - paid: reserved UI only — show「敬請期待」, no payment
 */

export type AccessMode = 'free_all' | 'trial_survey' | 'paid';

export const accessConfig = {
  mode: 'free_all' as AccessMode,
  /** Used when mode === 'trial_survey': first N activities per theme are free. */
  trialFreeActivitiesPerTheme: 1,
} as const;

export function isActivityLocked(
  activityIndex: number,
  surveyUnlocked: boolean,
  mode: AccessMode = accessConfig.mode,
): boolean {
  if (mode === 'free_all') return false;
  if (mode === 'paid') {
    // Soft lock preview: first activity free, rest「敬請期待」
    return activityIndex >= accessConfig.trialFreeActivitiesPerTheme;
  }
  // trial_survey
  if (surveyUnlocked) return false;
  return activityIndex >= accessConfig.trialFreeActivitiesPerTheme;
}
