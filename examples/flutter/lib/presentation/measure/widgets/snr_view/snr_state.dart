part of 'snr_cubit.dart';

abstract class SnrState extends Equatable {
  const SnrState();
}

class SnrInitial extends SnrState {
  @override
  List<Object> get props => [];
}

class SnrValue extends SnrState {
  final int snr;

  const SnrValue(this.snr);

  @override
  List<Object> get props => [snr];
}
