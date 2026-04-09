# AIMHER Client Endpoints Documentation

**Document Version**: 1.0  
**Last Updated**: April 2026  
**API Base URL**: `/api/v1/`

---

## Table of Contents

1. [PHC Portal Screens](#phc-portal-screens)
   - [PHC Login](#phc-login)
   - [PHC Dashboard](#phc-dashboard)
   - [PHC Register (Walk-in)](#phc-register-walk-in)
   - [PHC Patient Queue](#phc-patient-queue)
   - [PHC Patient Detail](#phc-patient-detail)
   - [PHC Advice & Intervention](#phc-advice--intervention)
   - [PHC Escalation](#phc-escalation)
   - [PHC Analytics](#phc-analytics)
   - [PHC Notifications/Alerts](#phc-notificationsalerts)
   - [PHC Settings](#phc-settings)

2. [FMC Portal Screens](#fmc-portal-screens)
   - [FMC Login](#fmc-login)
   - [FMC Dashboard](#fmc-dashboard)
   - [FMC Case Queue](#fmc-case-queue)
   - [FMC Patient Detail](#fmc-patient-detail)
   - [FMC Diagnostics](#fmc-diagnostics)
   - [FMC Analytics](#fmc-analytics)
   - [FMC Settings](#fmc-settings)

3. [Clinician Portal Screens](#clinician-portal-screens)
   - [Clinician Login](#clinician-login)
   - [Clinician Dashboard](#clinician-dashboard)
   - [Clinician Patient Detail](#clinician-patient-detail)
   - [Clinician Treatment Plans](#clinician-treatment-plans)
   - [Clinician Prescriptions](#clinician-prescriptions)
   - [Clinician Analytics](#clinician-analytics)
   - [Clinician Profile](#clinician-profile)

---

## PHC Portal Screens

### PHC Login

**Route**: `/phc/login`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login/` | POST | None | PHC staff login with email/password |
| `/auth/token/refresh/` | POST | None | Refresh access token using refresh token |
| `/auth/me/` | GET | Required | Get current logged-in user details |
| `/auth/logout/` | POST | Required | Logout and invalidate tokens |

**Request - Login**:
```json
{
  "email": "staff@phc.org",
  "password": "secure_password"
}
```

**Response**:
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "staff@phc.org",
    "full_name": "John Doe",
    "role": "hcc_staff",
    "hcc": { "id": "uuid", "name": "Lagos PHC" }
  }
}
```

---

### PHC Dashboard

**Route**: `/phc/dashboard`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/queue/` | GET | Required | Get patient queue for PHC |
| `/centers/phc/analytics/` | GET | Required | Get PHC analytics summary |
| `/notifications/unread-count/` | GET | Required | Get count of unread notifications |

**Query Parameters**:
- `status`: Filter by status (new, in_progress, escalated, discharged)
- `condition`: Filter by condition (pcos, maternal, cardiovascular)
- `severity`: Filter by severity (mild, moderate, severe, very_severe)

**Response - Queue**:
```json
{
  "results": [
    {
      "id": "uuid",
      "patient": { "id": "uuid", "full_name": "Jane Doe", "email": "jane@example.com" },
      "condition": "pcos",
      "severity": "moderate",
      "status": "new",
      "created_at": "2026-04-09T10:00:00Z"
    }
  ],
  "count": 25
}
```

---

### PHC Register (Walk-in)

**Route**: `/phc/register`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/walk-in/comprehensive/` | POST | Required | Register walk-in patient with full data |
| `/auth/send-credentials/` | POST | Required | Send login credentials to patient |

**Request - Comprehensive Registration**:
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+2348012345678",
  "date_of_birth": "1995-03-15",
  "gender": "female",
  "height_cm": 165,
  "weight_kg": 70,
  "waist_cm": 85,
  "acanthosis_nigricans": "no",
  "cycle_regularity": "regular",
  "typical_cycle_length": 28,
  "bleeding_intensity": "medium",
  "night_sweats": "none",
  "persistent_fatigue": false,
  "family_history": ["PCOS"],
  "consent_given": true
}
```

**Response**:
```json
{
  "patient_id": "uuid",
  "patient_email": "jane@example.com",
  "patient_name": "Jane Doe",
  "phc_record_id": "uuid",
  "registered_hcc": "Lagos PHC",
  "temp_password": "Abc123!@#"
}
```

---

### PHC Patient Queue

**Route**: `/phc/dashboard`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/queue/` | GET | Required | List all patient records |
| `/centers/phc/queue/` | POST | Required | Create new patient record |
| `/centers/phc/queue/<uuid>/` | PATCH | Required | Update patient record |

**Query Parameters**:
- `status`: new, in_progress, escalated, discharged
- `condition`: pcos, maternal, cardiovascular
- `severity`: mild, moderate, severe, very_severe

---

### PHC Patient Detail

**Route**: `/phc/patients/:id`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/queue/<uuid>/` | GET | Required | Get patient record details |
| `/centers/phc/queue/<uuid>/` | PATCH | Required | Update patient record |
| `/centers/phc/queue/<uuid>/patient-data/` | GET | Required | Get patient's full health data |
| `/centers/phc/queue/<uuid>/escalate/` | POST | Required | Escalate patient to FMC |

**Request - Update Record**:
```json
{
  "status": "in_progress",
  "notes": "Patient shows improvement",
  "next_followup": "2026-05-01"
}
```

**Request - Escalate to FMC**:
```json
{
  "fmc_id": "uuid",
  "urgency": "routine",
  "reason": "Requires specialist care",
  "notes": "Patient has severe symptoms",
  "attach_pdf": true
}
```

---

### PHC Advice & Intervention

**Route**: `/phc/advice`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/advice/` | GET | Required | Get lifestyle advice templates |
| `/centers/phc/advice/` | POST | Required | Send advice to patient |

**Request - Send Advice**:
```json
{
  "queue_record_id": "uuid",
  "condition": "pcos",
  "message": "Maintain regular exercise and balanced diet",
  "followup_date": "2026-04-30"
}
```

---

### PHC Escalation

**Route**: `/phc/escalation`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/queue/<uuid>/escalate/` | POST | Required | Escalate patient to FMC |
| `/centers/phc/queue/<uuid>/` | PATCH | Required | Update status to escalated |
| `/centers/phc/queue/` | GET | Required | List escalated patients |

---

### PHC Analytics

**Route**: `/phc/analytics`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/analytics/` | GET | Required | Get analytics data |

**Query Parameters**:
- `range`: 7d, 30d, 90d, 1y
- `start_date`: Start date for custom range
- `end_date`: End date for custom range

**Response**:
```json
{
  "total_patients": 150,
  "new_this_month": 25,
  "escalated_count": 10,
  "average_risk_score": 0.45,
  "by_condition": { "pcos": 80, "maternal": 40, "cardiovascular": 30 },
  "by_severity": { "mild": 60, "moderate": 50, "severe": 30, "very_severe": 10 }
}
```

---

### PHC Notifications/Alerts

**Route**: `/phc/alerts`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/notifications/` | GET | Required | List all notifications |
| `/notifications/unread-count/` | GET | Required | Get unread notification count |
| `/notifications/<uuid>/read/` | PATCH | Required | Mark single notification as read |
| `/notifications/mark-all-read/` | PATCH | Required | Mark all notifications as read |

**Response - Notifications**:
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "New patient added",
      "body": "Patient Jane Doe has been registered",
      "notification_type": "new_referral",
      "is_read": false,
      "data": { "patient_id": "uuid", "record_id": "uuid" },
      "created_at": "2026-04-09T10:00:00Z"
    }
  ],
  "unread_count": 5
}
```

---

### PHC Settings

**Route**: `/phc/settings`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/phc/profile/` | GET | Required | Get PHC profile |
| `/centers/phc/profile/` | PATCH | Required | Update PHC profile |
| `/centers/phc/staff/` | GET | Required | List staff members |
| `/centers/phc/staff/` | POST | Required | Create new staff member |
| `/centers/phc/staff/<uuid>/` | PATCH | Required | Update staff member |
| `/centers/phc/staff/<uuid>/` | DELETE | Required | Deactivate staff member |
| `/auth/me/change-password/` | POST | Required | Change password |

**Request - Create Staff**:
```json
{
  "full_name": "New Staff",
  "email": "staff@phc.org",
  "staff_role": "hcc_staff",
  "employee_id": "EMP001"
}
```

**Response**:
```json
{
  "id": "uuid",
  "full_name": "New Staff",
  "email": "staff@phc.org",
  "staff_role": "hcc_staff",
  "temp_password": "Temp123!"
}
```

---

## FMC Portal Screens

### FMC Login

**Route**: `/fmc/login`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login/` | POST | None | FMC staff login |
| `/auth/2fa/verify/` | POST | Optional | Verify 2FA code |
| `/auth/token/refresh/` | POST | None | Refresh token |
| `/auth/me/` | GET | Required | Get current user |
| `/auth/logout/` | POST | Required | Logout |

---

### FMC Dashboard

**Route**: `/fmc/dashboard`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/fmc/cases/` | GET | Required | Get case queue |
| `/fmc/analytics/` | GET | Required | Get FMC analytics |
| `/fmc/alerts/` | GET | Required | Get FMC alerts |

---

### FMC Case Queue

**Route**: `/fmc/cases`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/fmc/cases/` | GET | Required | List all cases |
| `/centers/fmc/cases/<uuid>/` | GET | Required | Get case details |
| `/centers/fmc/cases/<uuid>/` | PATCH | Required | Update case |
| `/centers/fmc/cases/<uuid>/assign/` | POST | Required | Assign clinician to case |
| `/centers/fmc/cases/<uuid>/discharge/` | POST | Required | Discharge case |

**Query Parameters**:
- `status`: pending, in_treatment, discharged
- `condition`: pcos, maternal, cardiovascular
- `severity`: mild, moderate, severe, very_severe

---

### FMC Patient Detail

**Route**: `/fmc/patients/:id`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/fmc/cases/<uuid>/` | GET | Required | Get case details |
| `/centers/fmc/cases/<uuid>/` | PATCH | Required | Update case notes |
| `/centers/fmc/cases/<uuid>/assign/` | POST | Required | Assign clinician |
| `/fmc/discharge/<patient_id>/` | POST | Required | Full discharge |
| `/fmc/request-diagnostics/` | POST | Required | Request diagnostics |

---

### FMC Diagnostics

**Route**: `/fmc/diagnostics`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/fmc/request-diagnostics/` | POST | Required | Request diagnostic tests |
| `/fmc/diagnostics-status/<patient_id>/` | GET | Required | Get diagnostics status |

**Request**:
```json
{
  "patient_id": "uuid",
  "tests": ["blood_test", "ultrasound"],
  "urgency": "routine",
  "custom_note": "Check hormone levels"
}
```

---

### FMC Analytics

**Route**: `/fmc/analytics`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/fmc/analytics/` | GET | Required | Get FMC analytics |

---

### FMC Settings

**Route**: `/fmc/profile`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/centers/fmc/profile/` | GET | Required | Get FMC profile |
| `/centers/fmc/profile/` | PATCH | Required | Update FMC profile |
| `/centers/fmc/staff/` | GET | Required | List staff |
| `/centers/fmc/staff/` | POST | Required | Create staff |
| `/centers/fmc/clinicians/` | GET | Required | List clinicians |
| `/centers/fmc/clinicians/` | POST | Required | Add clinician |
| `/centers/fmc/clinicians/<uuid>/verify/` | POST | Required | Verify clinician |

---

## Clinician Portal Screens

### Clinician Login

**Route**: `/clinician/login`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/login/` | POST | None | Clinician login |
| `/auth/2fa/verify/` | POST | Optional | 2FA verification |
| `/auth/token/refresh/` | POST | None | Refresh token |

---

### Clinician Dashboard

**Route**: `/clinician/dashboard`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/clinician/cases/` | GET | Required | Get assigned cases |
| `/clinician/profile/` | GET | Required | Get clinician profile |

---

### Clinician Patient Detail

**Route**: `/clinician/patient/:id`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/clinician/cases/<uuid>/` | GET | Required | Get case details |
| `/clinician/cases/<uuid>/` | PATCH | Required | Update case |

---

### Clinician Treatment Plans

**Route**: `/clinician/treatment-plans`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/clinician/treatment-plans/` | GET | Required | List treatment plans |
| `/clinician/treatment-plans/` | POST | Required | Create treatment plan |

---

### Clinician Prescriptions

**Route**: `/clinician/prescriptions`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/clinician/prescriptions/` | GET | Required | List prescriptions |
| `/clinician/prescriptions/` | POST | Required | Create prescription |

---

### Clinician Analytics

**Route**: `/clinician/analytics`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/clinician/analytics/` | GET | Required | Get clinician analytics |

---

### Clinician Profile

**Route**: `/clinician/profile`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/clinician/profile/` | GET | Required | Get profile |
| `/clinician/profile/` | PATCH | Required | Update profile |
| `/auth/me/change-password/` | POST | Required | Change password |

---

## Common Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login/` | POST | Login |
| `/auth/register/` | POST | Patient registration |
| `/auth/token/refresh/` | POST | Refresh token |
| `/auth/logout/` | POST | Logout |
| `/auth/me/` | GET | Current user |
| `/auth/me/change-password/` | POST | Change password |
| `/auth/password/reset/` | POST | Request password reset |
| `/auth/password/reset/confirm/` | POST | Confirm password reset |

### Notifications

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/notifications/` | GET | List notifications |
| `/notifications/unread-count/` | GET | Unread count |
| `/notifications/<uuid>/read/` | PATCH | Mark as read |
| `/notifications/mark-all-read/` | PATCH | Mark all as read |

### Settings

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/settings/notifications/` | GET/PATCH | Notification preferences |
| `/settings/privacy/` | GET/PATCH | Privacy settings |
| `/settings/devices/` | GET | Connected devices |

---

## Error Responses

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid field values |
| 500 | Server Error |

### Error Response Format
```json
{
  "status": "error",
  "message": "Detailed error message",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

---

## Authentication Headers

All authenticated requests require:

```
Authorization: Bearer <access_token>
```

Token refresh should be done automatically by the API client.

---

*Document Version: 1.0*
*Last Updated: April 2026*