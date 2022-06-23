import 'package:equatable/equatable.dart';
import 'package:shenai_sdk_example/domain/measure/model/measurement_summary_data.dart';

abstract class MeasureState extends Equatable {}

class MeasurementInProgress extends MeasureState {
  final double progress;

  MeasurementInProgress(this.progress);

  @override
  List<Object?> get props => [progress];
}

class NotMeasurement extends MeasureState {
  @override
  List<Object?> get props => [];
}

class MeasurementFail extends MeasureState {
  @override
  List<Object?> get props => [];
}

class MeasurementEnd extends MeasureState {
  final MeasurementSummaryData summaryData;

  MeasurementEnd(this.summaryData);

  @override
  List<Object?> get props => [summaryData];
}
