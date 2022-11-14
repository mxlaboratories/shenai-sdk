import 'package:injectable/injectable.dart';
import 'package:shenai_sdk_example/data/shen_ai_health_risks_event_service.dart';
import 'package:shenai_sdk_example/data/shen_ai_measurement_event_service.dart';
import 'package:shenai_sdk_example/domain/measure/measure_events_service.dart';
import 'package:shenai_sdk_example/domain/risks/health_risks_events_service.dart';

@module
abstract class NavigationModule {
  @LazySingleton(as: MeasurementEventsService)
  ShenAiMeasurementEventService get shenAiMeasurementEventService;
  @LazySingleton(as: HealthRisksEventsService)
  ShenAiHealthRisksEventService get shenAiHealthRisksEventService;
}
