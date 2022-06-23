import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:rxdart/rxdart.dart';
import 'package:shenai_sdk_example/domain/measure/lighting_state.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';
import 'package:shenai_sdk_example/domain/measure/model/user_face_pos.dart';
import 'package:shenai_sdk_example/domain/measure/warning_type.dart';
import 'package:shenai_sdk_example/domain/tuple/tuple_2.dart';

part 'warning_icon_state.dart';

@injectable
class WarningIconCubit extends Cubit<WarningIconState> {
  final MeasurementEventsService _measurementService;

  StreamSubscription? _streamSubscription;

  WarningIconCubit(this._measurementService) : super(WarningIconInitial());

  void init() {
    _streamSubscription = Rx.combineLatest2(
      _measurementService.observeLightingCondState(),
      _measurementService.observeFacePositionState(),
      (LightingState lightingState, UserFacePos facePositionState) =>
          Tuple2(lightingState, facePositionState),
    ).map((event) => event).listen((event) {
      if (event.item1 != LightingState.ok) {
        emit(const WarningIconShow(WarningType.lighting));
      } else if (event.item2 == UserFacePos.unstable) {
        emit(const WarningIconShow(WarningType.moving));
      } else {
        emit(WarningIconNotShow());
      }
    });
  }

  @override
  Future<void> close() {
    _streamSubscription?.cancel();
    return super.close();
  }
}
