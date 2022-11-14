part of 'risks_cubit.dart';

abstract class RisksState extends Equatable {
  const RisksState();
}

class RisksLoading extends RisksState {
  @override
  List<Object> get props => [];
}

class RisksError extends RisksState {
  final dynamic error;

  const RisksError(this.error);

  @override
  List<Object?> get props => [error];
}

class RisksLoaded extends RisksState {
  final HealthRisksResultModel healthRisksValues;

  const RisksLoaded(this.healthRisksValues);

  @override
  List<Object?> get props => [healthRisksValues];
}
