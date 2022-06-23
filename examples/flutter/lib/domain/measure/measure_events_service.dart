import 'package:shenai_sdk_example/domain/measure/lighting_state.dart';
import 'package:shenai_sdk_example/domain/measure/measure_state.dart';
import 'package:shenai_sdk_example/domain/measure/model/user_face_pos.dart';

abstract class MeasurementEventsService {
  Future<void> attach();

  Future<void> detach();

  Future<void> deinitializeEngine();

  Future<int?> initMeasurement();

  Stream<double> observeLatestHeartRate();

  Stream<double> observeCurrentSignalQualityMetric();

  Stream<bool> observeReadyForMeasurement();

  Stream<MeasureState> observeMeasurementState();

  Stream<UserFacePos> observeFacePositionState();

  Stream<LightingState> observeLightingCondState();

  Stream<List<double>> observeLatestHeartSignal();
}
