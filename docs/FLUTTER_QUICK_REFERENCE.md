# Flutter Quick Reference Guide

> Quick integration guide for the AI-MSHM API

---

## Authentication

### Login Flow
```dart
// 1. Login
final loginRes = await api.post('/auth/login/', {
  'email': email,
  'password': password,
});

// 2. Check if 2FA is required
if (loginRes['data']['requires_2fa'] == true) {
  // 3. Request OTP
  await api.post('/auth/2fa/request/', {'email': email});
  
  // 4. Verify OTP
  final otpRes = await api.post('/auth/2fa/verify/', {
    'email': email,
    'otp_code': otpCode,
  });
  
  // 5. Store tokens
  await storage.write('access_token', otpRes['data']['access']);
  await storage.write('refresh_token', otpRes['data']['refresh']);
} else {
  // Direct login
  await storage.write('access_token', loginRes['data']['access']);
  await storage.write('refresh_token', loginRes['data']['refresh']);
}
```

### Token Refresh
```dart
Future<void> ensureValidToken() async {
  final accessToken = await storage.read(key: 'access_token');
  if (accessToken == null) return;
  
  // Check expiry (SimpleJWT access tokens expire in 60 minutes)
  // For simplicity, always refresh if older than 50 minutes
  final prefs = await SharedPreferences.getInstance();
  final lastRefresh = prefs.getInt('last_token_refresh') ?? 0;
  
  if (DateTime.now().millisecondsSinceEpoch - lastRefresh > 50 * 60 * 1000) {
    await authService.refreshToken();
    await prefs.setInt('last_token_refresh', 
      DateTime.now().millisecondsSinceEpoch);
  }
}
```

---

## PCOS Risk Score

### Get Risk Score
```dart
Future<PCOSRiskScore> getRiskScore() async {
  final response = await api.get('/predictions/pcos/');
  return PCOSRiskScore.fromJson(response['data']);
}

// Usage
final score = await getRiskScore();
print('Risk: ${score.riskScore * 100}%'); // e.g., "Risk: 64%"
print('Tier: ${score.riskTier}'); // e.g., "Tier: Moderate"

// Access individual model predictions
final symptom = score.allPredictions?.symptomIntensity;
final menstrual = score.allPredictions?.menstrual;
final rppg = score.allPredictions?.rppg;
final mood = score.allPredictions?.mood;

// Get specific disease risk
final infertilityRisk = symptom?['Infertility']?.riskScore;
```

### Display Risk Gauge
```dart
Widget buildRiskGauge(double riskScore) {
  final percentage = (riskScore * 100).round();
  final color = _getRiskColor(riskScore);
  
  return Column(
    children: [
      Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 150,
            height: 150,
            child: CircularProgressIndicator(
              value: riskScore,
              strokeWidth: 12,
              color: color,
              backgroundColor: Colors.grey[200],
            ),
          ),
          Text(
            '$percentage%',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
      SizedBox(height: 8),
      Text(
        _getRiskTier(riskScore),
        style: TextStyle(
          fontSize: 18,
          color: color,
        ),
      ),
    ],
  );
}

Color _getRiskColor(double score) {
  if (score < 0.2) return Colors.green;
  if (score < 0.4) return Colors.lightGreen;
  if (score < 0.6) return Colors.orange;
  if (score < 0.8) return Colors.deepOrange;
  return Colors.red;
}

String _getRiskTier(double score) {
  if (score < 0.2) return 'Minimal Risk';
  if (score < 0.4) return 'Low Risk';
  if (score < 0.6) return 'Moderate Risk';
  if (score < 0.8) return 'High Risk';
  return 'Critical Risk';
}
```

---

## Check-ins

### Morning Check-in Flow
```dart
Future<void> completeMorningCheckin(MorningData data) async {
  // 1. Get today's status
  final today = await api.get('/checkin/today/');
  if (today['data']['morning_status'] != 'pending') {
    throw Exception('Morning check-in already completed');
  }
  
  // 2. Start session
  final session = await api.post('/checkin/session/start/', {
    'period': 'morning',
  });
  final sessionId = session['data']['id'];
  
  // 3. Submit morning data
  await api.post('/checkin/morning/$sessionId/', {
    'fatigue_vas': data.fatigueVas,
    'pelvic_pressure_vas': data.pelvicPressureVas,
    'psq_skin_sensitivity': data.psqSkinSensitivity,
    'psq_muscle_pressure_pain': data.psqMusclePressurePain,
    'psq_body_tenderness': data.psqBodyTenderness,
  });
  
  // 4. Submit session
  await api.post('/checkin/session/submit/', {
    'session_id': sessionId,
  });
}
```

### Evening Check-in Flow
```dart
Future<void> completeEveningCheckin(EveningData data) async {
  final session = await api.post('/checkin/session/start/', {
    'period': 'evening',
  });
  final sessionId = session['data']['id'];
  
  await api.post('/checkin/evening/$sessionId/', {
    'breast_left_vas': data.breastLeftVas,
    'breast_right_vas': data.breastRightVas,
    'acne_forehead': data.acneForehead,
    'acne_right_cheek': data.acneRightCheek,
    'acne_left_cheek': data.acneLeftCheek,
    'acne_nose': data.acneNose,
    'acne_chin': data.acneChin,
    'acne_chest_back': data.acneChestBack,
    'bloating_delta_cm': data.bloatingDeltaCm,
    'unusual_bleeding': data.unusualBleeding,
  });
  
  await api.post('/checkin/session/submit/', {
    'session_id': sessionId,
  });
}
```

---

## rPPG Camera

### Measurement Flow
```dart
Future<RppgResult> measureHRV() async {
  // 1. Start session
  final session = await api.post('/rppg/session/', {
    'session_type': 'baseline',
  });
  final sessionId = session['data']['session_id'];
  
  // 2. Wait for camera measurement (2 minutes)
  // This should show a camera preview in your app
  await _waitForCameraCapture();
  
  // 3. Complete with metrics (these come from your camera processing)
  final result = await api.post('/rppg/session/complete/', {
    'session_id': sessionId,
    'session_type': 'baseline',
    'metrics': {
      'rmssd': 45.2,    // From signal processing
      'mean_hr': 72,    // Mean heart rate
      'hrv_sdnn': 38.5, // SDNN value
    },
  });
  
  return RppgResult.fromJson(result['data']);
}
```

---

## Mood Tracking

### PHQ-4 Assessment
```dart
Future<void> logMoodPHQ4({
  required int item1, // Anxious (0-3)
  required int item2, // Anxious (0-3)
  required int item3, // Depressed (0-3)
  required int item4, // Depressed (0-3)
}) async {
  await api.post('/mood/log/phq4/', {
    'phq4_item1': item1,
    'phq4_item2': item2,
    'phq4_item3': item3,
    'phq4_item4': item4,
    'log_date': DateFormat('yyyy-MM-dd').format(DateTime.now()),
  });
}
```

### Affect Grid (Valence-Arousal)
```dart
// Valence: 1-9 (unpleasant to pleasant)
// Arousal: 1-9 (low to high energy)
Future<void> logAffect({
  required int valence,   // 1-9
  required int arousal,    // 1-9
}) async {
  await api.post('/mood/log/affect/', {
    'affect_valence': valence,
    'affect_arousal': arousal,
    'log_date': DateFormat('yyyy-MM-dd').format(DateTime.now()),
  });
}
```

---

## PHC Staff Login

### Staff Login with 2FA
```dart
Future<void> phcLogin(String email, String password, String staffId) async {
  // 1. Login with staff_id
  final loginRes = await api.post('/auth/login/', {
    'email': email,
    'password': password,
    'staff_id': staffId,
  });
  
  if (loginRes['data']['requires_2fa'] == true) {
    // 2. Request OTP
    await api.post('/auth/2fa/request/', {'email': email});
    
    // 3. Show OTP input dialog
    final otp = await _showOtpDialog();
    
    // 4. Verify OTP
    final otpRes = await api.post('/auth/2fa/verify/', {
      'email': email,
      'otp_code': otp,
    });
    
    await storage.write('access_token', otpRes['data']['access']);
    await storage.write('refresh_token', otpRes['data']['refresh']);
  } else {
    await storage.write('access_token', loginRes['data']['access']);
    await storage.write('refresh_token', loginRes['data']['refresh']);
  }
}
```

---

## Common Patterns

### Date Formatting
```dart
// Send date to API (use ISO 8601)
final dateStr = DateFormat('yyyy-MM-dd').format(date);

// Parse date from API
final date = DateTime.parse(apiDateStr);
```

### Loading States
```dart
class ApiFutureBuilder<T> extends StatelessWidget {
  final Future<T> future;
  final Widget Function(T data) builder;
  
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return CircularProgressIndicator();
        }
        if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}');
        }
        return builder(snapshot.data as T);
      },
    );
  }
}

// Usage
ApiFutureBuilder<PCOSRiskScore>(
  future: getRiskScore(),
  builder: (score) => RiskGauge(score: score),
)
```

### Error Handling
```dart
try {
  final score = await getRiskScore();
} on ApiException catch (e) {
  if (e.statusCode == 401) {
    // Token expired, re-login
    await authService.logout();
    goToLogin();
  } else if (e.statusCode == 404) {
    // No data yet
    showNoDataMessage();
  } else {
    showError(e.message);
  }
}
```

---

## Data Classes

```dart
// Model for PCOS Risk Score
class PCOSRiskScore {
  final String id;
  final double riskScore;
  final String riskTier;
  final String computedAt;
  final int dataCompletenessPct;
  final ModelPredictions? allPredictions;
  final List<String> dataLayersUsed;
  
  factory PCOSRiskScore.fromJson(Map<String, dynamic> json) {
    return PCOSRiskScore(
      id: json['id'] ?? '',
      riskScore: (json['risk_score'] ?? 0).toDouble(),
      riskTier: json['risk_tier'] ?? 'Unknown',
      computedAt: json['computed_at'] ?? '',
      dataCompletenessPct: json['data_completeness_pct'] ?? 0,
      allPredictions: json['all_predictions'] != null
          ? ModelPredictions.fromJson(json['all_predictions'])
          : null,
      dataLayersUsed: List<String>.from(json['data_layers_used'] ?? []),
    );
  }
}

class ModelPredictions {
  final Map<String, DiseasePrediction>? symptomIntensity;
  final Map<String, DiseasePrediction>? menstrual;
  final Map<String, DiseasePrediction>? rppg;
  final Map<String, DiseasePrediction>? mood;
  
  factory ModelPredictions.fromJson(Map<String, dynamic> json) {
    return ModelPredictions(
      symptomIntensity: _parsePredictions(json['symptom_intensity']),
      menstrual: _parsePredictions(json['menstrual']),
      rppg: _parsePredictions(json['rppg']),
      mood: _parsePredictions(json['mood']),
    );
  }
  
  static Map<String, DiseasePrediction>? _parsePredictions(dynamic json) {
    if (json == null) return null;
    return Map.fromEntries(
      (json as Map).entries.map(
        (e) => MapEntry(e.key, DiseasePrediction.fromJson(e.value)),
      ),
    );
  }
}

class DiseasePrediction {
  final double riskScore;
  final double riskProbability;
  final String severity;
  final int? riskFlag;
  
  factory DiseasePrediction.fromJson(Map<String, dynamic> json) {
    return DiseasePrediction(
      riskScore: (json['risk_score'] ?? 0).toDouble(),
      riskProbability: (json['risk_probability'] ?? 0).toDouble(),
      severity: json['severity'] ?? 'Unknown',
      riskFlag: json['risk_flag'],
    );
  }
}
```

---

## Environment Configuration

### Development vs Production
```dart
class Environment {
  static const bool isProduction = !kDebugMode;
  
  static String get apiBaseUrl => isProduction
      ? 'https://ai-mshm-backend-d47t.onrender.com/api/v1'
      : 'http://localhost:8000/api/v1';
  
  static String get wsBaseUrl => isProduction
      ? 'wss://ai-mshm-backend-d47t.onrender.com/ws/notifications'
      : 'ws://localhost:8000/ws/notifications';
}
```

---

*Quick Reference v1.0*
