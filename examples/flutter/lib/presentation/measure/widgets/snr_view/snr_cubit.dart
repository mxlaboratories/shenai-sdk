import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:rxdart/rxdart.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';
import 'package:shenai_sdk_example/domain/measure/measure_state.dart';
import 'package:shenai_sdk_example/domain/tuple/tuple_2.dart';

part 'snr_state.dart';

@injectable
class SnrCubit extends Cubit<SnrState> {
  final MeasurementEventsService _measurementService;

  StreamSubscription? _streamSubscription;

  SnrCubit(this._measurementService) : super(SnrInitial()) {
    _streamSubscription = Rx.combineLatest2(
      _measurementService.observeMeasurementState(),
      _measurementService.observeCurrentSignalQualityMetric(),
      (MeasureState measureState, double snr) => Tuple2(measureState, snr),
    ).where((event) => event.item1 is MeasurementInProgress).map((event) => event.item2).listen((snr) {
      emit(SnrValue(snr.toInt()));
    });
  }

  @override
  Future<void> close() {
    _streamSubscription?.cancel();
    return super.close();
  }
}
