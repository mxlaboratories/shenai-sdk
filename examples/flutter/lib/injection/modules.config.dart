// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:get_it/get_it.dart' as _i1;
import 'package:injectable/injectable.dart' as _i2;

import '../data/shen_ai_health_risks_event_service.dart' as _i12;
import '../data/shen_ai_measurement_event_service.dart' as _i13;
import '../domain/measure/measure_events_service.dart' as _i4;
import '../domain/risks/health_risks_events_service.dart' as _i3;
import '../presentation/measure/measure_cubit.dart' as _i10;
import '../presentation/measure/measure_values_cubits/pulse/pulse_cubit.dart'
    as _i5;
import '../presentation/measure/widgets/face_position/face_position_cubit.dart'
    as _i9;
import '../presentation/measure/widgets/snr_view/snr_cubit.dart' as _i7;
import '../presentation/measure/widgets/warning_icon/warning_icon_cubit.dart'
    as _i8;
import '../presentation/risks/risks_cubit.dart' as _i6;
import 'services_module.dart' as _i11; // ignore_for_file: unnecessary_lambdas

// ignore_for_file: lines_longer_than_80_chars
/// initializes the registration of provided dependencies inside of [GetIt]
_i1.GetIt $initGetIt(
  _i1.GetIt get, {
  String? environment,
  _i2.EnvironmentFilter? environmentFilter,
}) {
  final gh = _i2.GetItHelper(
    get,
    environment,
    environmentFilter,
  );
  final navigationModule = _$NavigationModule();
  gh.lazySingleton<_i3.HealthRisksEventsService>(
      () => navigationModule.shenAiHealthRisksEventService);
  gh.lazySingleton<_i4.MeasurementEventsService>(
      () => navigationModule.shenAiMeasurementEventService);
  gh.factory<_i5.PulseCubit>(
      () => _i5.PulseCubit(get<_i4.MeasurementEventsService>()));
  gh.factory<_i6.RisksCubit>(
      () => _i6.RisksCubit(get<_i3.HealthRisksEventsService>()));
  gh.factory<_i7.SnrCubit>(
      () => _i7.SnrCubit(get<_i4.MeasurementEventsService>()));
  gh.factory<_i8.WarningIconCubit>(
      () => _i8.WarningIconCubit(get<_i4.MeasurementEventsService>()));
  gh.factory<_i9.FacePositionCubit>(
      () => _i9.FacePositionCubit(get<_i4.MeasurementEventsService>()));
  gh.factory<_i10.MeasureCubit>(
      () => _i10.MeasureCubit(get<_i4.MeasurementEventsService>()));
  return get;
}

class _$NavigationModule extends _i11.NavigationModule {
  @override
  _i12.ShenAiHealthRisksEventService get shenAiHealthRisksEventService =>
      _i12.ShenAiHealthRisksEventService();
  @override
  _i13.ShenAiMeasurementEventService get shenAiMeasurementEventService =>
      _i13.ShenAiMeasurementEventService();
}
