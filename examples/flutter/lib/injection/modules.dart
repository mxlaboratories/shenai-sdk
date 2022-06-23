import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:shenai_sdk_example/injection/modules.config.dart';

void registerModules(GetIt injector) {
  configureInjection(injector);
}

@injectableInit
void configureInjection(GetIt getIt) => $initGetIt(getIt);
