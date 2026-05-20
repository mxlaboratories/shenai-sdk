import 'package:shenai_sdk/pigeon.dart';

String formatNumber(num? value, {int decimals = 0}) {
  if (value == null || value.isNaN || value.isInfinite) {
    return '-';
  }
  return value.toStringAsFixed(decimals);
}

String formatEnum(Enum? value) {
  if (value == null) {
    return '-';
  }
  return value.name
      .replaceAllMapped(RegExp('([A-Z])'), (match) => ' ${match.group(1)}')
      .trim();
}

String formatBpScale(MeasurementResults? results) {
  if (results?.systolic_blood_pressure_mmhg == null ||
      results?.diastolic_blood_pressure_mmhg == null) {
    return '-';
  }
  return 'Included';
}
