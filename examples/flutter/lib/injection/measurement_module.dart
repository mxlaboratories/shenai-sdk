import 'package:injectable/injectable.dart';
import 'package:shenai_sdk_example/data/shen_ai_measurement_event_service.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';

@module
abstract class NavigationModule {
  @LazySingleton(as: MeasurementEventsService)
  ShenAiMeasurementEventService get shenAiMeasurementEventService;
}
