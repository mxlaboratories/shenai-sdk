import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:injectable/injectable.dart';
import 'package:shenai_sdk_example/domain/risks/health_risk_factor.dart';
import 'package:shenai_sdk_example/domain/risks/health_risks_events_service.dart';
import 'package:shenai_sdk_example/domain/risks/model/health_risks_result_model.dart';

part 'risks_state.dart';

@injectable
class RisksCubit extends Cubit<RisksState> {
  final HealthRisksEventsService _healthRisksEventsService;

  RisksCubit(this._healthRisksEventsService) : super(RisksLoading());

  Future<void> loadData(HealthRiskFactor userData) async {
    emit(RisksLoading());
    try {
      final HealthRisksResultModel risks = _healthRisksEventsService.getHealthRisks(userData);
      emit(RisksLoaded(risks));
    } catch (e) {
      emit(RisksError(e));
    }
  }
}
