# Changelog - Session Updates

> Documenting all changes made to the AI-MSHM platform during this session.

---

## Date: March 26, 2026

---

## Patient Dashboard Updates

### 1. PCOS Risk Score Endpoint
**File:** `apps/predictions/views.py`

**Changes:**
- Created unified `PCOSRiskScoreView` that aggregates predictions from all 4 ML models:
  - Symptom Intensity (Django)
  - Menstrual Health (Node.js)
  - rPPG Camera (Node.js)
  - Mood Analysis (Node.js)
- Endpoint: `GET /api/v1/predictions/pcos/`
- Uses `risk_score` instead of `risk_probability` for PCOS score calculation (fixes binary values)

**Response Format:**
```json
{
  "id": "pcos-uuid",
  "risk_score": 0.64,
  "risk_tier": "Moderate",
  "all_predictions": {
    "symptom_intensity": { ... },
    "menstrual": { ... },
    "rppg": { ... },
    "mood": { ... }
  },
  "data_layers_used": ["symptom_intensity", "menstrual", "rppg", "mood"]
}
```

---

### 2. Frontend Dashboard Updates
**Files:** 
- `src/pages/DashboardScreen.tsx`
- `src/services/dashboardService.ts`
- `src/services/predictionService.ts`

**Changes:**
- Updated to use `/predictions/pcos/` endpoint
- Fixed "Updated NaN days ago" issue (handles empty/null dates)
- Added support for all 4 ML model predictions display
- Now uses `risk_score` instead of `risk_probability` for ML risk predictions

---

### 3. Today's Summary Section
**Files:**
- `src/pages/DashboardScreen.tsx`

**Changes:**
- Added `TodaySummary` interface for HRV, Fatigue, Mood
- Added `fetchTodaySummary()` function to fetch data from:
  - `/rppg/sessions/` → HRV
  - `/checkin/morning/{id}/` → Fatigue
  - `/mood/history/` → Mood score
- Updated display to show actual values

---

### 4. PCOS Risk Score Page
**File:** `src/pages/PCOSRiskScore.tsx`

**Changes:**
- Added display of all 4 prediction models with icons:
  - 📝 Symptom Intensity
  - 🩺 Menstrual Health
  - 📷 rPPG Camera
  - 🧠 Mood Analysis
- Uses `risk_score * 100` for display percentage

---

## Error Handling Updates

### 5. API Client Export
**File:** `src/services/apiClient.ts`

**Changes:**
- Added `export` keyword to `apiClient` for use in other services

---

### 6. WebSocket Disabling
**File:** `.env`

**Changes:**
- Added `VITE_WS_ENABLED=false` to disable WebSocket on production
- WebSocket doesn't work on Render.com without ASGI configuration

---

## PHC Portal Updates

### 7. Two-Factor Authentication (2FA)
**Files:**
- `apps/accounts/models.py`
- `apps/accounts/serializers.py`
- `apps/accounts/views.py`
- `apps/accounts/urls.py`

**Changes:**
- Added `is_2fa_enabled` field to User model
- Added `two_factor_secret` field for TOTP
- Created `TwoFactorAuth` model for OTP storage
- Created new endpoints:
  - `POST /auth/2fa/request/` - Request OTP via email
  - `POST /auth/2fa/verify/` - Verify OTP and get tokens

---

### 8. PHC Login Validation
**File:** `apps/accounts/serializers.py`

**Changes:**
- Added `staff_id` field validation for PHC/FMC staff
- Validates `staff_id` against `employee_id` in `HCCStaffProfile`
- **Auto-enables 2FA** for all staff roles on first login
- Staff ID is now **required** for PHC login

---

### 9. Frontend PHC Login
**Files:**
- `src/pages/phc/PHCStaffLoginScreen.tsx`
- `src/services/phcService.ts`

**Changes:**
- Staff ID field marked as **required** (red asterisk)
- Handles `requires_2fa` flag from login response
- Shows 2FA verification screen when enabled
- Updated `verify2FA()` to send email + otp_code

---

## Database Migrations

### 10. Migration Created
**File:** `apps/accounts/migrations/0003_add_2fa_fields.py`

**Changes:**
- Added `is_2fa_enabled` field to User
- Added `two_factor_secret` field to User
- Created `TwoFactorAuth` model

**To apply:**
```bash
python manage.py migrate accounts
```

---

## Bug Fixes

### 11. error_response Missing Parameter
**File:** `core/responses.py`

**Fix:** Added `data` parameter to `error_response()` function

---

### 12. DiseaseResult JSON Serialization
**File:** `apps/predictions/views.py`

**Fix:** Converted `DiseaseResult` objects to dictionaries before returning JSON

---

### 13. Request Abort Errors
**Files:**
- `src/services/dashboardService.ts`
- `src/pages/DashboardScreen.tsx`

**Fix:** 
- Made error handling more robust
- Reduced polling attempts from 6 to 3
- Removed verbose console.error logging

---

## API Endpoints Summary

### Patient Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/predictions/pcos/` | Unified PCOS Risk Score (all 4 models) |
| GET | `/predictions/latest/` | Latest individual prediction |
| GET | `/checkin/today/` | Today's check-in status |
| POST | `/checkin/session/start/` | Start check-in session |
| POST | `/checkin/morning/{id}/` | Submit morning check-in |
| POST | `/checkin/evening/{id}/` | Submit evening check-in |
| POST | `/checkin/session/submit/` | Submit session |
| GET | `/rppg/sessions/` | rPPG session history |
| POST | `/rppg/session/` | Start rPPG session |
| POST | `/rppg/session/complete/` | Complete rPPG session |
| POST | `/mood/log/phq4/` | Log PHQ-4 assessment |
| POST | `/mood/log/affect/` | Log affect grid |
| GET | `/mood/history/` | Mood log history |

### PHC Portal Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login/` | Staff login (with staff_id) |
| POST | `/auth/2fa/request/` | Request 2FA OTP |
| POST | `/auth/2fa/verify/` | Verify 2FA OTP |
| GET | `/centers/phc/queue/` | Patient queue |
| GET | `/centers/phc/queue/{id}/` | Patient record |
| POST | `/centers/phc/walk-in/` | Register walk-in |
| GET | `/centers/phc/analytics/` | PHC analytics |

---

## Configuration Changes

### Environment Variables
| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_WS_ENABLED` | `false` | Disable WebSocket on production |

---

## Known Issues

### 1. WebSocket Not Working
**Cause:** Render.com doesn't support WebSockets natively
**Status:** Disabled on production
**Fix Required:** Configure ASGI server with Redis channel layer

### 2. "image.png" Error in Node.js
**Cause:** ONNX model loading warning
**Status:** Non-blocking, predictions still work
**Note:** May indicate model file format issue

### 3. Database Connection Issues
**Cause:** Neon PostgreSQL DNS resolution failures
**Status:** Infrastructure issue
**Fix:** Check network/VPN or Neon database status

---

## Testing Instructions

### Test PCOS Risk Score
```bash
# Get token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password"}'

# Test PCOS endpoint
curl http://localhost:8000/api/v1/predictions/pcos/ \
  -H "Authorization: Bearer <token>"
```

### Test PHC Login with 2FA
```bash
# 1. Login with staff_id
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@test.com","password":"password","staff_id":"PHC-001"}'

# 2. Request OTP
curl -X POST http://localhost:8000/api/v1/auth/2fa/request/ \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@test.com"}'

# 3. Verify OTP
curl -X POST http://localhost:8000/api/v1/auth/2fa/verify/ \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@test.com","otp_code":"123456"}'
```

---

## Next Steps

1. ✅ Apply migration: `python manage.py migrate accounts`
2. ✅ Test PHC login with staff ID validation
3. ⏳ Enable WebSocket properly on Render (ASGI + Redis)
4. ⏳ Fix "image.png" warning in Node.js models
5. ⏳ Add more comprehensive error handling

---

*Document generated: March 26, 2026*
