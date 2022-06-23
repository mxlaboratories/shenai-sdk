import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:rxdart/rxdart.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';
import 'package:shenai_sdk_example/domain/measure/measure_state.dart';
import 'package:shenai_sdk_example/domain/tuple/tuple_2.dart';

part 'pulse_state.dart';

@injectable
class PulseCubit extends Cubit<PulseState> {
  final MeasurementEventsService _measurementService;

  StreamSubscription? _streamSubscription;

  PulseCubit(this._measurementService) : super(PulseInitial()) {
    _streamSubscription = Rx.combineLatest2(
    _measurementService.observeMeasurementState(),
    _measurementService.observeLatestHeartRate(),
        (MeasureState measureState, double pulse) => Tuple2(measureState, pulse),
    ).where((event) => event.item1 is MeasurementInProgress).map((event) => event.item2).listen((pulse) {
      emit(PulseValue(pulse));
    });
  }

  @override
  Future<void> close() {
    _streamSubscription?.cancel();
    return super.close();
  }
}
