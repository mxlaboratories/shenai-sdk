import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';
import 'package:shenai_sdk_example/domain/measure/measure_state.dart';
import 'package:shenai_sdk_example/domain/measure/model/measurement_summary_data.dart';

part 'measure_state.dart';

@injectable
class MeasureCubit extends Cubit<MeasureCubitState> {
  final MeasurementEventsService _measurementService;

  late StreamSubscription _measureStateSubscription;
  late StreamSubscription _readyForMeasurementSubscription;
  int? _textureId;
  bool? _hasResult;

  MeasureCubit(this._measurementService) : super(MeasureInitial());

  void initMeasurement() {
    _hasResult = false;
    Permission.camera.request().then((permission) async {
      if (permission == PermissionStatus.granted || permission == PermissionStatus.limited) {
        _textureId = await _measurementService.initMeasurement();
        if (_textureId != null) {
          emit(MeasureReady(_textureId!));
        }
      }
    });

    _measureStateSubscription = _measurementService.observeMeasurementState().listen((state) {
      if (state is MeasurementFail && _textureId != null) {
        emit(MeasureFailure());
      } else if (state is MeasurementEnd && _textureId != null) {
        _hasResult = true;
        emit(MeasureEnded(texture: _textureId!, summaryData: state.summaryData));
      } else if (state is MeasurementInProgress && _textureId != null) {
        emit(MeasureInProgress(progress: state.progress, texture: _textureId!));
      }
    });

    _readyForMeasurementSubscription = _measurementService.observeReadyForMeasurement().listen((state) {
      if (_hasResult == null || _hasResult == false) {
        emit(MeasureReady(_textureId!, isReadyForMeasurement: state));
      }
    });
  }

  Future<void> startMeasurement() async {
    _hasResult = false;
    await _measurementService.attach();
    if (_textureId != null) {
      emit(MeasureStarted(_textureId!));
    }
  }

  Future<void> stopMeasurement() async {
    await _measurementService.detach();
    if (_textureId != null) {
      emit(MeasureEnded(texture: _textureId!));
    }
  }

  Future<void> deinitialize() async {
    emit(MeasureLoading());
    _measureStateSubscription.cancel();
    _readyForMeasurementSubscription.cancel();
    await _measurementService.deinitializeEngine();
    // Time required to deinitialize the engine
    await Future<void>.delayed(const Duration(seconds: 1));
    emit(MeasureDeinitialized());
  }

  @override
  Future<void> close() {
    _measureStateSubscription.cancel();
    _readyForMeasurementSubscription.cancel();
    _measurementService.deinitializeEngine();
    return super.close();
  }
}
