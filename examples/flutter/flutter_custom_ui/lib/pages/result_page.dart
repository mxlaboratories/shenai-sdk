import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';
import 'package:shenai_sdk/shenai_sdk.dart';

import '../measurement_values.dart';
import '../models/risk_profile.dart';
import '../utils/sdk_read.dart';
import '../widgets/measurement_quality_indicator.dart';
import '../widgets/simple_grid.dart';
import 'risk_form_page.dart';

class ResultPage extends StatefulWidget {
  const ResultPage({
    super.key,
    required this.results,
    required this.risks,
    required this.profile,
    required this.onProfileSaved,
    required this.onRisksChanged,
  });

  final MeasurementResults? results;
  final HealthRisks? risks;
  final RiskProfile profile;
  final ValueChanged<RiskProfile> onProfileSaved;
  final ValueChanged<HealthRisks?> onRisksChanged;

  @override
  State<ResultPage> createState() => _ResultPageState();
}

class _ResultPageState extends State<ResultPage> {
  late HealthRisks? _risks = widget.risks;
  late RiskProfile _profile = widget.profile;

  Future<void> _openRiskForm() async {
    final profile = await Navigator.of(context).push<RiskProfile>(
      MaterialPageRoute(
        builder: (_) =>
            RiskFormPage(profile: _profile, onSaved: widget.onProfileSaved),
      ),
    );
    if (profile == null || widget.results == null) {
      return;
    }
    final risks = await readSdkOrNull(
      () => ShenaiSdk.computeHealthRisks(
        profile.toRisksFactors(results: widget.results),
      ),
    );
    if (!mounted) {
      return;
    }
    setState(() {
      _profile = profile;
      _risks = risks ?? _risks;
    });
    widget.onRisksChanged(_risks);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Results'),
        actions: [
          IconButton(
            tooltip: 'Health form',
            onPressed: _openRiskForm,
            icon: const Icon(Icons.assignment_outlined),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          MeasurementQualityIndicator(
            title: 'Measurement quality',
            results: widget.results,
          ),
          const SizedBox(height: 20),
          SimpleGrid(values: measurementMetricValues(widget.results)),
          const SizedBox(height: 20),
          const Text('Health indices'),
          const SizedBox(height: 10),
          SimpleGrid(values: healthRiskValues(_risks)),
        ],
      ),
    );
  }
}
