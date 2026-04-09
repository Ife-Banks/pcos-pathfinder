# AIMHER Patient Endpoints Documentation

**Document Version**: 1.0  
**Last Updated**: April 2026  
**API Base URL**: `/api/v1/`

---

## Table of Contents

- [AIMHER Patient Endpoints Documentation](#aimher-patient-endpoints-documentation)
  - [Table of Contents](#table-of-contents)
  - [Patient App Screens](#patient-app-screens)
    - [Authentication (Login/Register)](#authentication-loginregister)
    - [Splash \& Welcome](#splash--welcome)
    - [Onboarding Flow](#onboarding-flow)
    - [Dashboard](#dashboard)
    - [Morning Check-In](#morning-check-in)
    - [Evening Check-In](#evening-check-in)
    - [Period Logging](#period-logging)
    - [Cycle History](#cycle-history)
    - [Weekly Tools](#weekly-tools)
    - [Mood Check](#mood-check)
    - [Mental Wellness](#mental-wellness)
    - [Focus \& Memory](#focus--memory)
    - [Sleep Quality](#sleep-quality)
    - [rPPG Capture](#rppg-capture)
    - [PCOS Risk Score](#pcos-risk-score)
    - [Risk Trend](#risk-trend)
    - [Lab \& Ultrasound Upload](#lab--ultrasound-upload)
    - [Clinical Data Status](#clinical-data-status)
    - [SHAP Explanation Detail](#shap-explanation-detail)
    - [Profile \& Settings](#profile--settings)
    - [Notifications](#notifications)
  - [Common Endpoints Reference](#common-endpoints-reference)
    - [Authentication](#authentication)
    - [Predictions](#predictions)
    - [Menstrual](#menstrual)
    - [rPPG](#rppg)
    - [Mood](#mood)
  - [Error Responses](#error-responses)
  - [Authentication Headers](#authentication-headers)

---

## Patient App Screens

### Authentication (Login/Register)

**Routes**: `/login`, `/signup`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register/` | POST | None | Patient registration |
| `/auth/login/` | POST | None | Patient login |
| `/auth/token/refresh/` | POST | None | Refresh access token |
| `/auth/logout/` | POST | Required | Logout |
| `/auth/me/` | GET | Required | Get current user profile |
| `/auth/me/change-password/` | POST | Required | Change password |
| `/auth/password/reset/` | POST | None | Request password reset |
| `/auth/password/reset/confirm/` | POST | None | Confirm password reset |
| `/auth/resend-verification/` | POST | None | Resend email verification |
| `/auth/verify-email/` | POST | None | Verify email with token |

**Request - Register**:
```json
{
  "email": "patient@example.com",
  "password": "SecurePassword123",
  "full_name": "Jane Doe"
}
```

**Response**:
```json
{
  "success": true,
  "status": 201,
  "message": "Registration successful",
  "data": {
    "id": "uuid",
    "email": "patient@example.com",
    "full_name": "Jane Doe",
    "role": "patient",
    "onboarding_step": 1,
    "is_email_verified": false
  }
}
```

---

### Splash & Welcome

**Routes**: `/`, `/welcome`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/me/` | GET | Required | Check existing session |

---

### Onboarding Flow

**Route**: `/onboarding`

The onboarding consists of 7 steps. Each step saves data to the server.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/onboarding/profile/` | GET | Required | Get existing onboarding profile |
| `/onboarding/step/1/` | PATCH | Required | Save Step 1: Personal Info |
| `/onboarding/step/2/` | PATCH | Required | Save Step 2: Physical Measurements |
| `/onboarding/step/3/` | PATCH | Required | Save Step 3: Skin Changes |
| `/onboarding/step/4/` | PATCH | Required | Save Step 4: Menstrual History |
| `/onboarding/step/5/` | PATCH | Required | Save Step 5: Wearable Setup |
| `/onboarding/step/6/rppg/` | POST | Required | Save Step 6: rPPG Baseline |
| `/onboarding/step/7/` | PATCH | Required | Save Step 7: Health Centre Selection |
| `/onboarding/complete/` | POST | Required | Mark onboarding as complete |

**Step 1 - Personal Info**:
```json
{
  "full_name": "Jane Doe",
  "age": 28,
  "ethnicity": "african"
}
```

**Step 2 - Physical Measurements**:
```json
{
  "height_cm": 165,
  "weight_kg": 70
}
```
*Response includes auto-computed BMI*

**Step 3 - Skin Changes**:
```json
{
  "has_skin_changes": true
}
```

**Step 4 - Menstrual History**:
```json
{
  "cycle_length_days": 28,
  "periods_per_year": 12,
  "cycle_regularity": "regular"
}
```

**Step 5 - Wearable Setup**:
```json
{
  "selected_wearable": "fitbit"
}
```

**Step 6 - rPPG**:
```json
{
  "baseline_captured": true
}
```

**Step 7 - Health Centre**:
```json
{
  "state": "Lagos",
  "lga": "Surulere",
  "registered_hcc": "uuid-of-phc"
}
```

---

### Dashboard

**Route**: `/dashboard`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/me/` | GET | Required | Get user profile |
| `/predictions/pcos/` | GET | Required | Get PCOS risk score with ML predictions |
| `/predictions/comprehensive/` | GET | Required | Get comprehensive predictions |
| `/checkin/today/` | GET | Required | Get today's check-in status, streak, completeness |
| `/checkin/morning/<session_id>/` | GET | Optional | Get morning session details |
| `/mood/history/` | GET | Optional | Get mood logs |
| `/menstrual/history/` | GET | Required | Get menstrual cycle data |
| `/rppg/sessions/` | GET | Required | Get rPPG session history |

**GET /auth/me/ - Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "patient@example.com",
    "full_name": "Jane Doe",
    "role": "patient",
    "onboarding_step": 7,
    "onboarding_completed": true,
    "is_email_verified": true,
    "date_joined": "2026-01-15T00:00:00Z"
  }
}
```

**GET /predictions/pcos/ - Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "risk_score": 0.68,
    "risk_tier": "High",
    "pcos_specific_score": 0.72,
    "per_disease_scores": {
      "Infertility": 0.75,
      "T2D": 0.65,
      "CVD": 0.55
    },
    "all_predictions": {
      "symptom_intensity": {
        "Infertility": { "risk_score": 0.7, "severity": "High" },
        "Dysmenorrhea": { "risk_score": 0.45, "severity": "Moderate" }
      },
      "menstrual": { ... },
      "rppg": { ... },
      "mood": { ... }
    },
    "data_completeness_pct": 85,
    "computed_at": "2026-04-09T10:00:00Z"
  }
}
```

**GET /checkin/today/ - Response**:
```json
{
  "success": true,
  "data": {
    "date": "2026-04-09",
    "morning_status": "complete",
    "evening_status": "pending",
    "morning_session_id": "uuid",
    "evening_session_id": null,
    "completeness_pct": 50,
    "streak_days": 5,
    "missed_yesterday": []
  }
}
```

**GET /menstrual/history/ - Response**:
```json
{
  "success": true,
  "data": {
    "cycles": [...],
    "total": 12,
    "aggregates": {
      "CLV": 5.2,
      "mean_cycle_len": 28,
      "mean_luteal": 14,
      "anovulatory_rate": 0.15
    }
  }
}
```

**GET /rppg/sessions/ - Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "rmssd": 32.5,
        "sdnn": 45.2,
        "mean_heart_rate": 72,
        "session_type": "checkin",
        "created_at": "2026-04-09T08:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### Morning Check-In
    "date": "2026-04-09",
    "morning_status": "complete",
    "evening_status": "pending",
    "completeness_pct": 50,
    "streak_days": 5,
    "missed_yesterday": []
  }
}
```

---

### Morning Check-In

**Route**: `/checkin/morning`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/checkin/today/` | GET | Required | Get check-in status |
| `/checkin/session/start/` | POST | Required | Start morning/evening session |
| `/checkin/morning/<session_id>/` | POST | Required | Submit morning check-in |
| `/checkin/hrv/` | POST | Optional | Submit HRV data |
| `/checkin/session/<session_id>/submit/` | POST | Required | Submit and complete session |
| `/checkin/session/<session_id>/autosave/` | POST | Required | Autosave progress |

**Request - Start Session**:
```json
{
  "period": "morning"
}
```

**Request - Submit Morning Check-in**:
```json
{
  "fatigue_vas": 5,
  "pelvic_pressure_vas": 3,
  "psq_skin_sensitivity": 2,
  "psq_muscle_pressure_pain": 4,
  "psq_body_tenderness": 3
}
```

**Request - Submit HRV**:
```json
{
  "session_id": "uuid",
  "hrv_sdnn_ms": 45.2,
  "hrv_rmssd_ms": 32.1,
  "skipped": false
}
```

---

### Evening Check-In

**Route**: `/checkin/evening`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/checkin/today/` | GET | Required | Get check-in status |
| `/checkin/session/start/` | POST | Required | Start session |
| `/checkin/evening/<session_id>/` | POST | Required | Submit evening check-in |
| `/checkin/hrv/` | POST | Optional | Submit HRV data |
| `/checkin/session/<session_id>/submit/` | POST | Required | Submit session |
| `/checkin/session/<session_id>/autosave/` | POST | Required | Autosave |

**Request - Submit Evening Check-in**:
```json
{
  "breast_left_vas": 3,
  "breast_right_vas": 4,
  "mastalgia_side": "both",
  "mastalgia_quality": "aching",
  "acne_forehead": 2,
  "acne_right_cheek": 1,
  "acne_left_cheek": 1,
  "acne_nose": 0,
  "acne_chin": 3,
  "acne_chest_back": 2,
  "bloating_delta_cm": 2.5,
  "unusual_bleeding": false
}
```

---

### Period Logging

**Route**: `/period-logging`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/menstrual/log-cycle` | POST | Required | Log new period |
| `/menstrual/history/` | GET | Required | Get cycle history |
| `/menstrual/predict/` | POST | Required | Get menstrual predictions |
| `/menstrual/features/` | GET | Required | Get feature schema |
| `/menstrual/model-info/` | GET | Required | Get model information |

**Request - Log Cycle**:
```json
{
  "period_start_date": "2026-04-01",
  "period_end_date": "2026-04-05",
  "bleeding_scores": [3, 4, 3, 2, 1],
  "has_ovulation_peak": true,
  "unusual_bleeding": false,
  "rppg_ovulation_day": null
}
```

**Response - Predictions**:
```json
{
  "success": true,
  "data": {
    "predictions": {
      "Infertility": { "risk_score": 0.65, "severity": "Moderate" },
      "Dysmenorrhea": { "risk_score": 0.42, "severity": "Mild" },
      "PMDD": { "risk_score": 0.38, "severity": "Mild" },
      "Endometrial": { "risk_score": 0.22, "severity": "Minimal" },
      "T2D": { "risk_score": 0.55, "severity": "Moderate" },
      "CVD": { "risk_score": 0.48, "severity": "Mild" }
    },
    "derived_features": {
      "CLV": 5.2,
      "mean_cycle_len": 28,
      "anovulatory_rate": 0.15
    },
    "criterion_flags": {
      "criterion_1_positive": 1,
      "criteria": [...]
    }
  }
}
```

---

### Cycle History

**Route**: `/cycle-history`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/menstrual/history/` | GET | Required | Get all logged cycles |
| `/menstrual/model-info/` | GET | Required | Get model info |

**Response**:
```json
{
  "success": true,
  "data": {
    "cycles": [...],
    "total": 12,
    "aggregates": {
      "CLV": 5.2,
      "mean_cycle_len": 28,
      "mean_luteal": 14,
      "anovulatory_rate": 0.15
    }
  }
}
```

---

### Weekly Tools

**Route**: `/weekly-tools`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/mood/log/phq4` | POST | Required | Log PHQ-4 assessment |
| `/mood/log/affect` | POST | Required | Log affect (valence/arousal) |
| `/mood/log/focus` | POST | Required | Log focus & memory |
| `/mood/log/sleep` | POST | Required | Log sleep quality |
| `/mood/predict/mental-health` | POST | Required | Get mental health prediction |
| `/mood/predict/metabolic` | POST | Required | Get metabolic prediction |
| `/mood/predict/cardio-neuro` | POST | Required | Get cardio/neuro prediction |
| `/mood/predict/reproductive` | POST | Required | Get reproductive prediction |

---

### Mood Check

**Route**: `/weekly-tools/mood-check`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/mood/log/phq4` | POST | Required | Log PHQ-4 assessment |

**Request**:
```json
{
  "phq4_item1": 1,
  "phq4_item2": 0,
  "phq4_item3": 1,
  "phq4_item4": 0,
  "log_date": "2026-04-09"
}
```

---

### Mental Wellness

**Route**: `/weekly-tools/mental-wellness`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/mood/log/affect` | POST | Required | Log affect |
| `/mood/predict/mental-health` | POST | Required | Get mental health predictions |

---

### Focus & Memory

**Route**: `/weekly-tools/focus-memory`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/mood/log/focus` | POST | Required | Log focus & memory |

**Request**:
```json
{
  "focus_score": 7,
  "memory_score": 8,
  "mental_fatigue": 3,
  "log_date": "2026-04-09"
}
```

---

### Sleep Quality

**Route**: `/weekly-tools/sleep-quality`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/mood/log/sleep` | POST | Required | Log sleep quality |

**Request**:
```json
{
  "sleep_quality": 8,
  "hours_slept": 7.5,
  "log_date": "2026-04-09"
}
```

---

### rPPG Capture

**Routes**: `/rppg-capture`, `/onboarding/step/6`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/rppg/sessions/` | POST | Required | Log rPPG session |
| `/rppg/predict/metabolic-cardio/` | POST | Required | Get metabolic-cardio predictions |
| `/rppg/predict/stress-reproductive/` | POST | Required | Get stress-reproductive predictions |
| `/rppg/sessions/` | GET | Required | Get rPPG session history |

**Request - Log rPPG Session**:
```json
{
  "rmssd": 32.5,
  "sdnn": 45.2,
  "mean_heart_rate": 72,
  "session_type": "onboarding"
}
```

---

### PCOS Risk Score

**Route**: `/risk-score`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/predictions/comprehensive/` | GET | Required | Get comprehensive predictions |
| `/predictions/comprehensive/` | POST | Required | Trigger new prediction |
| `/predictions/pcos/` | GET | Required | Get PCOS risk score |
| `/predictions/escalate/mood/` | POST | Required | Escalate mood risks |
| `/predictions/escalate/menstrual/` | POST | Required | Escalate menstrual risks |
| `/predictions/escalate/rppg/` | POST | Required | Escalate rPPG risks |

**Response - Comprehensive**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "final_risk_score": 0.68,
    "risk_tier": "High",
    "pcos_specific_score": 0.72,
    "per_disease_scores": {
      "Infertility": 0.75,
      "T2D": 0.65,
      "CVD": 0.55
    },
    "all_predictions": {
      "symptom": {...},
      "menstrual": {...},
      "rppg": {...},
      "mood": {...}
    },
    "data_completeness_pct": 85,
    "clinical_rules_triggered": ["Rotterdam Criteria", "Metabolic Cluster"],
    "computed_at": "2026-04-09T10:00:00Z"
  }
}
```

---

### Risk Trend

**Route**: `/risk-trend`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/predictions/history/` | GET | Required | Get prediction history |
| `/predictions/latest/` | GET | Required | Get latest prediction |

---

### Lab & Ultrasound Upload

**Routes**: `/lab-results`, `/ultrasound-upload`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/lab-results/upload/` | POST | Required | Upload lab results |
| `/ultrasound/upload/` | POST | Required | Upload ultrasound images |

---

### Clinical Data Status

**Route**: `/clinical-status`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/onboarding/profile/` | GET | Required | Get data completeness |
| `/predictions/latest/` | GET | Required | Get prediction data layers |

---

### SHAP Explanation Detail

**Route**: `/shap-detail`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/predictions/<id>/features/` | GET | Required | Get SHAP features |

**Response**:
```json
{
  "success": true,
  "data": {
    "prediction_id": "uuid",
    "features": [
      {
        "feature_key": "bmi",
        "display_name": "BMI",
        "value": 28.5,
        "unit": "kg/m²",
        "shap_value": 0.15,
        "direction": "increases_risk",
        "explanation": "Higher BMI contributes to increased PCOS risk"
      }
    ]
  }
}
```

---

### Profile & Settings

**Routes**: `/profile`, `/settings/notifications`, `/settings/privacy`, `/settings/devices`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/me/` | GET | Required | Get profile |
| `/auth/me/` | PATCH | Required | Update profile |
| `/auth/me/change-password/` | POST | Required | Change password |
| `/settings/notifications/` | GET | Required | Get notification settings |
| `/settings/notifications/` | PATCH | Required | Update notification settings |
| `/settings/privacy/` | GET | Required | Get privacy settings |
| `/settings/privacy/` | PATCH | Required | Update privacy settings |
| `/settings/devices/` | GET | Required | Get connected devices |

---

### Notifications

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/notifications/` | GET | Required | List notifications |
| `/notifications/unread-count/` | GET | Required | Get unread count |
| `/notifications/<uuid>/read/` | PATCH | Required | Mark as read |
| `/notifications/mark-all-read/` | PATCH | Required | Mark all as read |

---

## Common Endpoints Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register/` | POST | Register new patient |
| `/auth/login/` | POST | Login |
| `/auth/logout/` | POST | Logout |
| `/auth/token/refresh/` | POST | Refresh token |
| `/auth/me/` | GET | Current user |

### Predictions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predictions/latest/` | GET | Latest prediction |
| `/predictions/pcos/` | GET | PCOS risk score |
| `/predictions/comprehensive/` | GET/POST | Comprehensive prediction |
| `/predictions/history/` | GET | Prediction history |
| `/predictions/<id>/features/` | GET | SHAP features |

### Menstrual

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/menstrual/log-cycle` | POST | Log cycle |
| `/menstrual/history/` | GET | Cycle history |
| `/menstrual/predict/` | POST | Get predictions |

### rPPG

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rppg/sessions/` | POST | Log session |
| `/rppg/sessions/` | GET | Session history |
| `/rppg/predict/metabolic-cardio/` | POST | Metabolic predictions |

### Mood

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mood/log/phq4` | POST | Log PHQ-4 |
| `/mood/log/affect` | POST | Log affect |
| `/mood/log/focus` | POST | Log focus |
| `/mood/log/sleep` | POST | Log sleep |

---

## Error Responses

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

**Error Format**:
```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## Authentication Headers

All endpoints (except auth endpoints) require:
```
Authorization: Bearer <access_token>
```

---

*Document Version: 1.0*
*Last Updated: April 2026*