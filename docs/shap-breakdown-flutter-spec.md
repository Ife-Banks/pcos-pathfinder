# Score Breakdown (SHAP) — Flutter Implementation Spec

Specification for implementing the **Score Breakdown / SHAP feature contributions** screen in the Flutter mobile app, matching the web implementation (`src/pages/SHAPExplanationDetail.tsx`) so the app works against the same AI-MSHM backend.

---

## 1. Overview

The screen shows which physiological inputs pushed a patient's risk score **up or down**, one card per driver. It is a heuristic, SHAP-style explainability view — not a raw SHAP model output. The backend stores a list of "contribution drivers" alongside every comprehensive prediction, and this screen renders them.

```
Open screen
  → pick prediction id (stored id, else latest comprehensive)
  → GET /predictions/{id}/features/
  → render drivers sorted by |shap_value| (strongest first)
  → each card: icon/color by direction, value+unit, signed contribution,
    contribution bar, week-over-week delta, plain-language explanation
```

The full web implementation lives at `src/pages/SHAPExplanationDetail.tsx`; the service layer is `src/services/predictionService.ts`; the backend logic is in `apps/predictions/services.py` (`_build_feature_contributions`), `apps/predictions/views.py` (`PredictionFeaturesView`), and `apps/predictions/serializers.py`.

---

## 2. Base URL & Auth

- **Dev:** `http://127.0.0.1:8000/api/v1`
- **Production:** `https://ai-mshm-backend-d47t.onrender.com/api/v1`
- **Auth:** `Authorization: Bearer <access_token>` (JWT). On `401`, refresh via `POST /auth/token/refresh/` and retry once; if refresh fails, send the user to login.

All responses use a standard envelope:

```json
{
  "status": "success",
  "message": "…",
  "data": { }
}
```

Treat `status == "success"` as success. (On the web, `message` is informational; the client only checks `status`.)

---

## 3. Endpoints

| Purpose | Method | Path |
|---|---|---|
| Latest comprehensive prediction (used to get an id) | GET | `/predictions/comprehensive/` |
| SHAP feature contributions for one prediction | GET | `/predictions/{prediction_id}/features/` |
| Latest legacy prediction (fallback only) | GET | `/predictions/latest/` |

### 3.1 `GET /predictions/comprehensive/` — latest comprehensive prediction

Returns the most recent comprehensive prediction for the authenticated user. You only need `id` from it (and optionally `final_risk_score`, `risk_tier`, `unified_disease_scores` if your app shows the Results screen too).

```json
{
  "status": "success",
  "message": "",
  "data": {
    "id": "2d35e784-9cbd-472b-a2be-c25adac784c0",
    "final_risk_score": 0.42,
    "risk_tier": "moderate",
    "computed_at": "2026-08-02T14:03:11.123456Z",
    "unified_disease_scores": { },
    "shap_drivers": [ ]
  }
}
```

- `shap_drivers` here is the same list of drivers that `features/` returns, already mapped to the driver shape (see §5). If your app already holds the comprehensive response, you can render from `data.shap_drivers` directly and skip §3.2.
- `404` means the user has never run a comprehensive prediction (empty state, see §7).

### 3.2 `GET /predictions/{prediction_id}/features/` — the main endpoint

Returns the stored contribution drivers for a specific prediction.

```json
{
  "status": "success",
  "message": "",
  "data": {
    "prediction_id": "2d35e784-9cbd-472b-a2be-c25adac784c0",
    "prediction_type": "comprehensive",
    "computed_at": "2026-08-02T14:03:11.123456Z",
    "features": [
      {
        "feature_key": "symptom_mfg_28d",
        "display_name": "Hirsutism (mFG)",
        "value": 1.0,
        "unit": "mFG /16",
        "shap_value": -0.088,
        "direction": "decreases_risk",
        "bar_pct": 44.0,
        "explanation": "Hirsutism score averaged 1.0/16. Scores above 8 may indicate hyperandrogenism.",
        "vs_last_week": {
          "delta": -0.012,
          "direction": "down",
          "label": "-0.01 vs last assessment"
        }
      }
    ]
  }
}
```

- `prediction_type` is `"comprehensive"` for the modern pipeline. A legacy (`PredictionResult`) id returns a raw `feature_vector` shape **without** `features` — the client should treat a missing/empty `features` as an empty state (the web app only reaches the legacy path as a last resort).
- `403` = not the patient's own prediction (shouldn't happen for a patient app).
- `404` = id not found or id is not a prediction the user owns.

### 3.3 `GET /predictions/latest/` — legacy fallback

Only used if both §3.1 and the stored id fail. It returns the latest legacy prediction; its `id` is then passed to `features/`, which yields no `features` array (raw `feature_vector` instead), so in practice the screen shows the empty state. You can omit this endpoint in Flutter and go straight to the empty state after §3.1/§3.2 fail.

---

## 4. Fetch logic (order of operations)

Port this exactly — the web app does the following on screen load:

1. Read the **stored prediction id** from local storage (web: `localStorage['latest_prediction_id']`; Flutter: use `SharedPreferences`, same key is fine).
2. If an id exists → call `GET /predictions/{id}/features/`.
   - If it returns non-empty `features` → render them and **stop**.
   - If it returns `404` **or** empty `features` → continue to step 3.
   - Any other error → handle (401 → refresh/redirect, else show error state).
3. Fallback → call `GET /predictions/comprehensive/`.
   - If it returns a comprehensive prediction with an `id` → save that id to storage and call `GET /predictions/{id}/features/` → render.
   - If it fails with `404` (no assessment yet) → show the empty state.
4. (Web only) Legacy fallback via `GET /predictions/latest/` → not needed in Flutter; go to empty state.

**Important:** step 2 may return `features: []` for a *stored* id if that prediction predates the explainability feature. That is why step 3 exists — always re-resolve to the latest comprehensive prediction before giving up.

---

## 5. Data model

```dart
class VsLastWeek {
  final double delta;
  final String direction; // "up" | "down" | "stable"
  final String label;
}

class FeatureDriver {
  final String featureKey;
  final String displayName;
  final double value;
  final String unit;          // e.g. "SBS (0-10)", "mFG /16", "%", "kg/m²"
  final double shapValue;     // signed; positive = increases risk
  final String direction;     // "increases_risk" | "decreases_risk"
  final double? barPct;       // server-provided bar %, or compute client-side
  final String explanation;
  final VsLastWeek? vsLastWeek;
}
```

- `shap_value` is **clamped to `[-0.2, +0.2]`** by the backend.
- `direction` is derived from the sign of `shap_value` (`> 0` → `increases_risk`).

---

## 6. Rendering rules

### 6.1 Sort order
Sort drivers by **descending absolute `shap_value`** (strongest contribution first):

```dart
drivers.sort((a, b) => b.shapValue.abs().compareTo(a.shapValue.abs()));
```

### 6.2 Card layout (per driver)

Each card contains, top to bottom:

1. **Header row**
   - Leading icon/box:
     - `increases_risk` → up-arrow, red (`#E74C3C`) on a light red chip (`#FEE2E2`)
     - `decreases_risk` → down-arrow, teal (`#00897B`) on a light teal chip (`#E0F2F1`)
   - `display_name` (bold) and the formatted value underneath (see 6.3)
   - Right side: signed contribution text, e.g. `+0.07` or `-0.09`, colored red/teal by direction; below it the week-over-week delta (see 6.4)
2. **Contribution bar** — width = `min(|shap_value| * 500, 100)%` of the card width, red when `increases_risk`, teal otherwise. (If the server sent `bar_pct`, use it instead.)
3. **Explanation text** — `explanation`, small muted font.

A small legend at the top of the list explains the colors: **↗ Increases risk** (red), **↘ Decreases risk** (teal).

### 6.3 Value formatting
Format `value` using `unit`:

- `unit == '/36'` → `"$value/36"` (web formats like this; treat slash-units as `value + unit`)
- `unit == '/12'` → `"$value/12"`
- `unit == '/10'` → `"$value/10"`
- `unit == 'kg/m²'` → `"$value kg/m²"`
- `unit == 'µIU/mL'` → `"$value µIU/mL"`
- `unit == '%'` → `"$value%"`
- otherwise if `unit` present → `"$value $unit"`
- otherwise → `"$value"`

### 6.4 Week-over-week delta
Only if `vs_last_week` is present:

- `direction == "stable"` → show "No change" in muted gray.
- `direction == "up"` → red `#E74C3C` with `↗` (an increase in risk contribution is bad).
- `direction == "down"` → teal `#00897B` with `↘`.
- Text: `"${delta >= 0 ? '+' : ''}${delta.toStringAsFixed(2)} vs last wk"` (web label) or the server-provided `label`.
- Absent `vs_last_week` → show an em-dash (`—`) in muted gray.

### 6.5 Loading & empty states

- **Loading:** skeleton cards with a pulsing shimmer (the web renders 4 placeholder cards while fetching).
- **Empty / no data:** full-screen message with a clipboard emoji, a title like "Feature Details Coming Soon" (or "No feature data is available yet"), a subtitle explaining the user should **run a new assessment**, and a button back to the Results/Risk Score screen. Use this whenever `features` is null/empty or the endpoints return 404.

---

## 7. Backend explainability logic (context for the Flutter dev)

The backend does **not** run a real SHAP model. `_build_feature_contributions` in `apps/predictions/services.py` builds up to **10 signed drivers** from the inputs that actually fed the inference:

- **Symptom layer** — derived from the 28-day symptom feature vector: Symptom Burden, Pelvic Pressure/Fatigue/Pain, Breast Soreness, Hirsutism (mFG), Bloating, plus trends (SBS slope, fatigue trend, variability, cycle shifts). Contribution ≈ `(value - baseline) / scale`.
- **Disease-risk drivers** — for menstrual, rPPG, rPPG V8, and mood models, one driver per disease where `risk > 25%` drives risk up: `contribution = risk - 0.25`.
- **rPPG V8 wellness** — Sleep Quality, Focus & Memory, Mental Wellness, Mood Check: scores below 50 push risk up: `contribution = (50 - raw) / 100`.
- **Clamping** — `shap_value = clamp(contribution * 0.2, ±0.2)`, then rounded to 3 decimals.
- **Dedup** — sorted by `|shap_value|`, top 10 kept.
- **Delta** — compared against the previous stored prediction's drivers (`vs_last_week`).

Important: contributions are **only computed and stored when a new comprehensive prediction runs**. Existing predictions created before this feature shipped have `features: []` until the user runs a new assessment — the Flutter app must handle the empty case gracefully (see §6.5).

---

## 8. Auth / error summary

| Status | Meaning | Action |
|---|---|---|
| 200 | Drivers returned (may still be `[]`) | Render or empty state |
| 401 | Token expired | Refresh token, retry once; else redirect to login |
| 403 | Not the patient's own prediction | Treat as empty state |
| 404 | No prediction / id unknown | Fallback to latest comprehensive, else empty state |
| Network | Backend unreachable | Show retry/error state, do not crash |
