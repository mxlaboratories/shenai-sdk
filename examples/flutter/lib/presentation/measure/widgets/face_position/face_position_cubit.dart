import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';
import 'package:shenai_sdk_example/domain/measure/model/user_face_pos.dart';

part 'face_position_state.dart';

@injectable
class FacePositionCubit extends Cubit<FacePositionState> {
  final MeasurementEventsService _measurementService;

  StreamSubscription? _facePosSubscription;

  FacePositionCubit(this._measurementService) : super(FacePositionInitial());

  void init() {
    _facePosSubscription = _measurementService.observeFacePositionState().listen((position) {
      emit(FacePositionValue(position));
    });
  }

  @override
  Future<void> close() {
    _facePosSubscription?.cancel();
    return super.close();
  }
}
