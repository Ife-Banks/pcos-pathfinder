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
  gender:                 string | '';
  phone_number:           string;
  height_cm:              number | null;
  weight_kg:              number | null;
  bmi:                    number | null;
  has_skin_changes:       boolean | null;
  cycle_length_days:      number | null;
  periods_per_year:       number | null;
  cycle_regularity:       CycleRegularity | '';
  selected_wearable:      WearableDevice | '';
  rppg_baseline_captured: boolean;
  rppg_captured_at:       string | null;
  state:                  string | null;
  lga:                    string | null;
  registered_hcc:         string | null;
  registered_hcc_detail:  {
    id: string;
    name: string;
    code: string | null;
    state: string;
    lga: string;
  } | null;
  escalation_fmc_detail:  {
    id: string;
    name: string;
    code: string | null;
    state: string;
  } | null;
  created_at:             string;
  updated_at:             string;
}
