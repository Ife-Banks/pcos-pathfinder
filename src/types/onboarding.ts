export type Ethnicity =
  | 'white' | 'black' | 'hispanic' | 'asian'
  | 'south_asian' | 'middle_eastern' | 'mixed' | 'prefer_not';

export type CycleRegularity = 'regular' | 'irregular';

export type WearableDevice =
  | 'apple_watch' | 'fitbit' | 'garmin' | 'oura_ring' | 'none';

export interface OnboardingProfile {
  full_name:              string;
  age:                    number | null;
  ethnicity:              Ethnicity | '';
  height_cm:              number | null;
  weight_kg:              number | null;
  bmi:                    number | null;   // READ-ONLY, never send this
  has_skin_changes:       boolean | null;
  cycle_length_days:      number | null;
  periods_per_year:       number | null;
  cycle_regularity:       CycleRegularity | '';
  selected_wearable:      WearableDevice | '';
  rppg_baseline_captured: boolean;
  rppg_captured_at:       string | null;
  created_at:             string;
  updated_at:             string;
}
