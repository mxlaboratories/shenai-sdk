part of 'face_position_cubit.dart';

abstract class FacePositionState extends Equatable {
  const FacePositionState();
}

class FacePositionInitial extends FacePositionState {
  @override
  List<Object> get props => [];
}

class FacePositionValue extends FacePositionState {
  final UserFacePos position;

  const FacePositionValue(this.position);

  @override
  List<Object> get props => [position];
}
