# AI-MSHM API Documentation

> **Patient Dashboard & PCOS Risk Assessment API Integration Guide**
> 
> This documentation covers all API endpoints for the AI-MSHM platform, including the Patient Dashboard, PCOS Risk Score, and integration examples for Flutter.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Patient Endpoints](#patient-endpoints)
   - [User Profile](#user-profile)
   - [Check-ins](#check-ins)
   - [Predictions & PCOS Risk Score](#predictions--pcos-risk-score)
   - [rPPG Camera](#rppg-camera)
   - [Mood Tracking](#mood-tracking)
   - [Menstrual Cycle](#menstrual-cycle)
4. [PHC Portal Endpoints](#phc-portal-endpoints)
5. [Data Models](#data-models)
6. [Flutter Integration](#flutter-integration)
7. [Error Handling](#error-handling)

---

## Overview

### Base URLs

| Environment | URL |
|-----------|-----|
| Production | `https://ai-mshm-backend-d47t.onrender.com/api/v1` |
| Local | `http://localhost:8000/api/v1` |

### Common Headers

```
Content-Type: application/json
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /auth/register/
Register a new patient account.

**Request:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Account created. Please check your email to verify your account.",
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "full_name": "Jane Doe",
    "role": "patient"
  }
}
```

---

### POST /auth/login/
Login and obtain JWT tokens.

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful.",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "jane@example.com",
      "full_name": "Jane Doe",
      "role": "patient",
      "is_email_verified": true
    },
    "requires_2fa": false
  }
}
```

---

### POST /auth/token/refresh/
Refresh expired access token.

**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST /auth/logout/
Logout and blacklist refresh token.

**Request:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```

---

### GET /auth/me/
Get current user profile.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "full_name": "Jane Doe",
    "role": "patient",
    "is_email_verified": true,
    "avatar": "https://...",
    "onboarding_completed": true,
    "onboarding_step": 7
  }
}
```

---

## Patient Endpoints

### User Profile

#### GET /profiles/patient/
Get patient profile details.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "date_of_birth": "1995-06-15",
    "height_cm": 165,
    "weight_kg": 62,
    "bmi": 22.77,
    "state": "Lagos",
    "lga": "Surulere",
    "registered_hcc": "uuid",
    "rppg_baseline_captured": true,
    "rppg_captured_at": "2024-01-15T10:30:00Z",
    "enrolled_at": "2024-01-01T09:00:00Z"
  }
}
```

#### PATCH /profiles/patient/
Update patient profile.

**Request:**
```json
{
  "height_cm": 166,
  "weight_kg": 63,
  "state": "Oyo",
  "lga": "Ibadan North"
}
```

---

### Check-ins

#### GET /checkin/today/
Get today's check-in status.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "date": "2024-03-26",
    "morning_status": "complete",
    "evening_status": "pending",
    "morning_session_id": "uuid",
    "evening_session_id": null,
    "completeness_pct": 50,
    "streak_days": 7,
    "missed_yesterday": []
  }
}
```

#### POST /checkin/session/start/
Start a check-in session.

**Request:**
```json
{
  "period": "morning"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "period": "morning",
    "started_at": "2024-03-26T08:00:00Z"
  }
}
```

#### POST /checkin/morning/{session_id}/
Submit morning check-in data.

**Request:**
```json
{
  "fatigue_vas": 4,
  "pelvic_pressure_vas": 2,
  "psq_skin_sensitivity": 3,
  "psq_muscle_pressure_pain": 2,
  "psq_body_tenderness": 1
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "fatigue_vas": 4,
    "hyperalgesia_index": 2.0,
    "logged_at": "2024-03-26T08:15:00Z"
  }
}
```

#### POST /checkin/evening/{session_id}/
Submit evening check-in data.

**Request:**
```json
{
  "breast_left_vas": 2,
  "breast_right_vas": 1,
  "acne_forehead": 3,
  "acne_right_cheek": 1,
  "acne_left_cheek": 2,
  "acne_nose": 0,
  "acne_chin": 4,
  "acne_chest_back": 1,
  "bloating_delta_cm": 1.5,
  "unusual_bleeding": false
}
```

#### POST /checkin/session/submit/
Submit the check-in session and trigger predictions.

**Request:**
```json
{
  "session_id": "uuid"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "session_id": "uuid",
    "submitted_at": "2024-03-26T20:30:00Z",
    "predictions_triggered": true
  }
}
```

---

### Predictions & PCOS Risk Score

#### GET /predictions/pcos/
**Unified PCOS Risk Score** - Combines predictions from all 4 ML models.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "pcos-uuid",
    "risk_score": 0.64,
    "risk_tier": "Moderate",
    "computed_at": "2024-03-26T21:00:00Z",
    "data_completeness_pct": 85,
    "all_predictions": {
      "symptom_intensity": {
        "Infertility": {
          "risk_score": 0.047,
          "risk_probability": 0.007,
          "severity": "Minimal",
          "risk_flag": 0
        },
        "Dysmenorrhea": {
          "risk_score": 0.199,
          "risk_probability": 0.002,
          "severity": "Mild",
          "risk_flag": 0
        },
        "PMDD": {
          "risk_score": 0.158,
          "risk_probability": 0.004,
          "severity": "Minimal",
          "risk_flag": 0
        },
        "T2D": {
          "risk_score": 0.092,
          "risk_probability": 0.002,
          "severity": "Minimal",
          "risk_flag": 0
        },
        "CVD": {
          "risk_score": 0.122,
          "risk_probability": 0.174,
          "severity": "Minimal",
          "risk_flag": 0
        },
        "Endometrial": {
          "risk_score": 0.209,
          "risk_probability": 0.0001,
          "severity": "Mild",
          "risk_flag": 0
        }
      },
      "menstrual": {
        "Infertility": {
          "risk_score": 0.607,
          "risk_probability": 1,
          "severity": "Severe",
          "risk_flag": 1
        },
        "Dysmenorrhea": {
          "risk_score": 0.377,
          "risk_probability": 1,
          "severity": "Mild",
          "risk_flag": 0
        },
        "PMDD": {
          "risk_score": 0.258,
          "risk_probability": 0,
          "severity": "Mild",
          "risk_flag": 0
        },
        "Endometrial": {
          "risk_score": 0.528,
          "risk_probability": 1,
          "severity": "Moderate",
          "risk_flag": 1
        },
        "T2D": {
          "risk_score": 0.441,
          "risk_probability": 0,
          "severity": "Moderate",
          "risk_flag": 0
        },
        "CVD": {
          "risk_score": 0.466,
          "risk_probability": 0,
          "severity": "Moderate",
          "risk_flag": 0
        }
      },
      "rppg": {
        "CVD": {
          "risk_score": 0.644,
          "risk_probability": 1,
          "severity": "High"
        },
        "T2D": {
          "risk_score": 0.513,
          "risk_probability": 1,
          "severity": "Medium"
        },
        "Metabolic": {
          "risk_score": 0.632,
          "risk_probability": 1,
          "severity": "High"
        },
        "HeartFailure": {
          "risk_score": 0.347,
          "risk_probability": 1,
          "severity": "Medium"
        },
        "Stress": {
          "risk_score": 0.576,
          "risk_probability": 1,
          "severity": "Medium"
        },
        "Infertility": {
          "risk_score": 0.513,
          "risk_probability": 1,
          "severity": "Medium"
        }
      },
      "mood": {
        "T2D_Mood": {
          "risk_score": 0.428,
          "risk_probability": 1,
          "severity": "Moderate"
        },
        "MetSyn_Mood": {
          "risk_score": 0.416,
          "risk_probability": 1,
          "severity": "Moderate"
        },
        "Infertility_Mood": {
          "risk_score": 0.422,
          "risk_probability": 1,
          "severity": "Moderate"
        }
      }
    },
    "data_layers_used": [
      "symptom_intensity",
      "menstrual",
      "rppg",
      "mood"
    ]
  }
}
```

**Risk Tiers:**
| Tier | Score Range | Description |
|------|-------------|-------------|
| Minimal | 0.0 - 0.2 | Very low PCOS risk |
| Low | 0.2 - 0.4 | Low PCOS risk |
| Moderate | 0.4 - 0.6 | Moderate PCOS risk |
| High | 0.6 - 0.8 | High PCOS risk |
| Critical | 0.8 - 1.0 | Very high PCOS risk |

**Note:** Use `risk_score` (continuous 0-1 value) for calculations. Avoid `risk_probability` as it may be binary (0 or 1) for some models.

---

#### GET /predictions/latest/
Get the latest individual prediction record.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "risk_score": 0.35,
    "risk_tier": "Low",
    "triage_class": "GREEN",
    "computed_at": "2024-03-25T10:00:00Z",
    "data_completeness_pct": 78,
    "missing_inputs_count": 2,
    "shap_drivers": [
      {
        "feature": "acne_score",
        "contribution": 0.12,
        "direction": "positive"
      }
    ],
    "data_layers_used": ["symptom_intensity", "menstrual"]
  }
}
```

---

### rPPG Camera

#### POST /rppg/session/
Start an rPPG measurement session (proxied to Node.js).

**Request:**
```json
{
  "session_type": "baseline"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "session_id": "uuid",
    "status": "recording",
    "expires_at": "2024-03-26T21:02:00Z"
  }
}
```

#### POST /rppg/session/complete/
Complete rPPG session and get results.

**Request:**
```json
{
  "session_id": "uuid",
  "session_type": "baseline",
  "metrics": {
    "rmssd": 45.2,
    "mean_hr": 72,
    "hrv_sdnn": 38.5
  }
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "session_id": "uuid",
    "rmssd": 45.2,
    "mean_hr": 72,
    "hrv_sdnn": 38.5,
    "captured_at": "2024-03-26T21:00:00Z",
    "predictions": {
      "metabolic_cardio": {
        "CVD": 0.64,
        "T2D": 0.51,
        "Metabolic": 0.63,
        "HeartFailure": 0.35
      },
      "stress_reproductive": {
        "Stress": 0.58,
        "Infertility": 0.51
      }
    }
  }
}
```

#### GET /rppg/sessions/
Get rPPG session history.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "rmssd": 45.2,
        "mean_temp": 36.5,
        "session_type": "baseline",
        "captured_at": "2024-03-26T21:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### Mood Tracking

#### POST /mood/log/phq4/
Log PHQ-4 mood assessment.

**Request:**
```json
{
  "phq4_item1": 1,
  "phq4_item2": 0,
  "phq4_item3": 1,
  "phq4_item4": 0,
  "log_date": "2024-03-26"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "phq4_anxiety_score": 1,
    "phq4_depression_score": 1,
    "phq4_total": 2,
    "log_date": "2024-03-26"
  }
}
```

#### POST /mood/log/affect/
Log affect grid mood.

**Request:**
```json
{
  "affect_valence": 6,
  "affect_arousal": 7,
  "log_date": "2024-03-26"
}
```

#### POST /mood/log/focus/
Log focus & memory assessment.

**Request:**
```json
{
  "focus_score": 7,
  "memory_score": 6,
  "mental_fatigue": 4,
  "log_date": "2024-03-26"
}
```

#### POST /mood/log/sleep/
Log sleep quality.

**Request:**
```json
{
  "sleep_quality": 6,
  "sleep_duration_hours": 7.5,
  "log_date": "2024-03-26"
}
```

#### GET /mood/history/
Get mood log history.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "id": "uuid",
        "logDate": "2024-03-26",
        "phq4Total": 2,
        "phq4AnxietyScore": 1,
        "phq4DepressionScore": 1,
        "affectQuadrant": "Calm-Relaxed",
        "cognitiveLoadScore": 2.8,
        "psychBurdenScore": 3.2
      }
    ],
    "total": 1
  }
}
```

---

### Menstrual Cycle

#### POST /menstrual/log-cycle/
Log a menstrual cycle.

**Request:**
```json
{
  "start_date": "2024-03-01",
  "end_date": "2024-03-05",
  "intensity": "moderate",
  "notes": "Normal cycle"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "start_date": "2024-03-01",
    "end_date": "2024-03-05",
    "intensity": "moderate"
  }
}
```

#### GET /menstrual/history/
Get menstrual cycle history.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "cycles": [
      {
        "id": "uuid",
        "start_date": "2024-03-01",
        "end_date": "2024-03-05",
        "length": 28,
        "intensity": "moderate"
      }
    ],
    "aggregates": {
      "mean_cycle_len": 28.5,
      "CLV": 0.85,
      "total_cycles_stored": 5
    }
  }
}
```

---

### Notifications

#### GET /notifications/
Get user notifications.

**Query Parameters:**
- `unread_only` (boolean): Filter to unread only

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "uuid",
        "type": "score_change",
        "title": "Risk Score Updated",
        "body": "Your PCOS risk score has been updated based on recent check-ins.",
        "is_read": false,
        "created_at": "2024-03-26T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

#### GET /notifications/unread-count/
Get unread notification count.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "unread_count": 3
  }
}
```

#### PATCH /notifications/{id}/read/
Mark notification as read.

**Response (200):**
```json
{
  "status": "success",
  "message": "Notification marked as read."
}
```

---

## PHC Portal Endpoints

> **Note:** These endpoints require `role: hcc_staff` or `role: hcc_admin` in the JWT token.

### PHC Authentication

#### POST /auth/login/
PHC staff login (requires staff_id).

**Request:**
```json
{
  "email": "staff@surulerephc.ng",
  "password": "SecurePass123!",
  "staff_id": "PHC-SUR-2024-001"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "staff@surulerephc.ng",
      "full_name": "John Staff",
      "role": "hcc_staff",
      "center_info": {
        "center_name": "Surulere Primary Health Centre",
        "center_type": "phc"
      }
    },
    "requires_2fa": true
  }
}
```

#### POST /auth/2fa/request/
Request 2FA OTP.

**Request:**
```json
{
  "email": "staff@surulerephc.ng"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "OTP sent to your email.",
  "data": {
    "email": "staff@surulerephc.ng",
    "expires_in_minutes": 10
  }
}
```

#### POST /auth/2fa/verify/
Verify 2FA OTP and get tokens.

**Request:**
```json
{
  "email": "staff@surulerephc.ng",
  "otp_code": "123456"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIs...",
    "refresh": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "staff@surulerephc.ng",
      "full_name": "John Staff",
      "role": "hcc_staff"
    }
  },
  "message": "2FA verification successful."
}
```

---

### Patient Queue

#### GET /centers/phc/queue/
Get patient queue for the PHC.

**Query Parameters:**
- `status`: Filter by status (new, under_review, action_taken, escalated, discharged)
- `condition`: Filter by condition (pcos, hormonal, metabolic)
- `severity`: Filter by severity (low, mild, moderate, high, critical)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "id": "uuid",
        "patient": {
          "id": "uuid",
          "full_name": "Jane Doe",
          "email": "jane@example.com"
        },
        "condition": "pcos",
        "condition_label": "PCOS",
        "severity": "moderate",
        "severity_label": "Moderate",
        "status": "new",
        "status_label": "New",
        "opening_score": 0.45,
        "latest_score": 0.42,
        "notes": null,
        "opened_at": "2024-03-20T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

#### GET /centers/phc/queue/{record_id}/
Get patient record details.

#### PATCH /centers/phc/queue/{record_id}/
Update patient record status.

**Request:**
```json
{
  "status": "action_taken",
  "notes": "Patient contacted, follow-up scheduled",
  "next_followup": "2024-04-01"
}
```

#### POST /centers/phc/queue/{record_id}/escalate/
Escalate patient to FMC.

**Request:**
```json
{
  "fmc_id": "fmc-uuid",
  "urgency": "priority",
  "reason": "High risk score requiring specialist care",
  "notes": "Patient has persistent high risk scores",
  "attach_pdf": true
}
```

---

### Walk-in Registration

#### POST /centers/phc/walk-in/
Register a walk-in patient.

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "+2348012345678",
  "date_of_birth": "1995-06-15",
  "height_cm": 165,
  "weight_kg": 62,
  "cycle_regularity": "irregular",
  "typical_cycle_length": 35
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "patient_id": "uuid",
    "full_name": "Jane Doe",
    "temp_password": "TempPass123!",
    "queue_record_id": "uuid",
    "baseline_risk": {
      "pcos_score": 0.42,
      "pcos_tier": "Moderate",
      "hormonal_score": 0.35,
      "hormonal_tier": "Low",
      "metabolic_score": 0.28,
      "metabolic_tier": "Low"
    }
  }
}
```

---

### Analytics

#### GET /centers/phc/analytics/
Get PHC analytics.

**Query Parameters:**
- `range`: Time range (7d, 30d, 90d)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total_patients": 45,
    "active_minor_risk": 12,
    "escalated_this_period": 3,
    "avg_time_to_action_days": 2.5,
    "risk_distribution": {
      "low": 20,
      "moderate": 25
    },
    "condition_breakdown": {
      "pcos": 30,
      "hormonal": 10,
      "metabolic": 5
    },
    "staff_actions": {
      "advice_sent": 15,
      "followups_scheduled": 8,
      "patients_discharged": 3
    }
  }
}
```

---

### Staff Management (Admin Only)

#### GET /centers/phc/staff/
Get PHC staff list.

#### POST /centers/phc/staff/
Create new staff member.

**Request:**
```json
{
  "full_name": "New Staff",
  "email": "newstaff@example.com",
  "staff_role": "nurse",
  "employee_id": "PHC-SUR-2024-002"
}
```

---

## Data Models

### DiseasePrediction
```dart
class DiseasePrediction {
  final double riskScore;
  final double riskProbability;
  final String severity;
  final int? riskFlag;
}
```

### PCOSRiskScore
```dart
class PCOSRiskScore {
  final String id;
  final double riskScore;
  final String riskTier;
  final String computedAt;
  final int dataCompletenessPct;
  final ModelPredictions allPredictions;
  final List<String> dataLayersUsed;
}

class ModelPredictions {
  final Map<String, DiseasePrediction>? symptomIntensity;
  final Map<String, DiseasePrediction>? menstrual;
  final Map<String, DiseasePrediction>? rppg;
  final Map<String, DiseasePrediction>? mood;
}
```

### CheckInToday
```dart
class CheckInToday {
  final String date;
  final String morningStatus; // complete, pending, in_progress
  final String eveningStatus;
  final String? morningSessionId;
  final String? eveningSessionId;
  final int completenessPct;
  final int streakDays;
}
```

---

## Flutter Integration

### Setup

#### 1. Add Dependencies (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  provider: ^6.0.0
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
```

#### 2. API Client Setup
```dart
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'https://ai-mshm-backend-d47t.onrender.com/api/v1';
  
  final _storage = const FlutterSecureStorage();
  
  Future<Map<String, String>> _headers() async {
    final token = await _storage.read(key: 'access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }
  
  Future<dynamic> get(String endpoint) async {
    final headers = await _headers();
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
    );
    return _handleResponse(response);
  }
  
  Future<dynamic> post(String endpoint, Map<String, dynamic> body) async {
    final headers = await _headers();
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }
  
  dynamic _handleResponse(http.Response response) {
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      throw ApiException(body['message'] ?? 'Unknown error');
    }
  }
}
```

### Authentication Service
```dart
class AuthService {
  final ApiClient _api;
  
  AuthService(this._api);
  
  Future<LoginResponse> login(String email, String password) async {
    final response = await _api.post('/auth/login/', {
      'email': email,
      'password': password,
    });
    return LoginResponse.fromJson(response['data']);
  }
  
  Future<void> logout() async {
    final refresh = await _storage.read(key: 'refresh_token');
    await _api.post('/auth/logout/', {'refresh': refresh});
    await _storage.deleteAll();
  }
  
  Future<void> refreshToken() async {
    final refresh = await _storage.read(key: 'refresh_token');
    final response = await http.post(
      Uri.parse('${ApiClient.baseUrl}/auth/token/refresh/'),
      body: jsonEncode({'refresh': refresh}),
    );
    final data = jsonDecode(response.body);
    await _storage.write(key: 'access_token', value: data['access']);
    await _storage.write(key: 'refresh_token', value: data['refresh']);
  }
}
```

### PCOS Risk Score Integration
```dart
class PCOSService {
  final ApiClient _api;
  
  PCOSService(this._api);
  
  Future<PCOSRiskScore> getRiskScore() async {
    final response = await _api.get('/predictions/pcos/');
    return PCOSRiskScore.fromJson(response['data']);
  }
}
```

### Check-in Integration
```dart
class CheckInService {
  final ApiClient _api;
  
  CheckInService(this._api);
  
  Future<CheckInToday> getTodayStatus() async {
    final response = await _api.get('/checkin/today/');
    return CheckInToday.fromJson(response['data']);
  }
  
  Future<void> submitMorningCheckin(String sessionId, MorningData data) async {
    await _api.post('/checkin/morning/$sessionId/', {
      'fatigue_vas': data.fatigueVas,
      'pelvic_pressure_vas': data.pelvicPressureVas,
      'psq_skin_sensitivity': data.psqSkinSensitivity,
      'psq_muscle_pressure_pain': data.psqMusclePressurePain,
      'psq_body_tenderness': data.psqBodyTenderness,
    });
  }
  
  Future<void> submitSession(String sessionId) async {
    await _api.post('/checkin/session/submit/', {
      'session_id': sessionId,
    });
  }
}
```

### Provider Setup
```dart
class AppState extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  late final AuthService authService;
  late final PCOSService pcosService;
  late final CheckInService checkInService;
  
  bool _isLoading = false;
  PCOSRiskScore? _riskScore;
  
  AppState() {
    authService = AuthService(_api);
    pcosService = PCOSService(_api);
    checkInService = CheckInService(_api);
  }
  
  Future<void> loadRiskScore() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      _riskScore = await pcosService.getRiskScore();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
```

### Widget Example
```dart
class RiskScoreCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, _) {
        if (appState.isLoading) {
          return CircularProgressIndicator();
        }
        
        final score = appState.riskScore;
        if (score == null) {
          return Text('No risk score available');
        }
        
        return Card(
          child: Column(
            children: [
              Text('${(score.riskScore * 100).toStringAsFixed(0)}%'),
              Text(score.riskTier),
              Text('Updated: ${score.computedAt}'),
            ],
          ),
        );
      },
    );
  }
}
```

---

## Error Handling

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | Re-authenticate |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource ID |
| 422 | Validation Error | Check field requirements |
| 500 | Server Error | Retry later |

### Error Response Format
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Retry Logic Example
```dart
Future<T> fetchWithRetry<T>(
  Future<T> Function() fetchFn,
  {int maxRetries = 3}
) async {
  int attempts = 0;
  while (true) {
    try {
      return await fetchFn();
    } on ApiException catch (e) {
      if (++attempts >= maxRetries || e.statusCode == 401) {
        rethrow;
      }
      await Future.delayed(Duration(seconds: attempts * 2));
    }
  }
}
```

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/login/` | 5 per minute |
| `/auth/register/` | 3 per minute |
| `/predictions/*/` | 10 per minute |
| `/checkin/*/` | 20 per minute |

---

## Support

For API support, contact:
- Email: support@ai-mshm.com
- Documentation: https://docs.ai-mshm.com

---

*Last Updated: March 2026*
