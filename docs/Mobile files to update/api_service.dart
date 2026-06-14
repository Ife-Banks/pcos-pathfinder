import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'app_colors.dart';

class ApiService {
  ApiService._();

  static const String _base =
      'https://ai-mshm-backend-d47t.onrender.com/api/v1';
  static const Duration _timeout = Duration(seconds: 90);

  static const _storage  = FlutterSecureStorage();
  static const _kAccess  = 'access_token';
  static const _kRefresh = 'refresh_token';

  static Future<String?> getAccessToken()  async => _storage.read(key: _kAccess);
  static Future<String?> getRefreshToken() async => _storage.read(key: _kRefresh);

  static Future<void> _saveTokens(String access, String refresh) async {
    await _storage.write(key: _kAccess,  value: access);
    await _storage.write(key: _kRefresh, value: refresh);
  }

  static Future<void> clearTokens() async => _storage.deleteAll();

  static Future<bool> get isLoggedIn async => (await getAccessToken()) != null;

  static Map<String, String> get _json => {'Content-Type': 'application/json'};

  static Future<Map<String, String>> _authHeaders() async {
    final token = await getAccessToken();
    return {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  static Map<String, dynamic> _decode(http.Response r) {
    if (r.body.isEmpty) return {'_statusCode': r.statusCode};
    try {
      final decoded = jsonDecode(r.body);
      if (decoded is Map<String, dynamic>) {
        decoded['_statusCode'] = r.statusCode;
        return decoded;
      }
      if (decoded is List) {
        return {'_statusCode': r.statusCode, 'data': decoded};
      }
      return {'_statusCode': r.statusCode, '_rawBody': r.body};
    } catch (_) {
      return {'_statusCode': r.statusCode, '_rawBody': r.body};
    }
  }

  static bool isSuccess(Map<String, dynamic> body) {
    final code = body['_statusCode'] as int? ?? 0;
    if (code == 200 || code == 201) return true;
    return body['success'] == true ||
        body['status']?.toString().toLowerCase() == 'success';
  }

  // ── wake-up ───────────────────────────────────────────────────────────────

  static Future<void> wakeUp() async {
    try {
      final r = await http
          .get(Uri.parse('$_base/auth/login/'))
          .timeout(_timeout);
      debugPrint('>>> wakeUp: ${r.statusCode}');
    } catch (e) {
      debugPrint('>>> wakeUp error: $e');
    }
  }

  // ── authed HTTP wrappers ──────────────────────────────────────────────────

  static Future<http.Response> _authedGet(String path) async {
    var h = await _authHeaders();
    var r = await http.get(Uri.parse('$_base$path'), headers: h).timeout(_timeout);
    if (r.statusCode == 401) {
      if (await refreshToken()) {
        h = await _authHeaders();
        r = await http.get(Uri.parse('$_base$path'), headers: h).timeout(_timeout);
      } else { await clearTokens(); }
    }
    return r;
  }

  static Future<http.Response> _authedPost(
      String path, Map<String, dynamic> body) async {
    var h = await _authHeaders();
    var r = await http
        .post(Uri.parse('$_base$path'), headers: h, body: jsonEncode(body))
        .timeout(_timeout);
    if (r.statusCode == 401) {
      if (await refreshToken()) {
        h = await _authHeaders();
        r = await http
            .post(Uri.parse('$_base$path'), headers: h, body: jsonEncode(body))
            .timeout(_timeout);
      } else { await clearTokens(); }
    }
    return r;
  }

  static Future<http.Response> _authedPatch(
      String path, Map<String, dynamic> body) async {
    var h = await _authHeaders();
    var r = await http
        .patch(Uri.parse('$_base$path'), headers: h, body: jsonEncode(body))
        .timeout(_timeout);
    if (r.statusCode == 401) {
      if (await refreshToken()) {
        h = await _authHeaders();
        r = await http
            .patch(Uri.parse('$_base$path'), headers: h, body: jsonEncode(body))
            .timeout(_timeout);
      } else { await clearTokens(); }
    }
    return r;
  }

  static Future<http.Response> _authedDelete(String path) async {
    var h = await _authHeaders();
    var r = await http.delete(Uri.parse('$_base$path'), headers: h).timeout(_timeout);
    if (r.statusCode == 401) {
      if (await refreshToken()) {
        h = await _authHeaders();
        r = await http.delete(Uri.parse('$_base$path'), headers: h).timeout(_timeout);
      } else { await clearTokens(); }
    }
    return r;
  }

  // ── AUTH ──────────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> register({
    required String fullName,
    required String email,
    required String password,
    required String confirmPassword,
    String role = 'patient',
  }) async {
    final r = await http.post(
      Uri.parse('$_base/auth/register/'),
      headers: _json,
      body: jsonEncode({
        'full_name': fullName, 'email': email,
        'password': password, 'confirm_password': confirmPassword,
        'role': role,
      }),
    ).timeout(_timeout);
    debugPrint('>>> register: ${r.statusCode} ${r.body}');
    return _decode(r);
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final r = await http.post(
      Uri.parse('$_base/auth/login/'),
      headers: _json,
      body: jsonEncode({'email': email, 'password': password}),
    ).timeout(_timeout);
    debugPrint('>>> login: ${r.statusCode} ${r.body}');
    final body = _decode(r);
    if (r.statusCode == 200 && isSuccess(body)) {
      final data = body['data'] as Map<String, dynamic>;
      await _saveTokens(data['access'] as String, data['refresh'] as String);
    }
    return body;
  }

  static Future<bool> refreshToken() async {
    final refresh = await getRefreshToken();
    if (refresh == null) return false;
    try {
      final r = await http.post(
        Uri.parse('$_base/auth/token/refresh/'),
        headers: _json,
        body: jsonEncode({'refresh': refresh}),
      ).timeout(_timeout);
      if (r.statusCode == 200) {
        final decoded = jsonDecode(r.body) as Map<String, dynamic>;
        await _storage.write(key: _kAccess, value: decoded['access'] as String);
        return true;
      }
    } catch (_) {}
    return false;
  }

  static Future<void> logout() async => clearTokens();

  /// POST /auth/verify-email/
  static Future<Map<String, dynamic>> verifyEmail(String token) async {
    final r = await http.post(
      Uri.parse('$_base/auth/verify-email/'),
      headers: _json,
      body: jsonEncode({'token': token}),
    ).timeout(_timeout);
    return _decode(r);
  }

  /// POST /auth/resend-verification/
  static Future<Map<String, dynamic>> resendVerification(String email) async {
    final r = await http.post(
      Uri.parse('$_base/auth/resend-verification/'),
      headers: _json,
      body: jsonEncode({'email': email}),
    ).timeout(_timeout);
    return _decode(r);
  }

  /// POST /auth/forgot-password/
  static Future<Map<String, dynamic>> forgotPassword(String email) async {
    final r = await http.post(
      Uri.parse('$_base/auth/forgot-password/'),
      headers: _json,
      body: jsonEncode({'email': email}),
    ).timeout(_timeout);
    return _decode(r);
  }

  /// POST /auth/reset-password/
  static Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    final r = await http.post(
      Uri.parse('$_base/auth/reset-password/'),
      headers: _json,
      body: jsonEncode({
        'token': token, 'password': password,
        'confirm_password': confirmPassword,
      }),
    ).timeout(_timeout);
    return _decode(r);
  }

  /// GET /auth/me/
  static Future<Map<String, dynamic>> getMe() async =>
      _decode(await _authedGet('/auth/me/'));

  /// PATCH /auth/me/
  static Future<Map<String, dynamic>> updateProfile(
      {required String fullName}) async =>
      _decode(await _authedPatch('/auth/me/', {'full_name': fullName}));

  /// POST /auth/me/change-password/
  static Future<Map<String, dynamic>> changePassword({
    required String oldPassword,
    required String newPassword,
  }) async =>
      _decode(await _authedPost('/auth/me/change-password/', {
        'old_password': oldPassword,
        'new_password': newPassword,
      }));

  static String loginRouteFor(Map<String, dynamic> user) {
    if (user['is_email_verified'] == false) return '/email-verify';
    if (user['onboarding_completed'] == false) return '/onboard';
    return '/dashboard';
  }

  // ── ONBOARDING ────────────────────────────────────────────────────────────

  /// GET /onboarding/profile/
  static Future<Map<String, dynamic>> getOnboardingProfile() async =>
      _decode(await _authedGet('/onboarding/profile/'));

  /// PATCH /onboarding/step/<step>/
  static Future<Map<String, dynamic>> saveOnboardingStep(
      int step, Map<String, dynamic> body) async {
    final r = await _authedPatch('/onboarding/step/$step/', body);
    debugPrint('>>> onboardingStep$step: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /onboarding/step/6/rppg/
  static Future<Map<String, dynamic>> saveOnboardingRppg(
      Map<String, dynamic> hrvData) async {
    final r = await _authedPost('/onboarding/step/6/rppg/', hrvData);
    debugPrint('>>> saveOnboardingRppg: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /onboarding/complete/
  static Future<Map<String, dynamic>> completeOnboarding() async =>
      _decode(await _authedPost('/onboarding/complete/', {}));

  // ── CHECK-IN ──────────────────────────────────────────────────────────────

  /// GET /checkin/today/
  static Future<Map<String, dynamic>> getTodayStatus() async =>
      _decode(await _authedGet('/checkin/today/'));

  /// GET /checkin/mfg/
  static Future<Map<String, dynamic>> getMfg() async =>
      _decode(await _authedGet('/checkin/mfg/'));

  /// GET /mood/log/phq4
  static Future<Map<String, dynamic>> getPhq4() async =>
      _decode(await _authedGet('/mood/log/phq4'));

  /// POST /checkin/mfg/
  static Future<bool> submitMfg(Map<String, dynamic> body) async {
    final r = await _authedPost('/checkin/mfg/', body);
    return r.statusCode == 200 || r.statusCode == 201;
  }

  /// POST /checkin/session/start/
  static Future<Map<String, dynamic>> startCheckinSession({
    required String period,
    String? checkinDate,
  }) async {
    final body = <String, dynamic>{
      'period': period,
      if (checkinDate != null) 'checkin_date': checkinDate,
    };
    return _decode(await _authedPost('/checkin/session/start/', body));
  }

  /// POST /checkin/morning/<session_id>/
  static Future<Map<String, dynamic>> saveMorningCheckinData(
      String sessionId, Map<String, dynamic> data) async =>
      _decode(await _authedPost('/checkin/morning/$sessionId/', data));

  /// POST /checkin/evening/<session_id>/
  static Future<Map<String, dynamic>> saveEveningCheckinData(
      String sessionId, Map<String, dynamic> data) async =>
      _decode(await _authedPost('/checkin/evening/$sessionId/', data));

  /// POST /checkin/session/<session_id>/autosave/
  static Future<void> autosaveSession(String sessionId) async =>
      _authedPost('/checkin/session/$sessionId/autosave/', {});

  /// POST /checkin/session/<session_id>/submit/
  static Future<Map<String, dynamic>> submitCheckinSession(
      String sessionId) async =>
      _decode(await _authedPost('/checkin/session/$sessionId/submit/', {}));

  /// POST /checkin/hrv/
  static Future<Map<String, dynamic>> submitHrvData(
      Map<String, dynamic> hrvData) async =>
      _decode(await _authedPost('/checkin/hrv/', hrvData));

  /// GET /checkin/summary/<summary_date>/
  static Future<Map<String, dynamic>> getCheckinSummary(
      String summaryDate) async =>
      _decode(await _authedGet('/checkin/summary/$summaryDate/'));

  // ── rPPG / HRV ────────────────────────────────────────────────────────────

  /// POST /rppg/session
  static Future<Map<String, dynamic>> logRppgSession({
    required double rmssd,
    required double meanTemp,
    required double meanEda,
    double? asi,
    required String sessionType,
    String? sessionQuality,
  }) async {
    final body = <String, dynamic>{
      'rmssd': rmssd, 'mean_temp': meanTemp,
      'mean_eda': meanEda, 'session_type': sessionType,
    };
    if (asi            != null) body['asi']             = asi;
    if (sessionQuality != null) body['session_quality'] = sessionQuality;
    final r = await _authedPost('/rppg/session', body);
    debugPrint('>>> logRppgSession: ${r.statusCode} ${r.body}');
    return _decode(r);
  }

  /// GET /rppg/sessions
  static Future<Map<String, dynamic>> getRppgSessions() async =>
      _decode(await _authedGet('/rppg/sessions'));

  /// GET /rppg/predictions
  static Future<Map<String, dynamic>> getRppgPredictions() async {
    final r = await _authedGet('/rppg/predictions');
    debugPrint('>>> getRppgPredictions: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /rppg/predict/metabolic-cardio/
  static Future<Map<String, dynamic>> predictRppgMetabolicCardio() async {
    final r = await _authedPost('/rppg/predict/metabolic-cardio/', {});
    debugPrint('>>> predictRppgMetabolicCardio: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /rppg/predict/stress-reproductive/
  static Future<Map<String, dynamic>> predictRppgStressReproductive() async {
    final r = await _authedPost('/rppg/predict/stress-reproductive/', {});
    debugPrint('>>> predictRppgStressReproductive: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /rppg/predict/anomaly/
  static Future<Map<String, dynamic>> predictRppgAnomaly() async {
    final r = await _authedPost('/rppg/predict/anomaly/', {});
    debugPrint('>>> predictRppgAnomaly: ${r.statusCode}');
    return _decode(r);
  }

  // ── COMPREHENSIVE PREDICTION ──────────────────────────────────────────────

  /// GET /predictions/comprehensive/
  static Future<Map<String, dynamic>> getComprehensivePrediction() async {
    final r = await _authedGet('/predictions/comprehensive/');
    debugPrint('>>> getComprehensivePrediction: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /predictions/comprehensive/  — triggers re-computation
  static Future<Map<String, dynamic>> triggerComprehensivePrediction() async {
    final r = await _authedPost('/predictions/comprehensive/', {});
    debugPrint('>>> triggerComprehensivePrediction: ${r.statusCode}');
    return _decode(r);
  }

  /// GET /predictions/pcos/
  static Future<Map<String, dynamic>> getPcosRiskScore() async {
    final r = await _authedGet('/predictions/pcos/');
    debugPrint('>>> getPcosRiskScore: ${r.statusCode}');
    return _decode(r);
  }

  // ── ESCALATION ────────────────────────────────────────────────────────────

  /// POST /predictions/escalate/mood/
  static Future<Map<String, dynamic>> escalateMood(
      Map<String, dynamic> predictions) async {
    final r = await _authedPost('/predictions/escalate/mood/',
        {'predictions': predictions});
    debugPrint('>>> escalateMood: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /predictions/escalate/menstrual/
  static Future<Map<String, dynamic>> escalateMenstrual(
      Map<String, dynamic> predictions,
      Map<String, bool> criterionFlags) async {
    final r = await _authedPost('/predictions/escalate/menstrual/', {
      'predictions':     predictions,
      'criterion_flags': criterionFlags,
    });
    debugPrint('>>> escalateMenstrual: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /predictions/escalate/rppg/
  static Future<Map<String, dynamic>> escalateRppg(
      Map<String, dynamic> predictions) async {
    final r = await _authedPost('/predictions/escalate/rppg/',
        {'predictions': predictions});
    debugPrint('>>> escalateRppg: ${r.statusCode}');
    return _decode(r);
  }

  // ── MENSTRUAL CYCLE ───────────────────────────────────────────────────────

  /// POST /menstrual/log-cycle
  static Future<Map<String, dynamic>> logMenstrualCycle({
    required String periodStartDate,
    required String periodEndDate,
    required List<int> bleedingScores,
    required bool hasOvulationPeak,
    required bool unusualBleeding,
    int? rppgOvulationDay,
  }) async {
    final body = <String, dynamic>{
      'period_start_date': periodStartDate,
      'period_end_date':   periodEndDate,
      'bleeding_scores':   bleedingScores,
      'has_ovulation_peak': hasOvulationPeak,
      'unusual_bleeding':  unusualBleeding,
    };
    if (rppgOvulationDay != null) body['rppg_ovulation_day'] = rppgOvulationDay;
    final r = await _authedPost('/menstrual/log-cycle', body);
    debugPrint('>>> logMenstrualCycle: ${r.statusCode}');
    return _decode(r);
  }

  /// GET /menstrual/history/
  static Future<Map<String, dynamic>> getMenstrualHistory() async =>
      _decode(await _authedGet('/menstrual/history/'));

  /// POST /menstrual/predict/
  static Future<Map<String, dynamic>> runMenstrualPrediction() async {
    final r = await _authedPost('/menstrual/predict/', {});
    debugPrint('>>> runMenstrualPrediction: ${r.statusCode}');
    return _decode(r);
  }

  /// GET /menstrual/features
  static Future<Map<String, dynamic>> getMenstrualFeatures() async =>
      _decode(await _authedGet('/menstrual/features'));

  /// GET /menstrual/predictions
  static Future<Map<String, dynamic>> getMenstrualPredictionsList() async =>
      _decode(await _authedGet('/menstrual/predictions'));

  /// GET /menstrual/model-info
  static Future<Map<String, dynamic>> getMenstrualModelInfo() async =>
      _decode(await _authedGet('/menstrual/model-info'));

  // ── MOOD & COGNITIVE ──────────────────────────────────────────────────────

  /// POST /mood/log/phq4
  static Future<Map<String, dynamic>> logPHQ4({
    required int item1, required int item2,
    required int item3, required int item4,
    required String logDate,
  }) async =>
      _decode(await _authedPost('/mood/log/phq4', {
        'phq4_item1': item1, 'phq4_item2': item2,
        'phq4_item3': item3, 'phq4_item4': item4,
        'log_date': logDate,
      }));

  /// POST /mood/log/affect
  static Future<Map<String, dynamic>> logAffect({
    required int valence, required int arousal, required String logDate,
  }) async =>
      _decode(await _authedPost('/mood/log/affect', {
        'affect_valence': valence, 'affect_arousal': arousal, 'log_date': logDate,
      }));

  /// POST /mood/log/focus
  static Future<Map<String, dynamic>> logFocus({
    required int focusScore, required int memoryScore,
    required int mentalFatigue, required String logDate,
  }) async =>
      _decode(await _authedPost('/mood/log/focus', {
        'focus_score': focusScore, 'memory_score': memoryScore,
        'mental_fatigue': mentalFatigue, 'log_date': logDate,
        // derive cognitive_load_score (1–5) from average of focus/memory inverted
        'cognitive_load_score': ((20 - focusScore - memoryScore) / 4.0).round().clamp(1, 5),
      }));

  /// POST /mood/log/sleep
  static Future<Map<String, dynamic>> logSleep({
    required int sleepSatisfaction, required double hoursSlept, required String logDate,
  }) async =>
      _decode(await _authedPost('/mood/log/sleep', {
        'sleep_satisfaction': sleepSatisfaction, 'hours_slept': hoursSlept, 'log_date': logDate,
      }));

  /// POST /mood/log/complete
  static Future<Map<String, dynamic>> logCompleteMood({
    required int phq4Item1, required int phq4Item2,
    required int phq4Item3, required int phq4Item4,
    required int affectValence, required int affectArousal,
    required int focusScore, required int memoryScore,
    required int mentalFatigue, required int sleepSatisfaction,
    required double hoursSlept,
    String? cyclePhase,
    required String logDate,
  }) async {
    final body = <String, dynamic>{
      'phq4_item1': phq4Item1, 'phq4_item2': phq4Item2,
      'phq4_item3': phq4Item3, 'phq4_item4': phq4Item4,
      'affect_valence': affectValence, 'affect_arousal': affectArousal,
      'focus_score': focusScore, 'memory_score': memoryScore,
      'mental_fatigue': mentalFatigue, 'sleep_satisfaction': sleepSatisfaction,
      'hours_slept': hoursSlept, 'log_date': logDate,
    };
    if (cyclePhase != null) body['cycle_phase'] = cyclePhase;
    return _decode(await _authedPost('/mood/log/complete', body));
  }

  /// GET /mood/history
  static Future<Map<String, dynamic>> getMoodHistory() async =>
      _decode(await _authedGet('/mood/history'));

  /// GET /mood/log/affect
  static Future<Map<String, dynamic>> getMoodAffect() async =>
      _decode(await _authedGet('/mood/log/affect'));

  /// GET /mood/log/focus
  static Future<Map<String, dynamic>> getMoodFocus() async =>
      _decode(await _authedGet('/mood/log/focus'));

  /// GET /mood/log/sleep
  static Future<Map<String, dynamic>> getMoodSleep() async =>
      _decode(await _authedGet('/mood/log/sleep'));

  /// GET /mood/summary/today/
  static Future<Map<String, dynamic>> getMoodSummaryToday() async =>
      _decode(await _authedGet('/mood/summary/today/'));

  /// GET /mood/predict
  static Future<Map<String, dynamic>> getMoodPredictions() async {
    final r = await _authedGet('/mood/predict');
    debugPrint('>>> getMoodPredictions: ${r.statusCode}');
    return _decode(r);
  }

  /// GET /mood/predictions/latest
  static Future<Map<String, dynamic>> getLatestMoodPredictions() async =>
      _decode(await _authedGet('/mood/predictions/latest'));

  // ── MOOD PREDICTIONS ──────────────────────────────────────────────────────

  /// POST /mood/predict/mental-health
  static Future<Map<String, dynamic>> predictMentalHealth() async {
    final r = await _authedPost('/mood/predict/mental-health', {});
    debugPrint('>>> predictMentalHealth: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /mood/predict/metabolic
  static Future<Map<String, dynamic>> predictMetabolic() async {
    final r = await _authedPost('/mood/predict/metabolic', {});
    debugPrint('>>> predictMetabolic: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /mood/predict/cardio-neuro
  static Future<Map<String, dynamic>> predictCardioNeuro() async {
    final r = await _authedPost('/mood/predict/cardio-neuro', {});
    debugPrint('>>> predictCardioNeuro: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /mood/predict/reproductive
  static Future<Map<String, dynamic>> predictReproductive() async =>
      _decode(await _authedPost('/mood/predict/reproductive', {}));

  // ── LEGACY / NAMED PREDICTION ENDPOINTS ──────────────────────────────────

  /// GET /predictions/latest/
  static Future<Map<String, dynamic>> getLatestPrediction() async {
    final r = await _authedGet('/predictions/latest/');
    debugPrint('>>> getLatestPrediction: ${r.statusCode}');
    return _decode(r);
  }

  /// GET /predictions/history/
  static Future<Map<String, dynamic>> getPredictionHistory() async =>
      _decode(await _authedGet('/predictions/history/'));

  /// GET /predictions/<id>/
  static Future<Map<String, dynamic>> getPrediction(String id) async =>
      _decode(await _authedGet('/predictions/$id/'));

  /// GET /predictions/<id>/features/
  static Future<Map<String, dynamic>> getPredictionFeatures(String id) async =>
      _decode(await _authedGet('/predictions/$id/features/'));

  // ── LAB & ULTRASOUND UPLOAD ───────────────────────────────────────────────

  /// POST /lab-results/upload/
  static Future<Map<String, dynamic>> uploadLabResults(
      Map<String, dynamic> body) async {
    final r = await _authedPost('/lab-results/upload/', body);
    debugPrint('>>> uploadLabResults: ${r.statusCode}');
    return _decode(r);
  }

  /// POST /ultrasound/upload/
  static Future<Map<String, dynamic>> uploadUltrasound(
      Map<String, dynamic> body) async {
    final r = await _authedPost('/ultrasound/upload/', body);
    debugPrint('>>> uploadUltrasound: ${r.statusCode}');
    return _decode(r);
  }

  // ── CYCLE / PERIOD (legacy wrappers) ─────────────────────────────────────

  /// GET /cycle/periods/
  static Future<Map<String, dynamic>> getPeriods() async =>
      _decode(await _authedGet('/cycle/periods/'));

  /// POST /cycle/periods/
  static Future<Map<String, dynamic>> logPeriod(
      Map<String, dynamic> body) async =>
      _decode(await _authedPost('/cycle/periods/', body));

  /// PATCH /cycle/periods/<id>/
  static Future<Map<String, dynamic>> updatePeriod(
      String id, Map<String, dynamic> body) async =>
      _decode(await _authedPatch('/cycle/periods/$id/', body));

  /// GET /cycle/stats/
  static Future<Map<String, dynamic>> getCycleStats() async =>
      _decode(await _authedGet('/cycle/stats/'));

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

  /// GET /notifications/  or  /notifications/?unread_only=true
  static Future<Map<String, dynamic>> getNotifications(
      {bool unreadOnly = false}) async =>
      _decode(await _authedGet(
          unreadOnly ? '/notifications/?unread_only=true' : '/notifications/'));

  /// GET /notifications/unread-count/
  static Future<Map<String, dynamic>> getUnreadNotificationsCount() async =>
      _decode(await _authedGet('/notifications/unread-count/'));

  /// PATCH /notifications/<uuid>/read/
  static Future<Map<String, dynamic>> markNotificationRead(String id) async =>
      _decode(await _authedPatch('/notifications/$id/read/', {}));

  /// PATCH /notifications/mark-all-read/
  static Future<Map<String, dynamic>> markAllNotificationsRead() async =>
      _decode(await _authedPatch('/notifications/mark-all-read/', {}));

  /// DELETE /notifications/<id>/
  static Future<Map<String, dynamic>> deleteNotification(String id) async =>
      _decode(await _authedDelete('/notifications/$id/'));

  // ── PHC / CENTRES ─────────────────────────────────────────────────────────

  /// GET /centers/phc/?state=<state>&lga=<lga>
  static Future<Map<String, dynamic>> getPhcList({
    required String state,
    String lga = '',
  }) async {
    var path = '/centers/phc/?state=${Uri.encodeQueryComponent(state)}';
    if (lga.trim().isNotEmpty) {
      path += '&lga=${Uri.encodeQueryComponent(lga.trim())}';
    }
    return _decode(await http.get(Uri.parse('$_base$path')).timeout(_timeout));
  }

  /// POST /centers/change-request/
  static Future<Map<String, dynamic>> submitChangeRequest({
    required String requestType,
    String? requestedHcc,
    required String description,
  }) async {
    final body = <String, dynamic>{
      'request_type': requestType, 'description': description,
    };
    if (requestedHcc != null && requestedHcc.isNotEmpty) {
      body['requested_hcc'] = requestedHcc;
    }
    return _decode(await _authedPost('/centers/change-request/', body));
  }

  /// GET /centers/change-request/
  static Future<Map<String, dynamic>> getChangeRequests() async =>
      _decode(await _authedGet('/centers/change-request/'));

  /// GET /centers/change-request/<id>/
  static Future<Map<String, dynamic>> getChangeRequest(String id) async =>
      _decode(await _authedGet('/centers/change-request/$id/'));

  // ── SETTINGS ──────────────────────────────────────────────────────────────

  /// GET /settings/notifications/
  static Future<Map<String, dynamic>> getNotificationSettings() async =>
      _decode(await _authedGet('/settings/notifications/'));

  /// PATCH /settings/notifications/
  static Future<Map<String, dynamic>> updateNotificationSettings(
      Map<String, dynamic> body) async =>
      _decode(await _authedPatch('/settings/notifications/', body));

  /// GET /settings/privacy/
  static Future<Map<String, dynamic>> getPrivacySettings() async =>
      _decode(await _authedGet('/settings/privacy/'));

  /// PATCH /settings/privacy/
  static Future<Map<String, dynamic>> updatePrivacySettings(
      Map<String, dynamic> body) async =>
      _decode(await _authedPatch('/settings/privacy/', body));

  /// GET /settings/devices/
  static Future<Map<String, dynamic>> getConnectedDevices() async =>
      _decode(await _authedGet('/settings/devices/'));

  /// POST /settings/devices/
  static Future<Map<String, dynamic>> connectDevice({
    required String deviceType,
    String deviceName = '',
    String syncFrequency = 'daily',
  }) async {
    final body = <String, dynamic>{
      'device_type': deviceType,
      'sync_frequency': syncFrequency,
    };
    if (deviceName.isNotEmpty) body['device_name'] = deviceName;
    return _decode(await _authedPost('/settings/devices/', body));
  }

  /// POST /settings/devices/<id>/sync/
  static Future<Map<String, dynamic>> syncDevice(String id) async =>
      _decode(await _authedPost('/settings/devices/$id/sync/', {}));

  /// DELETE /settings/devices/<id>/
  static Future<Map<String, dynamic>> disconnectDevice(String id) async =>
      _decode(await _authedDelete('/settings/devices/$id/'));

  // ── HELPERS ───────────────────────────────────────────────────────────────

  static String get todayIso {
    final now = DateTime.now();
    return '${now.year}-${now.month.toString().padLeft(2, '0')}-'
        '${now.day.toString().padLeft(2, '0')}';
  }

  static String getSeverityLevel(double riskScore) {
    if (riskScore <= 0.19) return 'Minimal';
    if (riskScore <= 0.39) return 'Mild';
    if (riskScore <= 0.59) return 'Moderate';
    if (riskScore <= 0.79) return 'Severe';
    return 'Extreme';
  }

  static Color getSeverityColor(String severity) {
    switch (severity) {
      case 'Minimal': return AppColors.riskLow;
      case 'Mild':    return AppColors.riskLow;
      case 'Moderate': return AppColors.warningAmber;
      case 'Severe':  return AppColors.riskHigh;
      case 'Extreme': return AppColors.riskCritical;
      default:        return Colors.grey;
    }
  }
}