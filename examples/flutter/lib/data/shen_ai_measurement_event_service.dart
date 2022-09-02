import 'dart:async';

import 'package:rxdart/rxdart.dart';
import 'package:shenai_sdk/domain/enums.dart';
import 'package:shenai_sdk/domain/models.dart';
import 'package:shenai_sdk/shenai_sdk.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/domain/measure/lighting_state.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';
import 'package:shenai_sdk_example/domain/measure/measure_state.dart';
import 'package:shenai_sdk_example/domain/measure/model/measurement_summary_data.dart';
import 'package:shenai_sdk_example/domain/measure/model/user_face_pos.dart';

class ShenAiMeasurementEventService implements MeasurementEventsService {
  final PublishSubject<double> _latestHeartRate = PublishSubject<double>();
  final PublishSubject<double> _signalQualityMetric = PublishSubject<double>();
  final PublishSubject<MeasureState> _measurementState =
      PublishSubject<MeasureState>();
  final PublishSubject<bool> _isReadyForMeasurement = PublishSubject<bool>();
  final PublishSubject<UserFacePos> _facePosition =
      PublishSubject<UserFacePos>();
  final PublishSubject<LightingState> _lightningCond =
      PublishSubject<LightingState>();
  final PublishSubject<List<double>> _latestHeartSignal =
      PublishSubject<List<double>>();

  late StreamSubscription _latestHeartRateSubscription;
  late StreamSubscription _signalQualityMetricSubscription;
  late StreamSubscription _measurementStateSubscription;
  late StreamSubscription _isReadyForMeasurementSubscription;
  late StreamSubscription _facePositionSubscription;
  late StreamSubscription _latestHeartSignalSubscription;
  late StreamSubscription _lightningCondSubscription;

  @override
  Stream<double> observeCurrentSignalQualityMetric() => _signalQualityMetric;

  @override
  Stream<MeasureState> observeMeasurementState() => _measurementState;

  @override
  Stream<double> observeLatestHeartRate() => _latestHeartRate;

  @override
  Stream<bool> observeReadyForMeasurement() => _isReadyForMeasurement;

  @override
  Stream<UserFacePos> observeFacePositionState() => _facePosition;

  @override
  Stream<LightingState> observeLightingCondState() => _lightningCond;

  @override
  Stream<List<double>> observeLatestHeartSignal() => _latestHeartSignal;

  @override
  Future<int?> initMeasurement() async {
    final result = await ShenaiSdk.initialize(ConstantsValues.shenAiAPIkey, "");

    if (result == InitializationResult.success) {
      final displayTexture = await ShenaiSdk.createDisplayTexture();

      _isReadyForMeasurementSubscription =
          ShenaiSdk.isReadyForMeasurementStream()
              .listen((isReadyForMeasurementEvent) {
        _isReadyForMeasurement.add(isReadyForMeasurementEvent);
      });

      _facePositionSubscription =
          ShenaiSdk.getFacePosStream().listen((position) {
        switch (position) {
          case FacePos.ok:
            _facePosition.add(UserFacePos.ok);
            break;
          case FacePos.notCentered:
            _facePosition.add(UserFacePos.notCentered);
            break;
          case FacePos.tooClose:
            _facePosition.add(UserFacePos.tooClose);
            break;
          case FacePos.tooFar:
            _facePosition.add(UserFacePos.tooFar);
            break;
          case FacePos.unstable:
            _facePosition.add(UserFacePos.unstable);
            break;
          case FacePos.invalid:
            _facePosition.add(UserFacePos.invalid);
            break;
        }
      });

      _lightningCondSubscription =
          ShenaiSdk.getLightingCondStream().listen((light) {
        switch (light) {
          case LightingCond.ok:
            _lightningCond.add(LightingState.ok);
            break;
          case LightingCond.dark:
            _lightningCond.add(LightingState.dark);
            break;
          case LightingCond.tooDark:
            _lightningCond.add(LightingState.tooDark);
            break;
          case LightingCond.tooBrightBackground:
            _lightningCond.add(LightingState.tooBrightBackground);
            break;
          case LightingCond.tooBrightFace:
            _lightningCond.add(LightingState.tooBrightFace);
            break;
          case LightingCond.invalid:
            _lightningCond.add(LightingState.invalid);
            break;
        }
      });

      return displayTexture;
    }
    return null;
  }

  @override
  Future<void> attach() async {
    await ShenaiSdk.startMeasurement();
    _latestHeartRateSubscription =
        ShenaiSdk.getLatestHeartRateStream().listen((heartRateEvent) {
      _latestHeartRate.add(heartRateEvent);
    });

    _signalQualityMetricSubscription =
        ShenaiSdk.getCurrentSignalQualityMetricStream()
            .listen((signalQualityMetricEvent) {
      if (!signalQualityMetricEvent.isNaN) {
        _signalQualityMetric.add(signalQualityMetricEvent);
      }
    });

    _measurementStateSubscription =
        ShenaiSdk.getMeasurementStatusStream().listen((status) {
      switch (status) {
        case MeasurementState.failure:
          _measurementState.add(MeasurementFail());
          break;
        case MeasurementState.inProgress:
        case MeasurementState.starting:
          final double progress = ShenaiSdk.getMeasurementProgressPercentage;
          _measurementState.add(MeasurementInProgress(progress / 100));
          break;
        case MeasurementState.success:
          final MeasurementResult result = ShenaiSdk.getMeasurementResult();
          final summaryData = MeasurementSummaryData(
            heartRate: result.heartRateBpm,
            hrv: result.hrvSdnnMs,
            breathingRate: result.breathingRateBpm,
          );
          _measurementState.add(MeasurementEnd(summaryData));
          break;
        default:
          break;
      }
    });

    _latestHeartSignalSubscription =
        ShenaiSdk.getLatestHeartSignalStream().listen((signal) {
      _latestHeartSignal.add(signal);
    });
  }

  @override
  Future<void> detach() async {
    await ShenaiSdk.dispose();
    _latestHeartRateSubscription.cancel();
    _signalQualityMetricSubscription.cancel();
    _measurementStateSubscription.cancel();
    _latestHeartSignalSubscription.cancel();
  }

  @override
  Future<void> deinitializeEngine() async {
    _facePositionSubscription.cancel();
    _lightningCondSubscription.cancel();
    _isReadyForMeasurementSubscription.cancel();
    ShenaiSdk.deinitialize();
  }
}
