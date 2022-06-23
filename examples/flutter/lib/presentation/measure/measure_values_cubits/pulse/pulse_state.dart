part of 'pulse_cubit.dart';

abstract class PulseState extends Equatable {
  const PulseState();
}

class PulseInitial extends PulseState {
  @override
  List<Object> get props => [];
}

class PulseValue extends PulseState {
  final double pulse;

  const PulseValue(this.pulse);

  @override
  List<Object> get props => [pulse];
}
