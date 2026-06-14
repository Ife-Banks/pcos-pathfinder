import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_textstyles.dart';

// ── MfgScreen — mFG Hirsutism Score ──────────────────────────────────────────
class MfgScreen extends StatefulWidget {
  const MfgScreen({super.key});
  @override
  State<MfgScreen> createState() => _MfgScreenState();
}

class _MfgScreenState extends State<MfgScreen> {
  bool _showResults = false;

  // zone index -> score (0-4)
  final Map<int, int> _scores = {};

  static const _zones = [
    _Zone('Upper Lip',      'Above the lip, below the nose',       '👄'),
    _Zone('Chin',           'Chin and jawline area',                '👄'),
    _Zone('Chest',          'Between and around the breasts',       '🫁'),
    _Zone('Upper Back',     'Upper back and shoulders',             '🔙'),
    _Zone('Lower Back',     'Lower back above buttocks',            '⬇️'),
    _Zone('Upper Abdomen',  'Above the navel',                      '⬆️'),
    _Zone('Lower Abdomen',  'Below the navel',                      '⬇️'),
    _Zone('Upper Arm',      'Shoulders to elbows',                  '💪'),
    _Zone('Thigh',          'Upper inner and outer thighs',         '🦵'),
  ];

  int get _total => _scores.values.fold(0, (a, b) => a + b);

  String get _interpretation {
    if (_total < 8) return 'Normal';
    if (_total < 15) return 'Mild';
    if (_total < 20) return 'Moderate';
    return 'Severe';
  }

  Color get _interpretationColor {
    if (_total < 8) return AppColors.riskLow;
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
          padding: EdgeInsets.fromLTRB(24, 20, 24,
              MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Column(mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4,
                decoration: BoxDecoration(
                  color: AppColors.cardBorder,
                  borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 16),
              Text(_zones[index].name, style: AppTextStyles.cardTitle
                  .copyWith(fontSize: 17)),
              const SizedBox(height: 4),
              Text(_zones[index].description,
                  style: AppTextStyles.cardSubtitle),
              const SizedBox(height: 20),
              Text('Score (0 = no hair, 4 = dense coverage)',
                style: AppTextStyles.inputLabel),
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
                        color: tempScore == s
                            ? AppColors.primary : AppColors.surfaceWhite,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: tempScore == s
                              ? AppColors.primary : AppColors.cardBorder)),
                      child: Text('$s', textAlign: TextAlign.center,
                        style: TextStyle(
                          fontWeight: FontWeight.w700, fontSize: 16,
                          color: tempScore == s
                              ? Colors.white : AppColors.textDark))),
                  ))))),
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
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12))),
                  child: const Text('Save', style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w600,
                    fontSize: 15)))),
            ]),
        )),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 20,
              color: AppColors.textDark),
          onPressed: () => Navigator.pop(context)),
        titleSpacing: 0,
        title: Column(crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Hirsutism Score', style: TextStyle(
              color: AppColors.textDark, fontSize: 17,
              fontWeight: FontWeight.w700)),
            Text('Modified Ferriman-Gallwey (mFG) Assessment',
              style: TextStyle(fontSize: 12,
                  color: AppColors.textMedium)),
          ]),
      ),
      body: _showResults ? _buildResults() : _buildAssessment(),
    );
  }

  // ── Assessment list ─────────────────────────────────────────────────────────
  Widget _buildAssessment() {
    return Column(children: [
      Expanded(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(children: [
            // Running total
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.cardBorder)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('RUNNING TOTAL', style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700,
                        color: AppColors.textMedium, letterSpacing: 0.8)),
                      const SizedBox(height: 4),
                      RichText(text: TextSpan(children: [
                        TextSpan(text: '$_total',
                          style: const TextStyle(fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textDark)),
                        const TextSpan(text: ' / 36',
                          style: TextStyle(fontSize: 15,
                              color: AppColors.textMedium)),
                      ])),
                    ]),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: _interpretationColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20)),
                    child: Text(_interpretation, style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w700,
                      color: _interpretationColor))),
                ]),
            ),

            const SizedBox(height: 12),

            // Info banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.07),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppColors.primary.withOpacity(0.15))),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 16,
                      color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(child: Text(
                    'Rate each body zone from 0 (no terminal hair) to 4 '
                    '(dense/dark coverage). A total score ≥ 8 suggests '
                    'clinical hirsutism.',
                    style: AppTextStyles.cardSubtitle)),
                ])),

            const SizedBox(height: 12),

            // Zone list
            ..._zones.asMap().entries.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: GestureDetector(
                onTap: () => _openZoneSheet(e.key),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 14),
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
                      child: Center(child: Text(e.value.emoji,
                          style: const TextStyle(fontSize: 20)))),
                    const SizedBox(width: 12),
                    Expanded(child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(e.value.name, style: AppTextStyles.cardTitle
                            .copyWith(fontSize: 14)),
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
                      child: Center(child: Text(
                        '${_scores[e.key] ?? 0}',
                        style: AppTextStyles.cardTitle
                            .copyWith(fontSize: 13)))),
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
        child: SizedBox(width: double.infinity,
          child: ElevatedButton(
            onPressed: () => setState(() => _showResults = true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14))),
            child: const Text('View Results', style: TextStyle(
              color: Colors.white, fontSize: 16,
              fontWeight: FontWeight.w600))))),
    ]);
  }

  // ── Results view ────────────────────────────────────────────────────────────
  Widget _buildResults() {
    return Column(children: [
      Expanded(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(children: [
            // Running total (same as above)
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.cardBorder)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('RUNNING TOTAL', style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700,
                        color: AppColors.textMedium, letterSpacing: 0.8)),
                      const SizedBox(height: 4),
                      RichText(text: TextSpan(children: [
                        TextSpan(text: '$_total',
                          style: const TextStyle(fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textDark)),
                        const TextSpan(text: ' / 36',
                          style: TextStyle(fontSize: 15,
                              color: AppColors.textMedium)),
                      ])),
                    ]),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: _interpretationColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20)),
                    child: Text(_interpretation, style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w700,
                      color: _interpretationColor))),
                ]),
            ),

            const SizedBox(height: 16),

            // Info banner
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.07),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppColors.primary.withOpacity(0.15))),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 16,
                      color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(child: Text(
                    'Rate each body zone from 0 (no terminal hair) to 4 '
                    '(dense/dark coverage). A total score ≥ 8 suggests '
                    'clinical hirsutism.',
                    style: AppTextStyles.cardSubtitle)),
                ])),

            const SizedBox(height: 16),

            // Big score card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder)),
              child: Column(children: [
                Text('$_total', style: TextStyle(
                  fontSize: 56, fontWeight: FontWeight.w800,
                  color: AppColors.textDark, height: 1.0)),
                const SizedBox(height: 4),
                Text('out of 36', style: AppTextStyles.cardSubtitle),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: _interpretationColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20)),
                  child: Text(_interpretation, style: TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w700,
                    color: _interpretationColor))),
                const SizedBox(height: 20),
                // per-zone breakdown
                ..._zones.asMap().entries.map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(children: [
                    Expanded(child: Text(e.value.name,
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
                              : AppColors.riskHigh))),
                    const SizedBox(width: 10),
                    SizedBox(width: 16,
                      child: Text('${_scores[e.key] ?? 0}',
                        style: AppTextStyles.cardTitle
                            .copyWith(fontSize: 13),
                        textAlign: TextAlign.right)),
                  ]))),
              ]),
            ),

            const SizedBox(height: 16),

            // Footnote
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(10)),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline, size: 14,
                      color: AppColors.textMedium),
                  const SizedBox(width: 8),
                  Expanded(child: Text(
                    'SHAP values show how each feature pushes the score '
                    'up or down from a baseline. Larger bars = stronger '
                    'contribution. Week-over-week changes highlight what '
                    'shifted since your last assessment.',
                    style: AppTextStyles.smallText)),
                ])),
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
                side: BorderSide(color: AppColors.cardBorder),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12))),
              child: const Text('Edit Scores', style: TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w600,
                fontSize: 15)))),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12))),
              child: const Text('Save & Continue', style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w600,
                fontSize: 15)))),
        ]),
      ),
    ]);
  }
}

// ── Zone model ────────────────────────────────────────────────────────────────
class _Zone {
  final String name, description, emoji;
  const _Zone(this.name, this.description, this.emoji);
}