import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_textstyles.dart';
import 'routes.dart';
import 'disease_risk_calculator.dart';
import 'api_service.dart';

// ══════════════════════════════════════════════════════════════════════════════
// WeeklyToolsScreen
// ══════════════════════════════════════════════════════════════════════════════

class WeeklyToolsScreen extends StatefulWidget {
  const WeeklyToolsScreen({super.key});
  @override
  State<WeeklyToolsScreen> createState() => _WeeklyToolsScreenState();
}

class _WeeklyToolsScreenState extends State<WeeklyToolsScreen> {
  // Session-level cache so done state survives widget recreation
  static final Set<String> _doneCache = {};

  bool   _loadingMfg   = true;
  bool   _mfgDone      = false;
  int    _mfgDaysLeft  = 0;
  int    _mfgLastScore = 0;
  String _mfgLastSev   = '';

  bool _loadingPhq4  = true;
  bool _phq4Done     = false;
  int  _phq4DaysLeft = 0;

  bool _loadingMoodCheck  = true;
  bool _moodCheckDone     = false;
  int  _moodCheckDaysLeft = 0;

  bool _loadingFocus  = true;
  bool _focusDone     = false;
  int  _focusDaysLeft = 0;

  bool _loadingSleep  = true;
  bool _sleepDone     = false;
  int  _sleepDaysLeft = 0;

  String _apiDiag = '';  // diagnostic text when API returns no data

  int get _completedCount =>
      (_mfgDone ? 1 : 0) +
      (_phq4Done ? 1 : 0) +
      (_moodCheckDone ? 1 : 0) +
      (_focusDone ? 1 : 0) +
      (_sleepDone ? 1 : 0);

  static String get _todayKey => DateTime.now().toIso8601String().substring(0, 10);
  static void _markDone(String tool) => _doneCache.add('${_todayKey}_$tool');
  static bool _isCached(String tool) => _doneCache.contains('${_todayKey}_$tool');

  @override
  void initState() {
    super.initState();
    if (_isCached('mfg')) _mfgDone = true;
    if (_isCached('phq4')) _phq4Done = true;
    if (_isCached('mood')) _moodCheckDone = true;
    if (_isCached('focus')) _focusDone = true;
    if (_isCached('sleep')) _sleepDone = true;
    _checkMfg();
    _checkMoodHistory();
  }

  Future<void> _checkMfg() async {
    setState(() => _loadingMfg = true);
    try {
      final result = await ApiService.getMfg();
      final raw    = result['data'];
      final Map<String, dynamic> data;
      if (raw is Map<String, dynamic>) {
        data = raw;
      } else if (raw is List && raw.isNotEmpty && raw.first is Map) {
        data = Map<String, dynamic>.from(raw.first as Map);
      } else {
        data = result;
        if (mounted) setState(() => _apiDiag = 'mfg: no data key. keys=${result.keys} rawType=${raw.runtimeType}');
      }
      final dateStr = data['assessed_date'] as String?
          ?? data['submitted_at']            as String?
          ?? data['created_at']              as String?;
      if (dateStr != null && dateStr.isNotEmpty && mounted) {
        final submitted = DateTime.tryParse(dateStr);
        if (submitted != null) {
          final daysSince = DateTime.now().difference(submitted).inDays;
          if (daysSince < 7) {
            final score = (data['mfg_total_score'] as num?)
                ?? (data['total_score']             as num?)
                ?? (data['score']                   as num?);
            setState(() {
              _mfgDone      = true;
              _mfgDaysLeft  = 7 - daysSince;
              _mfgLastScore = score?.toInt() ?? 0;
              _mfgLastSev   = (data['mfg_severity'] as String?)
                  ?? (data['severity']               as String?) ?? '';
            });
            _markDone('mfg');
          } else if (mounted) {
            setState(() => _apiDiag = 'mfg: date too old ($dateStr, ${daysSince}d ago)');
          }
        } else if (mounted) {
          setState(() => _apiDiag = 'mfg: unparseable date "$dateStr"');
        }
      } else if (mounted) {
        setState(() => _apiDiag = 'mfg: no date field. data keys=${data.keys}');
      }
    } catch (_) {}
    finally { if (mounted) setState(() => _loadingMfg = false); }
  }

  Future<void> _checkMoodHistory() async {
    setState(() {
      _loadingMoodCheck = true;
      _loadingFocus     = true;
      _loadingSleep     = true;
    });
    try {
      final result = await ApiService.getMoodHistory();

      // Try every likely path to find the log list
      List<dynamic> logs = [];
      final raw = result['data'];
      if (raw is List) {
        logs = raw;
      } else if (raw is Map) {
        logs = (raw['results'] as List?) ??
               (raw['logs'] as List?) ??
               (raw['entries'] as List?) ??
               [];
      }
      if (logs.isEmpty) {
        logs = (result['results'] as List?) ??
               (result['logs'] as List?) ??
               [];
      }
      if (logs.isEmpty) {
        for (final v in result.values) {
          if (v is List && v.isNotEmpty && v.first is Map) {
            logs = v;
            break;
          }
        }
      }

      // Fallback: _decode may have failed if the API returned a raw JSON array
      if (logs.isEmpty && result.containsKey('_rawBody')) {
        try {
          final parsed = jsonDecode(result['_rawBody'] as String);
          if (parsed is List) {
            logs = parsed;
          } else if (parsed is Map && parsed['data'] is List) {
            logs = parsed['data'] as List;
          }
        } catch (_) {}
      }

      // Fallback: check individual mood log endpoints
      if (logs.isEmpty) {
        if (!_moodCheckDone) {
          try {
            final aff = await ApiService.getMoodAffect();
            final affData = aff['data'] is Map ? aff['data'] as Map : aff;
            if (affData.containsKey('valence') || affData.containsKey('arousal')) {
              logs.add(affData);
            }
          } catch (_) {}
        }
        if (!_focusDone) {
          try {
            final foc = await ApiService.getMoodFocus();
            final focData = foc['data'] is Map ? foc['data'] as Map : foc;
            if (focData.containsKey('focus_score') || focData.containsKey('memory_score')) {
              logs.add(focData);
            }
          } catch (_) {}
        }
        if (!_sleepDone) {
          try {
            final slp = await ApiService.getMoodSleep();
            final slpData = slp['data'] is Map ? slp['data'] as Map : slp;
            if (slpData.containsKey('sleep_satisfaction') || slpData.containsKey('hours_slept')) {
              logs.add(slpData);
            }
          } catch (_) {}
        }
      }

      if (logs.isEmpty || !mounted) {
        if (mounted && logs.isEmpty) {
          setState(() => _apiDiag = 'history: no logs. keys=${result.keys}');
        }
        return;
      }

      final today = DateTime.now();

      for (final log in logs) {
        final entry = log is Map<String, dynamic> ? log : <String, dynamic>{};
        final dateStr = entry['logDate'] as String?
            ?? entry['log_date'] as String?
            ?? entry['date'] as String?
            ?? entry['created_at'] as String?
            ?? entry['assessed_date'] as String?;
        int daysLeft = 7;
        if (dateStr != null && dateStr.isNotEmpty) {
          final submitted = DateTime.tryParse(dateStr);
          if (submitted != null) {
            final dayKey = DateTime(today.year, today.month, today.day);
            final daySub = DateTime(submitted.year, submitted.month, submitted.day);
            final daysSince = dayKey.difference(daySub).inDays;
            if (daysSince >= 7) continue;
            daysLeft = 7 - daysSince;
          }
        }

        // Check for affect / mood check (possibly nested)
        final affectBlock = entry['affect'] as Map?;
        final hasAffect =
            (affectBlock != null && (affectBlock['valence'] != null || affectBlock['arousal'] != null)) ||
            entry.containsKey('affectValence') ||
            entry.containsKey('affect_valence') ||
            entry.containsKey('affectArousal') ||
            entry.containsKey('affect_arousal') ||
            entry.containsKey('valence') ||
            entry.containsKey('arousal');
        if (!_moodCheckDone && hasAffect) {
          setState(() { _moodCheckDone = true; _moodCheckDaysLeft = daysLeft; });
          _markDone('mood');
        }

        // Check for focus & memory (possibly nested)
        final cogBlock = entry['cognitive'] as Map?;
        final hasFocus =
            (cogBlock != null && (cogBlock['focus_score'] != null || cogBlock['memory_score'] != null)) ||
            entry.containsKey('focusScore') ||
            entry.containsKey('focus_score') ||
            entry.containsKey('memoryScore') ||
            entry.containsKey('memory_score') ||
            entry.containsKey('mentalFatigue') ||
            entry.containsKey('mental_fatigue') ||
            entry.containsKey('cognitiveLoadScore') ||
            entry.containsKey('cognitive_load_score');
        if (!_focusDone && hasFocus) {
          setState(() { _focusDone = true; _focusDaysLeft = daysLeft; });
          _markDone('focus');
        }

        // Check for sleep (possibly nested)
        final sleepBlock = entry['sleep'] as Map?;
        final hasSleep =
            (sleepBlock != null && (sleepBlock['sleep_satisfaction'] != null || sleepBlock['hours_slept'] != null)) ||
            entry.containsKey('sleepSatisfaction') ||
            entry.containsKey('sleep_satisfaction') ||
            entry.containsKey('hoursSlept') ||
            entry.containsKey('hours_slept') ||
            entry.containsKey('sleep_quality');
        if (!_sleepDone && hasSleep) {
          setState(() { _sleepDone = true; _sleepDaysLeft = daysLeft; });
          _markDone('sleep');
        }

        // Check for PHQ-4 (from the same GET /mood/history response)
        final hasPhq4 = entry.containsKey('phq4Item1') ||
            entry.containsKey('phq4_item1');
        if (!_phq4Done && hasPhq4) {
          setState(() { _phq4Done = true; _phq4DaysLeft = daysLeft; });
          _markDone('phq4');
        }
      }
    } catch (_) {}
    finally {
      if (mounted) setState(() {
        _loadingMoodCheck = false;
        _loadingFocus     = false;
        _loadingSleep     = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(children: [
        Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.gradientStart, AppColors.gradientEnd],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(8, 4, 16, 20),
              child: Row(children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(width: 4),
                const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Weekly Tools',
                      style: TextStyle(color: Colors.white, fontSize: 20,
                          fontWeight: FontWeight.w700)),
                  Text('Complete your weekly health check-ins',
                      style: TextStyle(color: Colors.white70, fontSize: 13)),
                ]),
              ]),
            ),
          ),
        ),

        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text('Your Weekly Check-ins',
                      style: AppTextStyles.cardTitle.copyWith(fontSize: 15)),
                  const SizedBox(height: 6),
                  Text(
                    'Complete all check-ins once a week. Each one only takes '
                    'a minute and helps track how you are feeling over time.',
                    style: AppTextStyles.cardSubtitle,
                  ),
                ]),
              ),
              const SizedBox(height: 16),

              _loadingMfg
                  ? const _LoadingCard(title: 'Hirsutism Score')
                  : _mfgDone
                      ? _LockedCard(
                          icon: Icons.content_cut_outlined,
                          title: 'Hirsutism Score',
                          subtitle: 'Rate hair growth across different areas',
                          daysRemaining: _mfgDaysLeft,
                          lastScore: _mfgLastScore,
                          lastSeverity: _mfgLastSev,
                        )
                      : _AssessmentCard(
                          icon: Icons.content_cut_outlined,
                          iconBg: const Color(0xFF2AAFAA),
                          title: 'Hirsutism Score',
                          subtitle: 'Rate hair growth across different areas',
                          description:
                              'Score hair growth on 9 areas of your body. '
                              'Helps track changes linked to your hormonal health.',
                          frequency: 'Weekly',
                          lastDone: 'Not done this week',
                          isDue: true,
                          onTap: () async {
                            final saved = await Navigator.pushNamed(context, AppRoutes.mfgScreen);
                            if (saved == true) {
                              _markDone('mfg');
                              _checkMfg();
                            }
                          },
                        ),
              const SizedBox(height: 12),

              _loadingPhq4
                  ? const _LoadingCard(title: 'Mental Wellness')
                  : _phq4Done
                      ? _LockedCard(
                          icon: Icons.psychology_outlined,
                          title: 'Mental Wellness',
                          subtitle: 'How have you been feeling emotionally?',
                          daysRemaining: _phq4DaysLeft,
                          lastScore: null,
                          lastSeverity: '',
                        )
                      : _AssessmentCard(
                          icon: Icons.psychology_outlined,
                          iconBg: const Color(0xFF2AAFAA),
                          title: 'Mental Wellness',
                          subtitle: 'How have you been feeling emotionally?',
                          description:
                              'Answer 4 quick questions about your mood and '
                              'anxiety over the past week.',
                          frequency: 'Weekly',
                          lastDone: 'Not done this week',
                          isDue: true,
                          onTap: () async {
                            final saved = await Navigator.pushNamed(context, AppRoutes.phq4Screen);
                            if (saved == true) {
                              _markDone('phq4');
                              _checkMoodHistory();
                            }
                          },
                        ),
              const SizedBox(height: 12),

              _loadingMoodCheck
                  ? const _LoadingCard(title: 'Mood Check')
                  : _moodCheckDone
                      ? _LockedCard(
                          icon: Icons.grid_view_outlined,
                          title: 'Mood Check',
                          subtitle: 'How are you feeling right now?',
                          daysRemaining: _moodCheckDaysLeft,
                          lastScore: null,
                          lastSeverity: '',
                        )
                      : _AssessmentCard(
                          icon: Icons.grid_view_outlined,
                          iconBg: const Color(0xFF7B5EA7),
                          title: 'Mood Check',
                          subtitle: 'How are you feeling right now?',
                          description:
                              'Pick your energy and mood on a simple grid. '
                              'Takes less than 10 seconds.',
                          frequency: 'Weekly',
                          lastDone: '',
                          isDue: true,
                          onTap: () async {
                            final saved = await Navigator.pushNamed(context, AppRoutes.affectGridScreen);
                            if (saved == true) {
                              _markDone('mood');
                              _checkMoodHistory();
                            }
                          },
                        ),
              const SizedBox(height: 12),

              _loadingFocus
                  ? const _LoadingCard(title: 'Focus & Memory')
                  : _focusDone
                      ? _LockedCard(
                          icon: Icons.lightbulb_outline,
                          title: 'Focus & Memory',
                          subtitle: 'How sharp have you felt this week?',
                          daysRemaining: _focusDaysLeft,
                          lastScore: null,
                          lastSeverity: '',
                        )
                      : _AssessmentCard(
                          icon: Icons.lightbulb_outline,
                          iconBg: const Color(0xFF3A7BD5),
                          title: 'Focus & Memory',
                          subtitle: 'How sharp have you felt this week?',
                          description:
                              'Rate how well you have been able to concentrate and '
                              'remember things over the past week.',
                          frequency: 'Weekly',
                          lastDone: '',
                          isDue: true,
                          onTap: () async {
                            final saved = await Navigator.pushNamed(context, AppRoutes.cognitiveLoadScreen);
                            if (saved == true) {
                              _markDone('focus');
                              _checkMoodHistory();
                            }
                          },
                        ),
              const SizedBox(height: 12),

              _loadingSleep
                  ? const _LoadingCard(title: 'Sleep Quality')
                  : _sleepDone
                      ? _LockedCard(
                          icon: Icons.bedtime_outlined,
                          title: 'Sleep Quality',
                          subtitle: 'How well did you sleep last night?',
                          daysRemaining: _sleepDaysLeft,
                          lastScore: null,
                          lastSeverity: '',
                        )
                      : _AssessmentCard(
                          icon: Icons.bedtime_outlined,
                          iconBg: const Color(0xFF1A6B7A),
                          title: 'Sleep Quality',
                          subtitle: 'How well did you sleep last night?',
                          description:
                              'Rate the quality of your sleep and how many hours you got.',
                          frequency: 'Weekly',
                          lastDone: '',
                          isDue: true,
                          onTap: () async {
                            final saved = await Navigator.pushNamed(context, AppRoutes.sleepSatisfactionScreen);
                            if (saved == true) {
                              _markDone('sleep');
                              _checkMoodHistory();
                            }
                          },
                        ),
              const SizedBox(height: 16),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                    Text("This Week's Progress",
                        style: AppTextStyles.cardTitle.copyWith(fontSize: 14)),
                    Text('$_completedCount/5 completed',
                        style: AppTextStyles.cardSubtitle),
                  ]),
                  const SizedBox(height: 10),
                  Row(
                    children: List.generate(5, (i) => Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(right: i < 4 ? 6 : 0),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: i < _completedCount ? 1.0 : 0.0,
                            minHeight: 6,
                            backgroundColor: AppColors.progressBg,
                            valueColor: const AlwaysStoppedAnimation<Color>(
                                AppColors.progressFill),
                          ),
                        ),
                      ),
                    )),
                  ),
                ]),
              ),
              const SizedBox(height: 8),
              if (_apiDiag.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(_apiDiag, style: TextStyle(
                      fontSize: 11, color: Colors.red.shade800, fontFamily: 'monospace')),
                ),
              ],
            ]),
          ),
        ),
      ]),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// Shared card widgets
// ══════════════════════════════════════════════════════════════════════════════

class _LoadingCard extends StatelessWidget {
  final String title;
  const _LoadingCard({required this.title});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: AppTextStyles.cardTitle.copyWith(fontSize: 15)),
              const SizedBox(height: 8),
              const LinearProgressIndicator(
                minHeight: 4,
                backgroundColor: AppColors.cardBorder,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ]),
          ),
        ]),
      );
}

class _LockedCard extends StatelessWidget {
  final IconData icon;
  final String   title, subtitle, lastSeverity;
  final int      daysRemaining;
  final int?     lastScore;

  const _LockedCard({
    required this.icon, required this.title, required this.subtitle,
    required this.daysRemaining, required this.lastScore, required this.lastSeverity,
  });

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: AppColors.cardBorder,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.textMedium, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Text(title, style: AppTextStyles.cardTitle.copyWith(fontSize: 15))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.riskLow.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.check_circle, size: 11, color: AppColors.riskLow),
                    const SizedBox(width: 3),
                    Text('Done', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600,
                        color: AppColors.riskLow)),
                  ]),
                ),
              ]),
              const SizedBox(height: 2),
              Text(subtitle, style: AppTextStyles.cardSubtitle),
              if (lastScore != null && lastScore! > 0) ...[
                const SizedBox(height: 6),
                Text(
                  lastSeverity.isNotEmpty
                      ? 'Last score: $lastScore  •  $lastSeverity'
                      : 'Last score: $lastScore',
                  style: AppTextStyles.smallText.copyWith(color: AppColors.textDark),
                ),
              ],
              const SizedBox(height: 6),
              Row(children: [
                Icon(Icons.lock_clock_outlined, size: 12, color: AppColors.textLight),
                const SizedBox(width: 4),
                Text(
                  'Available again in $daysRemaining day${daysRemaining == 1 ? '' : 's'}',
                  style: AppTextStyles.smallText.copyWith(color: AppColors.textLight),
                ),
              ]),
            ]),
          ),
        ]),
      );
}

class _AssessmentCard extends StatelessWidget {
  final IconData icon;
  final Color    iconBg;
  final String   title, subtitle, description, frequency, lastDone;
  final bool     isDue;
  final VoidCallback onTap;

  const _AssessmentCard({
    required this.icon, required this.iconBg, required this.title,
    required this.subtitle, required this.description, required this.frequency,
    required this.lastDone, required this.isDue, required this.onTap,
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceWhite,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder),
          ),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: iconBg, borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Expanded(child: Text(title, style: AppTextStyles.cardTitle.copyWith(fontSize: 15))),
                  if (isDue)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.warningLight,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.warningAmber.withOpacity(0.3)),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(Icons.access_time, size: 11, color: AppColors.warningAmber),
                        const SizedBox(width: 3),
                        Text('Due', style: TextStyle(fontSize: 11,
                            fontWeight: FontWeight.w600, color: AppColors.warningAmber)),
                      ]),
                    ),
                ]),
                const SizedBox(height: 2),
                Text(subtitle, style: AppTextStyles.cardSubtitle),
                const SizedBox(height: 6),
                Text(description, style: AppTextStyles.cardSubtitle.copyWith(color: AppColors.textMedium)),
                const SizedBox(height: 8),
                Row(children: [
                  Icon(Icons.access_time, size: 12, color: AppColors.textLight),
                  const SizedBox(width: 4),
                  Text(frequency, style: AppTextStyles.smallText.copyWith(color: AppColors.textLight)),
                  if (lastDone.isNotEmpty) ...[
                    const SizedBox(width: 12),
                    Text(lastDone, style: AppTextStyles.smallText.copyWith(color: AppColors.textLight)),
                  ],
                ]),
              ]),
            ),
            const Icon(Icons.chevron_right, size: 20, color: AppColors.textMedium),
          ]),
        ),
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// MfgScreen
// ══════════════════════════════════════════════════════════════════════════════

class _Zone {
  final String name, description, emoji, apiKey;
  const _Zone(this.name, this.description, this.emoji, this.apiKey);
}

class MfgScreen extends StatefulWidget {
  const MfgScreen({super.key});
  @override
  State<MfgScreen> createState() => _MfgScreenState();
}

class _MfgScreenState extends State<MfgScreen> {
  bool    _showResults  = false;
  bool    _submitting   = false;
  bool    _submitted    = false;
  bool    _loadingRisks = false;
  String? _errorMsg;
  List<DiseaseRisk> _diseaseRisks = [];
  final Map<int, int> _scores = {};

  static const _zones = [
    _Zone('Upper Lip',     'Above the lip, below the nose',      '👄', 'mfg_upper_lip'),
    _Zone('Chin',          'Chin and jawline area',               '👄', 'mfg_chin'),
    _Zone('Chest',         'Between and around the breasts',      '🫁', 'mfg_chest'),
    _Zone('Upper Back',    'Upper back and shoulders',            '🔙', 'mfg_upper_back'),
    _Zone('Lower Back',    'Lower back above buttocks',           '⬇️', 'mfg_lower_back'),
    _Zone('Upper Abdomen', 'Above the navel',                     '⬆️', 'mfg_upper_abdomen'),
    _Zone('Lower Abdomen', 'Below the navel',                     '⬇️', 'mfg_lower_abdomen'),
    _Zone('Upper Arm',     'Shoulders to elbows',                 '💪', 'mfg_upper_arm'),
    _Zone('Thigh',         'Upper inner and outer thighs',        '🦵', 'mfg_thigh'),
  ];

  int    get _total => _scores.values.fold(0, (a, b) => a + b);
  String get _interpretation {
    if (_total < 8)  return 'Normal';
    if (_total < 15) return 'Mild';
    if (_total < 20) return 'Moderate';
    return 'Severe';
  }
  Color get _interpretationColor {
    if (_total < 8)  return AppColors.riskLow;
    if (_total < 15) return AppColors.warningAmber;
    return AppColors.riskHigh;
  }

  void _openZoneSheet(int index) {
    int tempScore = _scores[index] ?? 0;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => StatefulBuilder(
        builder: (ctx, setModal) => Padding(
          padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Column(mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            Center(child: Container(width: 40, height: 4,
                decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 16),
            Text(_zones[index].name, style: AppTextStyles.cardTitle.copyWith(fontSize: 17)),
            const SizedBox(height: 4),
            Text(_zones[index].description, style: AppTextStyles.cardSubtitle),
            const SizedBox(height: 20),
            Text('Score (0 = no hair, 4 = dense coverage)', style: AppTextStyles.inputLabel),
            const SizedBox(height: 12),
            Row(children: List.generate(5, (s) => Expanded(
              child: Padding(
                padding: EdgeInsets.only(right: s < 4 ? 8 : 0),
                child: GestureDetector(
                  onTap: () => setModal(() => tempScore = s),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: tempScore == s ? AppColors.primary : AppColors.surfaceWhite,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: tempScore == s ? AppColors.primary : AppColors.cardBorder),
                    ),
                    child: Text('$s', textAlign: TextAlign.center,
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16,
                            color: tempScore == s ? Colors.white : AppColors.textDark)),
                  ),
                ),
              ),
            ))),
            const SizedBox(height: 20),
            SizedBox(width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  setState(() => _scores[index] = tempScore);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Save', style: TextStyle(color: Colors.white,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
          ]),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() { _submitting = true; _errorMsg = null; });
    try {
      final body = <String, dynamic>{
        'assessed_date': DateTime.now().toIso8601String().substring(0, 10),
      };
      for (int i = 0; i < _zones.length; i++) {
        body[_zones[i].apiKey] = _scores[i] ?? 0;
      }
      final ok = await ApiService.submitMfg(body);
      if (!mounted) return;

      if (ok) {
        setState(() { _submitted = true; _showResults = true; _loadingRisks = true; });

        DiseaseRiskCalculator.fetchMoodPredictions().then((risks) {
          if (mounted) setState(() { _diseaseRisks = risks; _loadingRisks = false; });
        }).catchError((_) {
          if (mounted) setState(() => _loadingRisks = false);
        });

        final hirsutismScore = _scores.values.fold<int>(0, (sum, s) => sum + s);
        final riskScore = (hirsutismScore / 48.0).clamp(0.0, 1.0);
        ApiService.escalateMood({
          'Hirsutism': {
            'risk_score': riskScore,
            'severity': riskScore > 0.6 ? 'Severe' : riskScore > 0.4 ? 'Moderate' : 'Mild',
          },
        }).catchError((_) => <String, dynamic>{});
        ApiService.triggerComprehensivePrediction();
      } else {
        setState(() {
          _errorMsg = 'Could not save results.';
          _showResults = true;
        });
      }
    } on TimeoutException {
      if (mounted) setState(() {
        _errorMsg = 'Server is starting up — please try again.';
        _showResults = true;
      });
    } catch (_) {
      if (mounted) setState(() {
        _errorMsg = 'Network error. Results shown were not saved.';
        _showResults = true;
      });
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.surfaceWhite,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, size: 20, color: AppColors.textDark),
            onPressed: () => Navigator.pop(context),
          ),
          titleSpacing: 0,
          title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
            Text('Hirsutism Score',
                style: TextStyle(color: AppColors.textDark, fontSize: 17,
                    fontWeight: FontWeight.w700)),
            Text('Modified Ferriman-Gallwey (mFG) Assessment',
                style: TextStyle(fontSize: 12, color: AppColors.textMedium)),
          ]),
        ),
        body: _showResults ? _buildResults() : _buildAssessment(),
      );

  Widget _buildAssessment() => Column(children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.cardBorder)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('RUNNING TOTAL',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                              color: AppColors.textMedium, letterSpacing: 0.8)),
                      const SizedBox(height: 4),
                      RichText(
                          text: TextSpan(children: [
                        TextSpan(text: '$_total',
                            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800,
                                color: AppColors.textDark)),
                        const TextSpan(text: ' / 36',
                            style: TextStyle(fontSize: 15, color: AppColors.textMedium)),
                      ])),
                    ]),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                      decoration: BoxDecoration(
                          color: _interpretationColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20)),
                      child: Text(_interpretation,
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700,
                              color: _interpretationColor)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withOpacity(0.15))),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Icon(Icons.info_outline, size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(child: Text(
                    'Rate each body zone from 0 (no terminal hair) to 4 '
                    '(dense/dark coverage). A total score \u2265 8 suggests clinical hirsutism. '
                    'Submittable once per week.',
                    style: AppTextStyles.cardSubtitle)),
                ]),
              ),
              const SizedBox(height: 12),
              ..._zones.asMap().entries.map((e) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: GestureDetector(
                      onTap: () => _openZoneSheet(e.key),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                        decoration: BoxDecoration(
                            color: AppColors.surfaceWhite,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.cardBorder)),
                        child: Row(children: [
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                                color: AppColors.background,
                                borderRadius: BorderRadius.circular(10)),
                            child: Center(
                                child: Text(e.value.emoji,
                                    style: const TextStyle(fontSize: 20))),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                              child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                Text(e.value.name,
                                    style: AppTextStyles.cardTitle.copyWith(fontSize: 14)),
                                const SizedBox(height: 2),
                                Text(e.value.description,
                                    style: AppTextStyles.cardSubtitle),
                              ])),
                          Container(
                            width: 32, height: 32,
                            decoration: BoxDecoration(
                                color: AppColors.background,
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.cardBorder)),
                            child: Center(
                                child: Text('${_scores[e.key] ?? 0}',
                                    style: AppTextStyles.cardTitle.copyWith(fontSize: 13))),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.chevron_right,
                              size: 18, color: AppColors.textMedium),
                        ]),
                      ),
                    ),
                  )),
            ]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: SizedBox(
            width: double.infinity,
            child: _submitting
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _scores.values.any((s) => s > 0) ? _submit : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      disabledBackgroundColor: AppColors.progressBg,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text('Submit & View Results',
                        style: TextStyle(
                            color: _scores.values.any((s) => s > 0)
                                ? Colors.white : AppColors.textLight,
                            fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
          ),
        ),
      ]);

  Widget _buildResults() => Column(children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              if (_submitted)
                _SuccessBanner(message: 'Results saved. Next assessment available in 7 days.'),
              if (_errorMsg != null)
                Padding(padding: const EdgeInsets.only(top: 12),
                    child: _WarningBanner(message: _errorMsg!)),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                    color: AppColors.surfaceWhite,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.cardBorder)),
                child: Column(children: [
                  Text('$_total',
                      style: const TextStyle(fontSize: 56, fontWeight: FontWeight.w800,
                          color: AppColors.textDark, height: 1.0)),
                  const SizedBox(height: 4),
                  Text('out of 36', style: AppTextStyles.cardSubtitle),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                        color: _interpretationColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20)),
                    child: Text(_interpretation,
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                            color: _interpretationColor)),
                  ),
                  const SizedBox(height: 20),
                  ..._zones.asMap().entries.map((e) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(children: [
                          Expanded(
                              child: Text(e.value.name,
                                  style: AppTextStyles.cardSubtitle
                                      .copyWith(color: AppColors.textDark))),
                          SizedBox(
                            width: 120,
                            child: LinearProgressIndicator(
                              value: (_scores[e.key] ?? 0) / 4,
                              minHeight: 4,
                              backgroundColor: AppColors.cardBorder,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  (_scores[e.key] ?? 0) == 0
                                      ? AppColors.cardBorder
                                      : AppColors.riskHigh),
                            ),
                          ),
                          const SizedBox(width: 10),
                          SizedBox(
                            width: 16,
                            child: Text('${_scores[e.key] ?? 0}',
                                style: AppTextStyles.cardTitle.copyWith(fontSize: 13),
                                textAlign: TextAlign.right),
                          ),
                        ]),
                      )),
                ]),
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      const Icon(Icons.monitor_heart, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      const Text('Disease Risk Predictions',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                              color: AppColors.textDark)),
                      const Spacer(),
                      if (_loadingRisks)
                        const SizedBox(width: 16, height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2)),
                    ]),
                    const SizedBox(height: 4),
                    Text('From your mood & mental health assessment',
                        style: AppTextStyles.cardSubtitle.copyWith(fontSize: 11)),
                    const SizedBox(height: 12),
                    if (_loadingRisks)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Center(child: Text('Computing risk predictions...',
                            style: TextStyle(fontSize: 13, color: AppColors.textMedium))),
                      )
                    else if (_diseaseRisks.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text(
                          'Risk predictions require at least 3 days of mood log data. '
                          'Keep completing your daily check-ins to unlock predictions.',
                          style: AppTextStyles.cardSubtitle,
                        ),
                      )
                    else ...[
                      RiskSummaryBanner(risks: _diseaseRisks),
                      const SizedBox(height: 12),
                      ..._diseaseRisks.map((risk) => DiseaseRiskCard(risk: risk)),
                    ],
                  ],
                ),
              ),
            ]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _showResults = false),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Edit Scores', style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Done', style: TextStyle(color: Colors.white,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
          ]),
        ),
      ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// Phq4Screen — PHQ-4 with depression ≥3 trigger fix
// ══════════════════════════════════════════════════════════════════════════════

class Phq4Screen extends StatefulWidget {
  const Phq4Screen({super.key});
  @override
  State<Phq4Screen> createState() => _Phq4ScreenState();
}

class _Phq4ScreenState extends State<Phq4Screen> {
  final List<int?> _answers = [null, null, null, null];
  bool _showResults  = false;
  bool _showPreview  = false;
  bool _submitted    = false;
  bool _submitting   = false;
  bool _loadingRisks = false;
  String? _errorMsg;
  List<DiseaseRisk> _diseaseRisks = [];

  static const _gad2Questions = [
    'In the last week, how often have you felt nervous, anxious, or on edge?',
    'In the last week, how often have you been unable to stop or control worrying?',
  ];

  static const _phq2Questions = [
    'In the last week, how often have you had little interest or pleasure in doing things?',
    'In the last week, how often have you felt down, depressed, or hopeless?',
  ];

  static const _options = [
    '0  —  Not at all',
    '1  —  Several days',
    '2  —  More than half the days',
    '3  —  Nearly every day',
  ];

  int    get _total           => _answers.fold(0, (s, v) => s + (v ?? 0));
  int    get _anxietyScore    => (_answers[0] ?? 0) + (_answers[1] ?? 0);
  int    get _depressionScore => (_answers[2] ?? 0) + (_answers[3] ?? 0);
  bool   get _complete        => _answers.every((a) => a != null);
  bool   get _depressionFlag  => _depressionScore >= 3;

  String get _interpretation {
    if (_total <= 2) return 'Normal';
    if (_total <= 5) return 'Mild';
    if (_total <= 8) return 'Moderate';
    return 'Severe';
  }
  Color get _interpretationColor {
    if (_total <= 2) return AppColors.riskLow;
    if (_total <= 5) return AppColors.warningAmber;
    return AppColors.riskHigh;
  }

  String _subLabel(int score) {
    if (score <= 1) return 'Normal';
    if (score <= 2) return 'Mild';
    return 'Elevated';
  }
  Color _subColor(int score) {
    if (score <= 1) return AppColors.riskLow;
    if (score <= 2) return AppColors.warningAmber;
    return AppColors.riskHigh;
  }

  void _togglePreview() => setState(() => _showPreview = !_showPreview);

  Future<void> _submit() async {
    if (!_complete) return;
    setState(() { _submitting = true; _errorMsg = null; });
    try {
      final result = await ApiService.logPHQ4(
        item1: _answers[0]!, item2: _answers[1]!,
        item3: _answers[2]!, item4: _answers[3]!,
        logDate: ApiService.todayIso,
      );
      if (!mounted) return;

      if (ApiService.isSuccess(result)) {
        if (mounted) Navigator.pop(context, true);

        DiseaseRiskCalculator.fetchMoodPredictions().then((risks) {
          if (mounted) setState(() { _diseaseRisks = risks; });
        }).catchError((_) {});
        final anxScore = ((_answers[0]! + _answers[1]!) / 6.0).clamp(0.0, 1.0);
        final depScore = ((_answers[2]! + _answers[3]!) / 6.0).clamp(0.0, 1.0);
        ApiService.escalateMood({
          'Anxiety': {
            'risk_score': anxScore,
            'severity': anxScore > 0.6 ? 'Severe' : anxScore > 0.4 ? 'Moderate' : 'Mild',
          },
          'Depression': {
            'risk_score': depScore,
            'severity': depScore > 0.6 ? 'Severe' : depScore > 0.4 ? 'Moderate' : 'Mild',
          },
        }).catchError((_) => <String, dynamic>{});
        ApiService.triggerComprehensivePrediction();
      } else {
        setState(() {
          _errorMsg = (result['message'] as String?) ?? 'Could not save results.';
          _showResults = true;
        });
      }
    } on TimeoutException {
      if (mounted) setState(() {
        _errorMsg = 'Server is starting up — please try again.';
        _showResults = true;
      });
    } catch (_) {
      if (mounted) setState(() {
        _errorMsg = 'Network error. Results shown were not saved.';
        _showResults = true;
      });
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: Column(children: [
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.gradientStart, AppColors.gradientEnd],
                begin: Alignment.topLeft, end: Alignment.bottomRight,
              ),
            ),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(8, 4, 16, 20),
                child: Row(children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 4),
                  const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Mental Wellness', style: TextStyle(color: Colors.white, fontSize: 20,
                        fontWeight: FontWeight.w700)),
                    Text('How have you been feeling this week?',
                        style: TextStyle(color: Colors.white70, fontSize: 13)),
                  ]),
                ]),
              ),
            ),
          ),
          Expanded(child: _showResults
              ? _buildResults()
              : _showPreview ? _buildPreview() : _buildQuestions()),
        ]),
      );

  Widget _buildQuestions() => Column(children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: const Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Icon(Icons.info_outline, size: 16, color: AppColors.primary),
                  SizedBox(width: 8),
                  Expanded(child: Text(
                    'Over the last week, how often have you been bothered by the following problems?',
                    style: TextStyle(fontSize: 13, color: AppColors.textMedium),
                  )),
                ]),
              ),
              const SizedBox(height: 20),
              const Text('GAD-2 — Anxiety', style: TextStyle(fontSize: 14,
                  fontWeight: FontWeight.w700, color: Color(0xFF2A7FD4))),
              const SizedBox(height: 12),
              ...List.generate(2, (i) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: _QuestionCard(
                      question: _gad2Questions[i], options: _options,
                      selected: _answers[i],
                      onSelect: (v) => setState(() => _answers[i] = v),
                    ),
                  )),
              const SizedBox(height: 8),
              const Text('PHQ-2 — Depression', style: TextStyle(fontSize: 14,
                  fontWeight: FontWeight.w700, color: Color(0xFF8B45C8))),
              const SizedBox(height: 12),
              ...List.generate(2, (i) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: _QuestionCard(
                      question: _phq2Questions[i], options: _options,
                      selected: _answers[i + 2],
                      onSelect: (v) => setState(() => _answers[i + 2] = v),
                    ),
                  )),
            ]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: SizedBox(
            width: double.infinity,
            child: _submitting
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _complete ? _togglePreview : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      disabledBackgroundColor: AppColors.progressBg,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: Text('Preview Results',
                        style: TextStyle(
                            color: _complete ? Colors.white : AppColors.textLight,
                            fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
          ),
        ),
      ]);

  Widget _buildPreview() => Column(children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(children: [
                  Text('$_total', style: const TextStyle(fontSize: 64, fontWeight: FontWeight.w800,
                      color: AppColors.textDark, height: 1.0)),
                  const SizedBox(height: 4),
                  Text('out of 12', style: AppTextStyles.cardSubtitle),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: _interpretationColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(_interpretation, style: TextStyle(fontSize: 14,
                        fontWeight: FontWeight.w700, color: _interpretationColor)),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              Row(children: [
                Expanded(child: _SubScoreCard(
                  label: 'GAD-2 Anxiety', labelColor: const Color(0xFF2A7FD4),
                  score: _anxietyScore, max: 6,
                  statusLabel: _subLabel(_anxietyScore), statusColor: _subColor(_anxietyScore),
                )),
                const SizedBox(width: 12),
                Expanded(child: _SubScoreCard(
                  label: 'PHQ-2 Depression', labelColor: const Color(0xFF8B45C8),
                  score: _depressionScore, max: 6,
                  statusLabel: _subLabel(_depressionScore), statusColor: _subColor(_depressionScore),
                )),
              ]),
              if (_depressionFlag) ...[
                const SizedBox(height: 14),
                _depressionSupportCard(),
              ],
            ]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _showPreview = false),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Edit Answers', style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: _submitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _submitting
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Save & Get Risk Assessment',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
              ),
            ),
          ]),
        ),
      ]);

  Widget _buildResults() => Column(children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              if (_submitted)
                _SuccessBanner(message: 'Results saved. Next assessment available in 7 days.'),
              if (_errorMsg != null)
                Padding(padding: const EdgeInsets.only(top: 12),
                    child: _WarningBanner(message: _errorMsg!)),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(children: [
                  Text('$_total', style: const TextStyle(fontSize: 64, fontWeight: FontWeight.w800,
                      color: AppColors.textDark, height: 1.0)),
                  const SizedBox(height: 4),
                  Text('out of 12', style: AppTextStyles.cardSubtitle),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: _interpretationColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(_interpretation, style: TextStyle(fontSize: 14,
                        fontWeight: FontWeight.w700, color: _interpretationColor)),
                  ),
                ]),
              ),
              const SizedBox(height: 14),
              Row(children: [
                Expanded(child: _SubScoreCard(
                  label: 'GAD-2 Anxiety', labelColor: const Color(0xFF2A7FD4),
                  score: _anxietyScore, max: 6,
                  statusLabel: _subLabel(_anxietyScore), statusColor: _subColor(_anxietyScore),
                )),
                const SizedBox(width: 12),
                Expanded(child: _SubScoreCard(
                  label: 'PHQ-2 Depression', labelColor: const Color(0xFF8B45C8),
                  score: _depressionScore, max: 6,
                  statusLabel: _subLabel(_depressionScore), statusColor: _subColor(_depressionScore),
                )),
              ]),
              if (_depressionFlag) ...[
                const SizedBox(height: 14),
                _depressionSupportCard(),
              ],
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      const Icon(Icons.monitor_heart, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      const Text('Disease Risk Predictions',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                              color: AppColors.textDark)),
                      const Spacer(),
                      if (_loadingRisks)
                        const SizedBox(width: 16, height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2)),
                    ]),
                    const SizedBox(height: 4),
                    Text('From your mood & mental health assessment',
                        style: AppTextStyles.cardSubtitle.copyWith(fontSize: 11)),
                    const SizedBox(height: 12),
                    if (_loadingRisks)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Center(child: Text('Computing risk predictions...',
                            style: TextStyle(fontSize: 13, color: AppColors.textMedium))),
                      )
                    else if (_diseaseRisks.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text(
                          'Risk predictions require at least 3 days of mood log data. '
                          'Keep completing your daily check-ins to unlock predictions.',
                          style: AppTextStyles.cardSubtitle,
                        ),
                      )
                    else ...[
                      RiskSummaryBanner(risks: _diseaseRisks),
                      const SizedBox(height: 12),
                      ..._diseaseRisks.map((risk) => DiseaseRiskCard(risk: risk)),
                    ],
                  ],
                ),
              ),
            ]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          child: Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() {
                  _showResults = false; _showPreview = false;
                  for (int i = 0; i < 4; i++) _answers[i] = null;
                  _submitted = false; _errorMsg = null;
                }),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Edit Answers', style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Done', style: TextStyle(color: Colors.white,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
          ]),
        ),
      ]);

  Widget _depressionSupportCard() => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF8B45C8).withOpacity(0.07),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF8B45C8).withOpacity(0.3)),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFF8B45C8).withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.favorite_border, color: Color(0xFF8B45C8), size: 18),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Mental Health Support Recommended',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
                      color: Color(0xFF8B45C8))),
              SizedBox(height: 4),
              Text(
                'Your depression subscale score is elevated (\u2265 3). '
                'Consider speaking with a mental health professional.',
                style: TextStyle(fontSize: 12, color: AppColors.textMedium),
              ),
            ]),
          ),
        ]),
      );
}

// ── Question card ──────────────────────────────────────────────────────────────

class _QuestionCard extends StatelessWidget {
  final String question;
  final List<String> options;
  final int? selected;
  final ValueChanged<int> onSelect;

  const _QuestionCard({required this.question, required this.options,
      required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected != null
              ? AppColors.primary.withOpacity(0.3) : AppColors.cardBorder),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(question, style: AppTextStyles.cardTitle.copyWith(fontSize: 14)),
          const SizedBox(height: 14),
          Row(children: [
            Expanded(child: _OptionTile(label: options[0], value: 0, selected: selected, onTap: onSelect)),
            const SizedBox(width: 8),
            Expanded(child: _OptionTile(label: options[1], value: 1, selected: selected, onTap: onSelect)),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: _OptionTile(label: options[2], value: 2, selected: selected, onTap: onSelect)),
            const SizedBox(width: 8),
            Expanded(child: _OptionTile(label: options[3], value: 3, selected: selected, onTap: onSelect)),
          ]),
        ]),
      );
}

class _OptionTile extends StatelessWidget {
  final String label;
  final int value;
  final int? selected;
  final ValueChanged<int> onTap;

  const _OptionTile({required this.label, required this.value,
      required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isSelected = selected == value;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.08) : AppColors.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
              color: isSelected ? AppColors.primary : AppColors.cardBorder,
              width: isSelected ? 1.5 : 1),
        ),
        child: Text(label, style: TextStyle(fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected ? AppColors.primary : AppColors.textDark)),
      ),
    );
  }
}

class _SubScoreCard extends StatelessWidget {
  final String label, statusLabel;
  final Color labelColor, statusColor;
  final int score, max;

  const _SubScoreCard({required this.label, required this.labelColor,
      required this.score, required this.max,
      required this.statusLabel, required this.statusColor});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(children: [
          Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700,
              color: labelColor), textAlign: TextAlign.center),
          const SizedBox(height: 8),
          RichText(text: TextSpan(children: [
            TextSpan(text: '$score', style: const TextStyle(fontSize: 32,
                fontWeight: FontWeight.w800, color: AppColors.textDark)),
            TextSpan(text: ' / $max',
                style: const TextStyle(fontSize: 14, color: AppColors.textMedium)),
          ])),
          const SizedBox(height: 6),
          Text(statusLabel, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
              color: statusColor)),
        ]),
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// AffectGridScreen
// ══════════════════════════════════════════════════════════════════════════════

class AffectGridScreen extends StatefulWidget {
  const AffectGridScreen({super.key});
  @override
  State<AffectGridScreen> createState() => _AffectGridScreenState();
}

class _AffectGridScreenState extends State<AffectGridScreen> {
  double  _valence     = 5;
  double  _arousal     = 5;
  bool    _submitting  = false;
  bool    _submitted   = false;
  bool    _showPreview = false;
  bool    _loadingRisks = false;
  String? _errorMsg;
  List<DiseaseRisk> _diseaseRisks = [];

  String get _moodLabel {
    if (_valence >= 7 && _arousal >= 7) return 'Excited & Happy';
    if (_valence >= 7 && _arousal < 4)  return 'Calm & Content';
    if (_valence >= 7)                  return 'Positive';
    if (_valence < 4 && _arousal >= 7)  return 'Stressed';
    if (_valence < 4 && _arousal < 4)   return 'Sad & Low';
    if (_valence < 4)                   return 'Negative';
    return 'Neutral';
  }

  Color get _moodColor {
    if (_valence >= 7) return AppColors.riskLow;
    if (_valence < 4)  return AppColors.riskHigh;
    return AppColors.warningAmber;
  }

  Future<void> _submit() async {
    setState(() { _submitting = true; _errorMsg = null; });
    try {
      final result = await ApiService.logAffect(
        valence: ((_valence / 9.0) * 2 + 1).round().clamp(1, 3),
        arousal: ((_arousal / 9.0) * 2 + 1).round().clamp(1, 3),
        logDate: ApiService.todayIso,
      );
      if (!mounted) return;

      if (ApiService.isSuccess(result)) {
        if (mounted) Navigator.pop(context, true);

        // fire-and-forget risk updates
        DiseaseRiskCalculator.fetchMoodPredictions().then((risks) {
          if (mounted) setState(() { _diseaseRisks = risks; });
        }).catchError((_) {});
        final moodRisk = ((10 - _valence) / 9.0).clamp(0.0, 1.0);
        ApiService.escalateMood({
          'Anxiety': {
            'risk_score': _arousal > 6 ? moodRisk : moodRisk * 0.6,
            'severity': moodRisk > 0.6 ? 'Severe' : moodRisk > 0.4 ? 'Moderate' : 'Mild',
          },
          'Depression': {
            'risk_score': _valence < 4 ? moodRisk : moodRisk * 0.5,
            'severity': moodRisk > 0.6 ? 'Severe' : moodRisk > 0.4 ? 'Moderate' : 'Mild',
          },
        }).catchError((_) => <String, dynamic>{});
        ApiService.triggerComprehensivePrediction();
      } else {
        setState(() => _errorMsg =
            (result['message'] as String?) ?? 'Could not save mood. Please try again.');
      }
    } catch (_) {
      if (mounted) setState(() => _errorMsg = 'Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.surfaceWhite,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.textDark, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Mood Check', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700,
                color: AppColors.textDark)),
            Text('How are you feeling right now?',
                style: TextStyle(fontSize: 12, color: AppColors.textMedium)),
          ]),
        ),
        body: _showPreview ? _buildPreview() : _buildForm(),
      );

  Widget _buildForm() => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (_submitted) ...[
            _SuccessBanner(message: 'Mood saved successfully.'),
            const SizedBox(height: 20),
          ],
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: _moodColor.withOpacity(0.06),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _moodColor.withOpacity(0.2)),
            ),
            child: Column(children: [
              Text(_moodLabel, style: TextStyle(fontSize: 22,
                  fontWeight: FontWeight.w800, color: _moodColor)),
              const SizedBox(height: 8),
              Text('Valence ${_valence.round()}  •  Arousal ${_arousal.round()}',
                  style: AppTextStyles.cardSubtitle),
            ]),
          ),
          const SizedBox(height: 28),
          Text('How positive do you feel?', style: AppTextStyles.inputLabel),
          const SizedBox(height: 4),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Very negative', style: AppTextStyles.smallText),
            Text('Very positive',  style: AppTextStyles.smallText),
          ]),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 6,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
              activeTrackColor: AppColors.primary,
              inactiveTrackColor: AppColors.cardBorder,
              thumbColor: AppColors.primary,
              overlayColor: AppColors.primary.withOpacity(0.12),
            ),
            child: Slider(value: _valence, min: 1, max: 9, divisions: 8,
                onChanged: (v) => setState(() => _valence = v)),
          ),
          const SizedBox(height: 20),
          Text('How energised do you feel?', style: AppTextStyles.inputLabel),
          const SizedBox(height: 4),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Calm / sleepy',   style: AppTextStyles.smallText),
            Text('Excited / alert', style: AppTextStyles.smallText),
          ]),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 6,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
              activeTrackColor: const Color(0xFF7B5EA7),
              inactiveTrackColor: AppColors.cardBorder,
              thumbColor: const Color(0xFF7B5EA7),
              overlayColor: const Color(0xFF7B5EA7).withOpacity(0.12),
            ),
            child: Slider(value: _arousal, min: 1, max: 9, divisions: 8,
                onChanged: (v) => setState(() => _arousal = v)),
          ),
          if (_errorMsg != null) ...[
            const SizedBox(height: 16),
            _ErrorBanner(message: _errorMsg!),
          ],
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: _submitting
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Save',
                        style: TextStyle(color: Colors.white, fontSize: 16,
                            fontWeight: FontWeight.w600)),
                  ),
          ),
        ]),
      );

  Widget _buildPreview() => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          if (_submitted) ...[
            _SuccessBanner(message: 'Mood saved successfully.'),
            const SizedBox(height: 20),
          ],
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: _moodColor.withOpacity(0.06),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _moodColor.withOpacity(0.2)),
            ),
            child: Column(children: [
              Text(_moodLabel, style: TextStyle(fontSize: 22,
                  fontWeight: FontWeight.w800, color: _moodColor)),
              const SizedBox(height: 8),
              Text('Valence ${_valence.round()}  •  Arousal ${_arousal.round()}',
                  style: AppTextStyles.cardSubtitle),
            ]),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Icon(Icons.monitor_heart, color: AppColors.primary, size: 20),
                  const SizedBox(width: 8),
                  const Text('Disease Risk Predictions',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                          color: AppColors.textDark)),
                  const Spacer(),
                  if (_loadingRisks)
                    const SizedBox(width: 16, height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2)),
                ]),
                const SizedBox(height: 4),
                Text('From your mood assessment',
                    style: AppTextStyles.cardSubtitle.copyWith(fontSize: 11)),
                const SizedBox(height: 12),
                if (_loadingRisks)
                  const Center(child: Padding(
                    padding: EdgeInsets.all(12),
                    child: Text('Computing predictions...',
                        style: TextStyle(fontSize: 13, color: AppColors.textMedium)),
                  ))
                else if (_diseaseRisks.isEmpty && _submitted)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      'Risk predictions require at least 3 days of mood data. '
                      'Keep completing your daily check-ins.',
                      style: AppTextStyles.cardSubtitle,
                    ),
                  )
                else if (_diseaseRisks.isNotEmpty) ...[
                  RiskSummaryBanner(risks: _diseaseRisks),
                  const SizedBox(height: 12),
                  ..._diseaseRisks.map((risk) => DiseaseRiskCard(risk: risk)),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _showPreview = false),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Edit', style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: _submitting ? null : (_submitted ? () => Navigator.pop(context, true) : _submit),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _submitting
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_submitted ? 'Done' : 'Save Mood',
                        style: const TextStyle(color: Colors.white,
                            fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
          ]),
        ]),
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// CognitiveLoadScreen
// ══════════════════════════════════════════════════════════════════════════════

class CognitiveLoadScreen extends StatefulWidget {
  const CognitiveLoadScreen({super.key});
  @override
  State<CognitiveLoadScreen> createState() => _CognitiveLoadScreenState();
}

class _CognitiveLoadScreenState extends State<CognitiveLoadScreen> {
  double  _focusScore    = 5;
  double  _memoryScore   = 5;
  double  _mentalFatigue = 5;
  bool    _submitting    = false;
  bool    _submitted     = false;
  bool    _showPreview   = false;
  bool    _loadingRisks  = false;
  String? _errorMsg;
  List<DiseaseRisk> _diseaseRisks = [];

  Color  _scoreColor(double v) => v <= 3 ? AppColors.riskHigh : v <= 6 ? AppColors.warningAmber : AppColors.riskLow;
  String _getScoreLabel(double score) => score <= 3 ? 'Low' : score <= 6 ? 'Moderate' : 'High';

  Future<void> _submit() async {
    setState(() { _submitting = true; _errorMsg = null; });
    try {
      final result = await ApiService.logFocus(
        focusScore:    _focusScore.round(),
        memoryScore:   _memoryScore.round(),
        mentalFatigue: _mentalFatigue.round(),
        logDate: ApiService.todayIso,
      );
      if (!mounted) return;

      if (ApiService.isSuccess(result)) {
        if (mounted) Navigator.pop(context, true);

        DiseaseRiskCalculator.fetchMoodPredictions().then((risks) {
          if (mounted) setState(() { _diseaseRisks = risks; });
        }).catchError((_) {});
        final fatigueRisk  = (_mentalFatigue / 10.0).clamp(0.0, 1.0);
        final focusRisk    = ((10 - _focusScore) / 10.0).clamp(0.0, 1.0);
        final combinedRisk = fatigueRisk * 0.6 + focusRisk * 0.4;
        ApiService.escalateMood({
          'ChronicStress': {
            'risk_score': combinedRisk,
            'severity': combinedRisk > 0.6 ? 'Severe'
                : combinedRisk > 0.4 ? 'Moderate' : 'Mild',
          },
        }).catchError((_) => <String, dynamic>{});
        ApiService.triggerComprehensivePrediction();
      } else {
        setState(() => _errorMsg =
            (result['message'] as String?) ?? 'Could not save. Please try again.');
      }
    } catch (_) {
      if (mounted) setState(() => _errorMsg = 'Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.surfaceWhite,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.textDark, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Focus & Memory', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700,
                color: AppColors.textDark)),
            Text('How sharp have you felt this week?',
                style: TextStyle(fontSize: 12, color: AppColors.textMedium)),
          ]),
        ),
        body: _showPreview ? _buildPreview() : Column(children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                if (_submitted) ...[
                  _SuccessBanner(message: 'Saved successfully.'),
                  const SizedBox(height: 20),
                ],
                _buildSlider('Focus Score', 'How well were you able to concentrate?',
                    _focusScore, 'Very scattered', 'Laser-focused',
                    _scoreColor(_focusScore), (v) => setState(() => _focusScore = v)),
                const SizedBox(height: 24),
                _buildSlider('Memory Score', 'How well were you able to remember things?',
                    _memoryScore, 'Very forgetful', 'Sharp recall',
                    _scoreColor(_memoryScore), (v) => setState(() => _memoryScore = v)),
                const SizedBox(height: 24),
                _buildSlider('Mental Fatigue', 'How mentally drained do you feel?',
                    _mentalFatigue, 'Completely drained', 'Mentally fresh',
                    _scoreColor(_mentalFatigue), (v) => setState(() => _mentalFatigue = v)),
                if (_errorMsg != null) ...[
                  const SizedBox(height: 16),
                  _ErrorBanner(message: _errorMsg!),
                ],
              ]),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            child: SizedBox(
              width: double.infinity,
              child: _submitting
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Save',
                          style: TextStyle(color: Colors.white, fontSize: 16,
                              fontWeight: FontWeight.w600)),
                    ),
            ),
          ),
        ]),
      );

  Widget _buildSlider(String label, String desc, double value,
      String minLabel, String maxLabel, Color color, ValueChanged<double> onChanged) =>
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: AppTextStyles.cardTitle.copyWith(fontSize: 15)),
              const SizedBox(height: 2),
              Text(desc, style: AppTextStyles.cardSubtitle),
            ])),
            RichText(text: TextSpan(children: [
              TextSpan(text: '${value.round()}', style: TextStyle(fontSize: 24,
                  fontWeight: FontWeight.w800, color: color)),
              const TextSpan(text: '/10',
                  style: TextStyle(fontSize: 13, color: AppColors.textMedium)),
            ])),
          ]),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 5,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
              activeTrackColor: color, inactiveTrackColor: AppColors.cardBorder,
              thumbColor: color, overlayColor: color.withOpacity(0.12),
            ),
            child: Slider(value: value, min: 1, max: 10, divisions: 9, onChanged: onChanged),
          ),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(minLabel, style: AppTextStyles.smallText),
            Text(maxLabel, style: AppTextStyles.smallText),
          ]),
        ]),
      );

  Widget _buildPreview() => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          if (_submitted) ...[
            _SuccessBanner(message: 'Focus & Memory assessment saved.'),
            const SizedBox(height: 20),
          ],
          Row(children: [
            Expanded(child: _SubScoreCard(
              label: 'Focus Score', labelColor: AppColors.primary,
              score: _focusScore.round(), max: 10,
              statusLabel: _getScoreLabel(_focusScore), statusColor: _scoreColor(_focusScore),
            )),
            const SizedBox(width: 12),
            Expanded(child: _SubScoreCard(
              label: 'Memory Score', labelColor: AppColors.primary,
              score: _memoryScore.round(), max: 10,
              statusLabel: _getScoreLabel(_memoryScore), statusColor: _scoreColor(_memoryScore),
            )),
          ]),
          const SizedBox(height: 12),
          _SubScoreCard(
            label: 'Mental Fatigue', labelColor: const Color(0xFFE91E63),
            score: _mentalFatigue.round(), max: 10,
            statusLabel: _getScoreLabel(_mentalFatigue), statusColor: _scoreColor(_mentalFatigue),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const Icon(Icons.monitor_heart, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                const Text('Disease Risk Predictions',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                        color: AppColors.textDark)),
                const Spacer(),
                if (_loadingRisks)
                  const SizedBox(width: 16, height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2)),
              ]),
              const SizedBox(height: 4),
              Text('From your cognitive assessment',
                  style: AppTextStyles.cardSubtitle.copyWith(fontSize: 11)),
              const SizedBox(height: 12),
              if (_loadingRisks)
                const Center(child: Padding(
                  padding: EdgeInsets.all(8),
                  child: Text('Computing predictions...',
                      style: TextStyle(fontSize: 13, color: AppColors.textMedium)),
                ))
              else if (_diseaseRisks.isEmpty && _submitted)
                Text('Risk predictions require at least 3 days of mood data.',
                    style: AppTextStyles.cardSubtitle)
              else if (_diseaseRisks.isNotEmpty) ...[
                RiskSummaryBanner(risks: _diseaseRisks),
                const SizedBox(height: 12),
                ..._diseaseRisks.map((risk) => DiseaseRiskCard(risk: risk)),
              ],
            ]),
          ),
          const SizedBox(height: 24),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _showPreview = false),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Edit Answers', style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: _submitting ? null : (_submitted ? () => Navigator.pop(context, true) : _submit),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _submitting
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_submitted ? 'Done' : 'Save Assessment',
                        style: const TextStyle(color: Colors.white,
                            fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
          ]),
        ]),
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// SleepSatisfactionScreen
// ══════════════════════════════════════════════════════════════════════════════

class SleepSatisfactionScreen extends StatefulWidget {
  const SleepSatisfactionScreen({super.key});
  @override
  State<SleepSatisfactionScreen> createState() => _SleepSatisfactionScreenState();
}

class _SleepSatisfactionScreenState extends State<SleepSatisfactionScreen> {
  double  _sleepQuality = 5;
  double  _hoursSlept   = 7;
  bool    _submitting   = false;
  bool    _submitted    = false;
  bool    _showPreview  = false;
  bool    _loadingRisks = false;
  String? _errorMsg;
  List<DiseaseRisk> _diseaseRisks = [];

  Color  get _qualityColor => _sleepQuality <= 3 ? AppColors.riskHigh
      : _sleepQuality <= 6 ? AppColors.warningAmber : AppColors.riskLow;
  String get _qualityLabel => _sleepQuality <= 3 ? 'Poor'
      : _sleepQuality <= 6 ? 'Fair' : _sleepQuality <= 8 ? 'Good' : 'Excellent';

  Future<void> _submit() async {
    setState(() { _submitting = true; _errorMsg = null; });
    try {
      final result = await ApiService.logSleep(
        sleepSatisfaction: ((_sleepQuality / 10.0) * 4 + 1).round().clamp(1, 5),
        hoursSlept:   _hoursSlept,
        logDate: ApiService.todayIso,
      );
      if (!mounted) return;

      if (ApiService.isSuccess(result)) {
        if (mounted) Navigator.pop(context, true);

        DiseaseRiskCalculator.fetchMoodPredictions().then((risks) {
          if (mounted) setState(() { _diseaseRisks = risks; });
        }).catchError((_) {});
        final sleepRisk    = ((10 - _sleepQuality) / 10.0).clamp(0.0, 1.0);
        final hoursRisk    = _hoursSlept < 6 ? (6 - _hoursSlept) / 6.0 : 0.0;
        final combinedRisk = (sleepRisk * 0.6 + hoursRisk * 0.4).clamp(0.0, 1.0);
        ApiService.escalateMood({
          'Depression': {
            'risk_score': combinedRisk,
            'severity': combinedRisk > 0.6 ? 'Severe'
                : combinedRisk > 0.4 ? 'Moderate' : 'Mild',
          },
          'ChronicStress': {
            'risk_score': combinedRisk * 0.8,
            'severity': (combinedRisk * 0.8) > 0.6 ? 'Severe'
                : (combinedRisk * 0.8) > 0.4 ? 'Moderate' : 'Mild',
          },
        }).catchError((_) => <String, dynamic>{});
        ApiService.triggerComprehensivePrediction();
      } else {
        setState(() => _errorMsg =
            (result['message'] as String?) ?? 'Could not save. Please try again.');
      }
    } catch (_) {
      if (mounted) setState(() => _errorMsg = 'Network error. Please try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.surfaceWhite,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.textDark, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Sleep Quality', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700,
                color: AppColors.textDark)),
            Text('How well did you sleep?',
                style: TextStyle(fontSize: 12, color: AppColors.textMedium)),
          ]),
        ),
        body: _showPreview ? _buildPreview() : Column(children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                if (_submitted) ...[
                  _SuccessBanner(message: 'Sleep data saved.'),
                  const SizedBox(height: 20),
                ],
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: _qualityColor.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _qualityColor.withOpacity(0.2)),
                  ),
                  child: Column(children: [
                    Text(_qualityLabel, style: TextStyle(fontSize: 22,
                        fontWeight: FontWeight.w800, color: _qualityColor)),
                    const SizedBox(height: 6),
                    Text('${_hoursSlept.toStringAsFixed(1)} hours  •  '
                        'Quality ${_sleepQuality.round()}/10',
                        style: AppTextStyles.cardSubtitle),
                  ]),
                ),
                const SizedBox(height: 24),
                _buildSlider('Sleep Quality', 'How restful was your sleep last night?',
                    _sleepQuality, 'Very poor', 'Excellent',
                    _qualityColor, (v) => setState(() => _sleepQuality = v)),
                const SizedBox(height: 16),
                _buildSlider('Hours Slept', 'How many hours did you sleep?',
                    _hoursSlept, '0h', '12h', AppColors.primary,
                    (v) => setState(() => _hoursSlept = v),
                    min: 0, max: 12, divisions: 24,
                    valueDisplay: _hoursSlept.toStringAsFixed(1), valueSuffix: 'h'),
                if (_errorMsg != null) ...[
                  const SizedBox(height: 16),
                  _ErrorBanner(message: _errorMsg!),
                ],
              ]),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            child: SizedBox(
              width: double.infinity,
              child: _submitting
                  ? const Center(child: CircularProgressIndicator())
                  : ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('Save',
                          style: TextStyle(color: Colors.white, fontSize: 16,
                              fontWeight: FontWeight.w600)),
                    ),
            ),
          ),
        ]),
      );

  Widget _buildSlider(
    String label, String desc, double value, String minLabel, String maxLabel,
    Color color, ValueChanged<double> onChanged, {
    double min = 1, double max = 10, int divisions = 9,
    String? valueDisplay, String valueSuffix = '/10',
  }) =>
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceWhite,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: AppTextStyles.cardTitle.copyWith(fontSize: 15)),
              const SizedBox(height: 2),
              Text(desc, style: AppTextStyles.cardSubtitle),
            ])),
            RichText(text: TextSpan(children: [
              TextSpan(text: valueDisplay ?? '${value.round()}',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: color)),
              TextSpan(text: valueSuffix,
                  style: const TextStyle(fontSize: 13, color: AppColors.textMedium)),
            ])),
          ]),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              trackHeight: 5,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10),
              activeTrackColor: color, inactiveTrackColor: AppColors.cardBorder,
              thumbColor: color, overlayColor: color.withOpacity(0.12),
            ),
            child: Slider(value: value, min: min, max: max, divisions: divisions,
                onChanged: onChanged),
          ),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(minLabel, style: AppTextStyles.smallText),
            Text(maxLabel, style: AppTextStyles.smallText),
          ]),
        ]),
      );

  Widget _buildPreview() => SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          if (_submitted) ...[
            _SuccessBanner(message: 'Sleep data saved.'),
            const SizedBox(height: 20),
          ],
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: _qualityColor.withOpacity(0.06),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _qualityColor.withOpacity(0.2)),
            ),
            child: Column(children: [
              Text(_qualityLabel, style: TextStyle(fontSize: 22,
                  fontWeight: FontWeight.w800, color: _qualityColor)),
              const SizedBox(height: 6),
              Text('${_hoursSlept.toStringAsFixed(1)} hours  •  Quality ${_sleepQuality.round()}/10',
                  style: AppTextStyles.cardSubtitle),
            ]),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const Icon(Icons.monitor_heart, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                const Text('Disease Risk Predictions',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                        color: AppColors.textDark)),
                const Spacer(),
                if (_loadingRisks)
                  const SizedBox(width: 16, height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2)),
              ]),
              const SizedBox(height: 4),
              Text('From your sleep assessment',
                  style: AppTextStyles.cardSubtitle.copyWith(fontSize: 11)),
              const SizedBox(height: 12),
              if (_loadingRisks)
                const Center(child: Padding(
                  padding: EdgeInsets.all(8),
                  child: Text('Computing predictions...',
                      style: TextStyle(fontSize: 13, color: AppColors.textMedium)),
                ))
              else if (_diseaseRisks.isEmpty && _submitted)
                Text('Risk predictions require at least 3 days of mood data.',
                    style: AppTextStyles.cardSubtitle)
              else if (_diseaseRisks.isNotEmpty) ...[
                RiskSummaryBanner(risks: _diseaseRisks),
                const SizedBox(height: 12),
                ..._diseaseRisks.map((risk) => DiseaseRiskCard(risk: risk)),
              ],
            ]),
          ),
          const SizedBox(height: 24),
          Row(children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => setState(() => _showPreview = false),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.cardBorder),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Edit', style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                onPressed: _submitting ? null : (_submitted ? () => Navigator.pop(context, true) : _submit),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _submitting
                    ? const SizedBox(width: 18, height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_submitted ? 'Done' : 'Save Sleep Data',
                        style: const TextStyle(color: Colors.white,
                            fontWeight: FontWeight.w600, fontSize: 15)),
              ),
            ),
          ]),
        ]),
      );
}

// ══════════════════════════════════════════════════════════════════════════════
// Shared banner widgets
// ══════════════════════════════════════════════════════════════════════════════

class _SuccessBanner extends StatelessWidget {
  final String message;
  const _SuccessBanner({required this.message});
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.riskLow.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.riskLow.withOpacity(0.3)),
        ),
        child: Row(children: [
          Icon(Icons.check_circle_outline, size: 16, color: AppColors.riskLow),
          const SizedBox(width: 8),
          Expanded(child: Text(message, style: TextStyle(fontSize: 13, color: AppColors.riskLow))),
        ]),
      );
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.riskHigh.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.riskHigh.withOpacity(0.3)),
        ),
        child: Row(children: [
          Icon(Icons.error_outline, size: 16, color: AppColors.riskHigh),
          const SizedBox(width: 8),
          Expanded(child: Text(message, style: TextStyle(fontSize: 13, color: AppColors.riskHigh))),
        ]),
      );
}

class _WarningBanner extends StatelessWidget {
  final String message;
  const _WarningBanner({required this.message});
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.warningAmber.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.warningAmber.withOpacity(0.3)),
        ),
        child: Row(children: [
          Icon(Icons.warning_amber_outlined, size: 16, color: AppColors.warningAmber),
          const SizedBox(width: 8),
          Expanded(child: Text(message,
              style: TextStyle(fontSize: 13, color: AppColors.warningAmber))),
        ]),
      );
}