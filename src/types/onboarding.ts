export type Nationality =
  | 'nigerian' | 'ghanaian' | 'kenyan' | 'ethiopian' | 'south_african'
  | 'cameroonian' | 'senegalese' | 'togolese' | 'beninese'
  | 'ugandan' | 'tanzanian'
  | 'american' | 'british' | 'canadian'
  | 'indian' | 'chinese'
  | 'other' | 'prefer_not';

export type Ethnicity =
  | 'african' | 'asian' | 'caucasian' | 'hispanic'
  | 'middle_eastern' | 'other' | 'prefer_not_to_say';

export type CycleRegularity = 'regular' | 'irregular';

export type WearableDevice =
  | 'apple_watch' | 'fitbit' | 'garmin' | 'oura_ring' | 'none';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Genotype = 'AA' | 'AS' | 'AC' | 'SS' | 'SC';

export interface OnboardingProfile {
  full_name:              string;
  date_of_birth:          string | null;
  age:                    number | null;
  nationality:            Nationality | '';
  ethnicity:              Ethnicity | '';
  gender:                 string | '';
  phone_number:           string;
  blood_group:            BloodGroup | '';
  genotype:               Genotype | '';
  height_cm:              number | null;
  weight_kg:              number | null;
  bmi:                    number | null;
  waist_cm:               number | null;
  hip_cm:                 number | null;
  acanthosis_nigricans:   string;
  has_skin_changes:       boolean | null;
  skin_tags:              string;
  scalp_hair_thinning:    string;
  cycle_length_days:      number | null;
  periods_per_year:       number | null;
  cycle_regularity:       string;
  last_period_date:       string | null;
  bleeding_intensity:     string;
  night_sweats:           string;
  fatigue_level:          string;
  family_history:         string[];
  high_blood_pressure:    string;
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
    address: string | null;
    facility_type: string | null;
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
