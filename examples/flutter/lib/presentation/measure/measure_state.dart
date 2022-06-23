part of 'measure_cubit.dart';

abstract class MeasureCubitState extends Equatable {
  const MeasureCubitState();
}

class MeasureInitial extends MeasureCubitState {
  @override
  List<Object> get props => [];
}

class MeasureReady extends MeasureCubitState {
  final int textureId;

  const MeasureReady(this.textureId);

  @override
  List<Object> get props => [textureId];
}

class MeasureStarted extends MeasureReady {
  const MeasureStarted(super.textureId);

  @override
  List<Object> get props => [textureId];
}

class MeasureInProgress extends MeasureReady {
  final double progress;
  final int texture;

  const MeasureInProgress({required this.progress, required this.texture}) : super(texture);

  @override
  List<Object> get props => [textureId, progress];
}

class MeasureEnded extends MeasureReady {
  final MeasurementSummaryData? summaryData;
  final int texture;

  const MeasureEnded({required this.texture, this.summaryData}) : super(texture);

  @override
  List<Object> get props => [textureId];
}

class MeasureFailure extends MeasureInitial {

  @override
  List<Object> get props => [];
}

class MeasureLoading extends MeasureReady {
  const MeasureLoading(super.textureId);

  @override
  List<Object> get props => [];
}

class MeasureLoadingEnd extends MeasureReady {
  const MeasureLoadingEnd(super.textureId);

  @override
  List<Object> get props => [];
}
