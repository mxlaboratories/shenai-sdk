import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';

import '../utils/formatters.dart';
import 'custom_progress_bar.dart';

class MeasurementQualityIndicator extends StatelessWidget {
  const MeasurementQualityIndicator({
    super.key,
    required this.title,
    required this.results,
  });

  final String title;
  final MeasurementResults? results;

  @override
  Widget build(BuildContext context) {
    final rows = _qualityRows(results);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleSmall),
        const SizedBox(height: 10),
        if (rows.isEmpty)
          const Text('Quality will appear during the measurement.')
        else
          for (final row in rows) ...[
            _QualityRow(row: row),
            const SizedBox(height: 8),
          ],
      ],
    );
  }
}

class _QualityRow extends StatelessWidget {
  const _QualityRow({required this.row});

  final _QualityValue row;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(width: 72, child: Text(row.label)),
        Expanded(
          child: row.progress == null
              ? const Divider(color: Colors.black)
              : CustomProgressBar(value: row.progress!),
        ),
        const SizedBox(width: 10),
        SizedBox(width: 52, child: Text(row.value, textAlign: TextAlign.right)),
      ],
    );
  }
}

class _QualityValue {
  const _QualityValue(this.label, this.value, this.progress);

  final String label;
  final String value;
  final double? progress;
}

List<_QualityValue> _qualityRows(MeasurementResults? results) {
  if (results == null) {
    return const [];
  }
  final quality = results.quality_metrics;
  return [
    _QualityValue(
      'Signal',
      formatNumber(results.average_signal_quality, decimals: 1),
      _qualityProgress(results.average_signal_quality),
    ),
    if (quality?.ppg_quality_index != null)
      _QualityValue(
        'PPG',
        formatNumber(quality?.ppg_quality_index, decimals: 1),
        _qualityProgress(quality?.ppg_quality_index),
      ),
    if (quality?.bcg_quality_index != null)
      _QualityValue(
        'BCG',
        formatNumber(quality?.bcg_quality_index, decimals: 1),
        _qualityProgress(quality?.bcg_quality_index),
      ),
    if (quality?.blood_pressure_quality_index != null)
      _QualityValue(
        'BP',
        formatNumber(quality?.blood_pressure_quality_index, decimals: 1),
        _qualityProgress(quality?.blood_pressure_quality_index),
      ),
  ];
}

double? _qualityProgress(num? value) {
  if (value == null || value.isNaN || value.isInfinite) {
    return null;
  }
  final normalized = value <= 1 ? value.toDouble() : value / 100;
  return normalized.clamp(0, 1).toDouble();
}
