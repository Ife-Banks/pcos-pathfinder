# AIMHER API Usage Workflow

**Document Version**: 1.0  
**Last Updated**: April 2026  
**API Base URL**: `/api/v1/`

---

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Onboarding Flow](#onboarding-flow)
3. [Daily Check-in Flow](#daily-check-in-flow)
4. [Dashboard Data Flow](#dashboard-data-flow)
5. [Period Logging Flow](#period-logging-flow)
6. [Weekly Tools Flow](#weekly-tools-flow)
7. [rPPG Capture Flow](#rppg-capture-flow)
8. [Risk Assessment Flow](#risk-assessment-flow)
9. [Profile & Settings Flow](#profile--settings-flow)
10. [Notification Handling Flow](#notification-handling-flow)

---

## Authentication Flow

### 1. User Registration

```
POST /auth/register/
→ Request Body:
{
  "email": "patient@example.com",
  "password": "SecurePassword123",
  "full_name": "Jane Doe"
}

← Response (201):
{
  "success": true,
  "status": 201,
  "data": {
    "id": "uuid",
    "email": "patient@example.com",
    "full_name": "Jane Doe",
    "role": "patient",
    "onboarding_step": 1,
    "is_email_verified": false
  }
}

→ NEXT: Verify email (if required)
POST /auth/verify-email/
{
  "token": "email-verification-token"
}
```

### 2. User Login

```
POST /auth/login/
→ Request Body:
{
  "email": "patient@example.com",
  "password": "SecurePassword123"
}

← Response (200):
{
  "success": true,
  "data": {
    "access": "eyJ...",
    "refresh": "eyJ...",
    "user": {
      "id": "uuid",
      "email": "patient@example.com",
      "full_name": "Jane Doe",
      "role": "patient",
      "onboarding_step": 3,
      "onboarding_completed": false
    }
  }
}

→ Store tokens:
  - Access token in memory (or short-lived storage)
  - Refresh token in secure storage (for token refresh)
```

### 3. Token Refresh (Automatic)

```
When access token expires → POST /auth/token/refresh/
→ Request Body:
{
  "refresh": "eyJrefresh_token..."
}

← Response (200):
{
  "access": "new_access_token...",
  "refresh": "new_refresh_token..."
}

→ Update stored tokens
```

### 4. Logout

```
POST /auth/logout/
→ Request Body:
{
  "refresh": "stored_refresh_token"
}

← Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}

→ Clear stored tokens
```

---

## Onboarding Flow

### Complete Onboarding Journey

```
1. GET /onboarding/profile/
   → Check existing progress

2. PATCH /onboarding/step/1/ (Personal Info)
   → Request: { "full_name": "Jane", "age": 28, "ethnicity": "african" }
   ← Response: { "success": true, "data": { "onboarding_step": 2, ... } }

3. PATCH /onboarding/step/2/ (Physical Measurements)
   → Request: { "height_cm": 165, "weight_kg": 70 }
   ← Response: { "success": true, "data": { "bmi": 25.7, "onboarding_step": 3 } }

4. PATCH /onboarding/step/3/ (Skin Changes)
   → Request: { "has_skin_changes": true }
   ← Response: { "success": true, "data": { "onboarding_step": 4 } }

5. PATCH /onboarding/step/4/ (Menstrual History)
   → Request: { "cycle_length_days": 28, "periods_per_year": 12, "cycle_regularity": "regular" }
   ← Response: { "success": true, "data": { "onboarding_step": 5 } }

6. PATCH /onboarding/step/5/ (Wearable Setup)
   → Request: { "selected_wearable": "fitbit" }
   ← Response: { "success": true, "data": { "onboarding_step": 6 } }

7. [OPTIONAL] POST /onboarding/step/6/rppg/
   → Request: { "baseline_captured": true }
   ← Response: { "success": true, "data": { "onboarding_step": 7 } }

8. [OPTIONAL] PATCH /onboarding/step/7/ (Health Centre)
   → Request: { "state": "Lagos", "lga": "Surulere", "registered_hcc": "uuid" }
   ← Response: { "success": true, "data": { "onboarding_step": 8 } }

9. POST /onboarding/complete/
   → (No body needed)
   ← Response: { "success": true, "data": { "redirect": "/dashboard" } }
```

---

## Daily Check-in Flow

### Morning Check-in

```
1. GET /checkin/today/
   → Check if already completed today

2. POST /checkin/session/start/
   → Request: { "period": "morning" }
   ← Response: { "data": { "id": "session-uuid", "period": "morning", "started_at": "..." } }

3. POST /checkin/morning/<session_id>/
   → Request:
   {
     "fatigue_vas": 5,
     "pelvic_pressure_vas": 3,
     "psq_skin_sensitivity": 2,
     "psq_muscle_pressure_pain": 4,
     "psq_body_tenderness": 3
   }
   ← Response: { "success": true, "data": { "logged_at": "...", ... } }

4. [OPTIONAL] POST /checkin/hrv/
   → Request:
   {
     "session_id": "session-uuid",
     "hrv_rmssd": 32.5,
     "hrv_sdnn": 45.2,
     "skipped": false
   }
   ← Response: { "success": true, "data": { "session_id": "...", "hrv_rmssd_ms": 32.5 } }

5. POST /checkin/session/<session_id>/submit/
   → (No body needed)
   ← Response: { "success": true, "data": { "predictions_triggered": true } }
```

### Evening Check-in

```
1. POST /checkin/session/start/
   → Request: { "period": "evening" }

2. POST /checkin/evening/<session_id>/
   → Request:
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

3. [OPTIONAL] POST /checkin/hrv/

4. POST /checkin/session/<session_id>/submit/
```

---

## Dashboard Data Flow

### Load Dashboard

```
Parallel requests:

1. GET /auth/me/
   → Get user profile & onboarding status

2. GET /checkin/today/
   → Get today's check-in status, streak, completeness

3. GET /predictions/pcos/  (or /predictions/latest/)
   → Get current risk score

4. GET /menstrual/history/
   → Get menstrual summary (mean cycle, CLV, total cycles)

5. GET /rppg/sessions/
   → Get latest HRV data

6. GET /mood/summary/today/  (optional)
   → Get today's mood summary
```

### Prediction Polling (After Check-in Complete)

```
When both morning & evening check-ins complete:
→ Poll GET /predictions/pcos/ every 5 seconds (max 3 times)
→ Stop when new prediction computed (same day)
```

---

## Period Logging Flow

### Log New Period

```
1. POST /menstrual/log-cycle
   → Request:
   {
     "period_start_date": "2026-04-01",
     "period_end_date": "2026-04-05",
     "bleeding_scores": [3, 4, 3, 2, 1],
     "has_ovulation_peak": true,
     "unusual_bleeding": false,
     "rppg_ovulation_day": null
   }
   ← Response:
   {
     "success": true,
     "data": {
       "cycle": { "id": "...", "cycleLength": 28, "mensesLength": 5 },
       "updated_aggregates": { "CLV": 5.2, "mean_cycle_len": 28 },
       "criterion_flags": { "criterion_1_positive": 1 }
     }
   }

2. [OPTIONAL] POST /menstrual/predict/
   → Trigger new prediction after logging
```

### View Cycle History

```
GET /menstrual/history/
← Response:
{
  "success": true,
  "data": {
    "cycles": [...],
    "total": 12,
    "aggregates": {
      "CLV": 5.2,
      "mean_cycle_len": 28,
      "anovulatory_rate": 0.15
    }
  }
}
```

---

## Weekly Tools Flow

### PHQ-4 Assessment (Mood Check)

```
1. POST /mood/log/phq4
   → Request:
   {
     "phq4_item1": 1,
     "phq4_item2": 0,
     "phq4_item3": 1,
     "phq4_item4": 0,
     "log_date": "2026-04-09"
   }
   ← Response:
   {
     "success": true,
     "data": {
       "phq4_anxiety_score": 2,
       "phq4_depression_score": 1,
       "phq4_total": 3,
       "log_date": "2026-04-09"
     }
   }

2. POST /mood/predict/mental-health
   → Get mental health predictions
```

### Log Affect (Mental Wellness)

```
POST /mood/log/affect
→ Request:
{
  "affect_valence": 7,
  "affect_arousal": 5,
  "log_date": "2026-04-09"
}
```

### Log Focus & Memory

```
POST /mood/log/focus
→ Request:
{
  "focus_score": 7,
  "memory_score": 8,
  "mental_fatigue": 3,
  "log_date": "2026-04-09"
}
```

### Log Sleep Quality

```
POST /mood/log/sleep
→ Request:
{
  "sleep_quality": 8,
  "hours_slept": 7.5,
  "log_date": "2026-04-09"
}
```

---

## rPPG Capture Flow

### Capture HRV from Camera

```
1. POST /rppg/sessions/
   → Request:
   {
     "rmssd": 32.5,
     "sdnn": 45.2,
     "mean_heart_rate": 72,
     "mean_temp": 36.5,
     "mean_eda": 2.1,
     "session_type": "checkin",
     "session_quality": "good"
   }
   ← Response:
   {
     "success": true,
     "data": {
       "session": { "id": "uuid", "rmssd": 32.5, ... },
       "total_sessions": 5
     }
   }

2. POST /rppg/predict/metabolic-cardio/
   → Get metabolic & cardiovascular predictions

3. POST /rppg/predict/stress-reproductive/
   → Get stress & reproductive predictions

4. POST /predictions/comprehensive/
   → Trigger comprehensive prediction update
```

---

## Risk Assessment Flow

### View PCOS Risk Score

```
1. GET /predictions/comprehensive/
   → Get latest comprehensive prediction
   ← Response:
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
         "symptom": { "Infertility": { "risk_score": 0.7, ... } },
         "menstrual": { ... },
         "rppg": { ... },
         "mood": { ... }
       },
       "data_completeness_pct": 85,
       "clinical_rules_triggered": ["Rotterdam Criteria"],
       "computed_at": "2026-04-09T10:00:00Z"
     }
   }

2. GET /predictions/<id>/features/
   → Get SHAP explanation for risk factors

3. GET /predictions/history/
   → Get historical predictions for trend
```

### Trigger New Assessment

```
POST /predictions/comprehensive/
→ (No body needed - uses existing data)
← Response: { "success": true, "data": { <new prediction> } }
```

---

## Profile & Settings Flow

### Get Profile Data

```
1. GET /auth/me/
   → Get basic profile

2. GET /onboarding/profile/
   → Get detailed profile (age, ethnicity, height, weight, BMI)
```

### Update Profile

```
PATCH /auth/me/
→ Request:
{
  "full_name": "Jane Doe Updated"
}
```

### Notification Settings

```
1. GET /settings/notifications/
   ← Response:
   {
     "morning_time": "08:00",
     "evening_time": "20:00",
     "morning_checkin_enabled": true,
     "evening_checkin_enabled": true,
     "weekly_prompts_enabled": true,
     "period_alerts_enabled": true,
     "risk_score_updates_enabled": true
   }

2. PATCH /settings/notifications/
   → Request:
   {
     "morning_time": "07:00",
     "evening_checkin_enabled": false
   }
```

### Privacy Settings

```
1. GET /settings/privacy/
   ← Response:
   {
     "behavioral_data_enabled": true,
     "wearable_data_enabled": true,
     "clinical_data_enabled": true,
     "share_with_clinician": true,
     "anonymized_research": true,
     "model_improvement": true
   }

2. PATCH /settings/privacy/
   → Request:
   {
     "share_with_clinician": false
   }
```

### Device Management

```
1. GET /settings/devices/
   → List connected devices

2. POST /settings/devices/
   → Connect new device
   → Request: { "device_type": "fitbit" }

3. POST /settings/devices/<id>/sync/
   → Sync device data

4. DELETE /settings/devices/<id>/
   → Disconnect device
```

---

## Notification Handling Flow

### Fetch Notifications

```
1. GET /notifications/
   ← Response:
   {
     "success": true,
     "results": [
       {
         "id": "uuid",
         "title": "Risk Update",
         "body": "Your PCOS risk score has changed",
         "notification_type": "risk_update",
         "is_read": false,
         "data": { "patient_id": "uuid" },
         "created_at": "2026-04-09T10:00:00Z"
       }
     ],
     "unread_count": 3
   }

2. GET /notifications/unread-count/
   → Get badge count
```

### Mark as Read

```
1. PATCH /notifications/<uuid>/read/
   → Mark single as read

2. PATCH /notifications/mark-all-read/
   → Mark all as read
```

---

## Error Handling Patterns

### Token Expired (401)

```
1. Try refresh token
POST /auth/token/refresh/
{ "refresh": "..." }

2. If refresh fails → Redirect to login
```

### Validation Error (422)

```
Response:
{
  "success": false,
  "status": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["This field is required."],
    "height_cm": ["Value must be between 50 and 300"]
  }
}
```

### Network Error

```
- Show retry button
- Cache last successful response if applicable
- Queue failed requests for retry when online
```

---

## Quick Reference: Common Workflows

### New User First Launch

```
1. POST /auth/register/
2. → Verify email (if required)
3. POST /auth/login/
4. GET /onboarding/profile/ → Check onboarding_step
5. If step < 7 → Navigate to /onboarding
6. If step == 7 → POST /onboarding/complete/
7. Navigate to /dashboard
```

### Daily User Flow

```
1. Open app → GET /dashboard data (parallel)
2. Complete morning check-in
3. Complete evening check-in
4. Check predictions updated
5. [Optional] Log period
6. [Optional] Complete weekly tools
```

### Period Logging Flow

```
1. Navigate to /period-logging
2. User enters period dates & bleeding scores
3. POST /menstrual/log-cycle
4. GET updated predictions
5. Show updated risk scores
```

---

*Document Version: 1.0*
*Last Updated: April 2026*