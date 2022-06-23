part of 'warning_icon_cubit.dart';

abstract class WarningIconState extends Equatable {
  const WarningIconState();
}

class WarningIconInitial extends WarningIconState {
  @override
  List<Object> get props => [];
}

class WarningIconShow extends WarningIconState {
  final WarningType type;

  const WarningIconShow(this.type);

  @override
  List<Object> get props => [type];
}

class WarningIconNotShow extends WarningIconState {
  @override
  List<Object> get props => [];
}
