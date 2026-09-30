# rPPG V8 — Flutter Implementation Spec

Specification for implementing the rPPG V8 measurement feature in the Flutter mobile app, matching the existing web implementation so the app works without issues against the AI-MSHM backend.

---

## 1. Overview

The feature captures 18+ physiological metrics from the user's fingertip via the front camera, then posts the metrics to the backend, which returns risk, mood, and regression predictions.

```
Camera (front) → green-channel PPG signal → peak detection → RR intervals
→ HRV metrics → clamp to validation ranges → POST /rppg-v8/session
→ POST /rppg-v8/predict  (all risk/mood/regression scores)
```

- Capture duration: **120 seconds**
- Front camera only, no audio
- No flash, no finger-placement overlay in the web version — the user holds still and the region of interest is the center of the frame
- After capture: log the session, then call `predict`; show risk/mood results

---

## 2. Camera setup

- Request camera permission explicitly.
  - Android: add `CAMERA` permission to the manifest, request at runtime.
  - iOS: add `NSCameraUsageDescription` to `Info.plist`.
- Use the **front-facing** camera (`CameraLensDirection.front`).
- Disable audio capture entirely.
- Show a live preview while capturing.
- Handle denial gracefully (show error message, no crash).

---

## 3. Signal pipeline

Port these steps exactly:

### 3.1 Green-channel sampling

Every video frame, compute the mean green channel (RGB index 1) inside a circle centered at:

```
centerX = width / 2
centerY = height * 0.35
radius  = min(180, min(width, height) / 2.5)
```

Sample every 2px within the circle, average the green values → one scalar per frame.

Keep a rolling buffer of the latest **900 samples**.

### 3.2 Signal quality gate

Compute from the most recent window:

```
dc = mean(window)
ac = window - dc
r  = max(ac) - min(ac)
s  = std(ac)
```

Quality score:

| Condition | Score |
|---|---|
| `r > 1.5 && s > 0.6` | 85 |
| `r > 1.0 && s > 0.4` | 70 |
| `r > 0.6 && s > 0.25` | 55 |
| `r > 0.3 && s > 0.15` | 40 |
| `r > 0.15` | 25 |
| otherwise | 10 |

Peak detection is skipped while quality < 10.

### 3.3 Peak detection

Within a 30-sample lookback window, find the local maximum above the DC offset. Accept the peak only when **all** of:

- peak not at the window edge (`index >= 3 && index <= lookback - 4`)
- positive excursion (`peakAc > 0`)
- above threshold (`peakAc > minVal + 0.15 * range`)
- fallen from peak (`signalDrop > range * 0.15`)

Enforce a **minimum RR interval of 350ms** between accepted peaks.

### 3.4 RR-interval cleaning

- `filterPeaks`: keep only RRs in **350–2000ms**.
- `filterRRIntervals`: keep only intervals within **50–180% of the median**.
- Final computation additionally uses only RRs in **400–1500ms**.

### 3.5 Metrics from RR intervals

```
HR    = 60000 / mean(RR)
RMSSD = sqrt(mean(squared successive differences))   // clamp ≤ 200
HRV   = std(RR)
```

Requires ≥ 3 RR intervals for RMSSD/HRV.

### 3.6 Frequency bands (LF / HF / LF-HF ratio)

- Resample irregular RR intervals to an equidistant **4 Hz** series.
- Detrend (subtract the mean).
- Zero-pad to the next power of 2.
- Apply a **Hann window**.
- Radix-2 FFT.
- Sum power in:
  - **LF: 0.04–0.15 Hz**
  - **HF: 0.15–0.40 Hz**
- Normalize with `PSD factor = 2 / (n * 0.375)`.
- Floor results at `0.001`.
- Requires ≥ 8 resampled points and ≥ 8 s of data.

```
LF/HF = lfPower / hfPower
```

### 3.7 Respiratory rate

Dominant frequency in the **0.15–0.40 Hz** band, then `× 60`. Requires ≥ 8 s of data.

### 3.8 AC / DC

```
ac           = max(green) - min(green)
dc           = mean(green)
ac_dc_ratio  = ac / dc
pulse_amp    = ac / 255
```

### 3.9 Trends

Every 10 s, push a windowed `{ time, hr, rmssd }` point. `hr_trend` / `rmssd_trend` = linear-regression slope over the recorded windows.

---

## 4. Important caveat — simulated values

In the web implementation, **SpO2, skin temperature, and EDA are NOT derived from the camera**. They are random-drift simulators:

```
spO2 = clamp(spO2 + random(-0.5, 0.5) * 1, 94, 100)
temp = clamp(temp + random(-0.5, 0.5) * 0.1, 35.0, 37.5)
eda  = clamp(eda  + random(-0.5, 0.5) * 0.3, 0.5, 8.0)
```

Initialized once per capture:

```
eda  = 1.5 + random() * 1.5
temp = 36.0 + random() * 0.8
spO2 = 96 + random() * 3
```

Only HR, RMSSD, SDNN, LF/HF, respiratory rate, AC/DC, pulse amplitude, and signal quality are real signal outputs.

**Decision required**: either replicate the same simulation (stays consistent with web results) or use actual device sensors (SpO2/temperature sensors if available) — but expect results to differ from web.

---

## 5. Payload validation ranges (must clamp before sending)

Clamp every value to the range below **before** posting (matches the Node.js Joi validation):

| Field | Range | | Field | Range |
|---|---|---|---|---|
| `rmssd` | 0–1000 | | `mean_eda` | 0–20 |
| `hf` | 0–5000 | | `mean_temp` | 25–42 |
| `lf_hf_ratio` | 0–20 | | `asi` | 0–5 |
| `heart_rate` | 30–200 | | `rmssd_trend` | -50–50 |
| `hrv` | 0–1000 | | `ac` | 0–255 |
| `estimated_spo2` | 80–100 | | `dc` | 0–255 |
| `skin_temperature` | 25–42 | | `ac_dc_ratio` | 0–10 |
| `hr_trend` | -10–10 | | `pulse_amplitude` | 0–100 |
| `respiratory_rate` | 5–40 | | `signal_quality` | 0–100 |

Defaults:

- `session_type` = `'checkin'`
- `session_quality` = `'good'` if quality ≥ 50, `'poor'` if quality ≥ 25, else `'motion_artifact'`

Full payload field names (must be **snake_case**):

```json
{
  "rmssd": 0,
  "hf": 0,
  "lf_hf_ratio": 0,
  "heart_rate": 0,
  "hrv": 0,
  "estimated_spo2": 0,
  "skin_temperature": 0,
  "hr_trend": null,
  "mean_eda": 0,
  "mean_temp": 0,
  "asi": null,
  "rmssd_trend": null,
  "ac": null,
  "dc": null,
  "ac_dc_ratio": null,
  "pulse_amplitude": null,
  "signal_quality": null,
  "respiratory_rate": null,
  "session_type": "checkin",
  "session_quality": null
}
```

---

## 6. API contract

Base URL: `https://ai-mshm-backend-d47t.onrender.com/api/v1`

### Endpoints

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/rppg-v8/session` | full payload | session result |
| POST | `/rppg-v8/predict` | — | `{ regression, risk, mood_check, deep_learning, feature_vector, nSessions }` |
| POST | `/rppg-v8/predict/regression` | `{ "target": "..." }` | regression result |
| POST | `/rppg-v8/predict/risk` | `{ "domain": "..." }` | risk result |
| POST | `/rppg-v8/predict/mood` | — | mood result |
| POST | `/rppg-v8/predict/dl` | `{ "target": "..." }` | deep-learning result |
| GET | `/rppg-v8/sessions` | — | `{ sessions, count }` |
| GET | `/rppg-v8/predictions` | — | `{ predictions, count }` |
| GET | `/rppg-v8/metadata` | — | model info |

### Prediction structure

```json
{
  "regression": { "Sleep_Quality": { "target": "...", "predictions": {}, "ensemble": null } },
  "risk": { "Metabolic_Syndrome": { "domain": "...", "risk_score": null, "risk_probability": null, "risk_flag": 0, "severity": null } },
  "mood_check": { "best_prediction": { "label": "...", "confidence": 0, "probabilities": [] }, "best_algorithm": "...", "all_predictions": {}, "classes": [] },
  "deep_learning": { "Sleep_Quality": { "target": "...", "predictions": {}, "ensemble": null, "method": "deep_learning" } },
  "feature_vector": {},
  "nSessions": 0
}
```

### Targets / domains

Regression targets:

```
Sleep_Quality, Focus_Memory, Mental_Wellness, Mood_Score,
Metabolic_Syndrome_Risk, T2D_Metabolic_Risk_Index, Cardiovascular_Risk_Score,
Heart_Failure_Alert_Score, Chronic_Stress_Severity, Infertility_Reproductive_Risk
```

Risk domains:

```
Sleep_Quality, Focus_Memory, Mental_Wellness, Mood_Check,
Metabolic_Syndrome, Type_2_Diabetes, Cardiovascular_Disease,
Heart_Failure, Chronic_Stress, Infertility
```

Deep-learning targets:

```
Sleep_Quality, Focus_Memory, Mental_Wellness, Mood_Score
```

---

## 7. Authentication

- Attach `Authorization: Bearer <access_token>` to every request.
- On **401**, call `POST /auth/token/refresh/` with `{ "refresh": refresh_token }`.
  - New tokens may be nested as `data.access` / `data.refresh` or flat `access` / `refresh` — handle both.
  - Store as `access_token` and `refresh_token`.
  - If refresh fails, clear tokens and force re-login.
- Use a generous request timeout (predictions can be slow; the web uses 120 s).

---

## 8. Response / error handling

- Success responses are wrapped as `{ "status": "success", "message": "...", "data": {...} }` — read values from `data`.
- Validation errors come back as:

```json
{
  "errors": [ { "field": "...", "message": "..." } ]
}
```

Log the full body on failure. Show at most the first 3 field errors to the user.

- If `POST /session` succeeds but `predict` fails, keep the session saved and show results locally — do not fail the whole capture.

---

## 9. Gotchas / checklist

- Use **snake_case** field names — camelCase will fail validation.
- Don't send sessions with < 3 peaks or < 8 s of data (LF/HF/HRV will be 0 or null).
- Clamp everything (Section 5) before posting.
- Handle camera permission denial on both platforms.
- iOS camera warm-up can be slow — give the readiness phase a timeout with a "continue anyway" fallback.
- Decide on simulated vs real SpO2/temp/EDA (Section 4) before implementation.
