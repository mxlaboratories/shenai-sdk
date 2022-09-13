// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:get_it/get_it.dart' as _i1;
import 'package:injectable/injectable.dart' as _i2;

import '../data/shen_ai_measurement_event_service.dart' as _i10;
import '../domain/measure/measure_events_service.dart' as _i3;
import '../presentation/measure/measure_cubit.dart' as _i8;
import '../presentation/measure/measure_values_cubits/pulse/pulse_cubit.dart'
    as _i4;
import '../presentation/measure/widgets/face_position/face_position_cubit.dart'
    as _i7;
import '../presentation/measure/widgets/snr_view/snr_cubit.dart' as _i5;
import '../presentation/measure/widgets/warning_icon/warning_icon_cubit.dart'
    as _i6;
import 'measurement_module.dart' as _i9; // ignore_for_file: unnecessary_lambdas

// ignore_for_file: lines_longer_than_80_chars
/// initializes the registration of provided dependencies inside of [GetIt]
_i1.GetIt $initGetIt(_i1.GetIt get,
    {String? environment, _i2.EnvironmentFilter? environmentFilter}) {
  final gh = _i2.GetItHelper(get, environment, environmentFilter);
  final navigationModule = _$NavigationModule();
  gh.lazySingleton<_i3.MeasurementEventsService>(
      () => navigationModule.shenAiMeasurementEventService);
  gh.factory<_i4.PulseCubit>(
      () => _i4.PulseCubit(get<_i3.MeasurementEventsService>()));
  gh.factory<_i5.SnrCubit>(
      () => _i5.SnrCubit(get<_i3.MeasurementEventsService>()));
  gh.factory<_i6.WarningIconCubit>(
      () => _i6.WarningIconCubit(get<_i3.MeasurementEventsService>()));
  gh.factory<_i7.FacePositionCubit>(
      () => _i7.FacePositionCubit(get<_i3.MeasurementEventsService>()));
  gh.factory<_i8.MeasureCubit>(
      () => _i8.MeasureCubit(get<_i3.MeasurementEventsService>()));
  return get;
}

class _$NavigationModule extends _i9.NavigationModule {
  @override
  _i10.ShenAiMeasurementEventService get shenAiMeasurementEventService =>
      _i10.ShenAiMeasurementEventService();
}
