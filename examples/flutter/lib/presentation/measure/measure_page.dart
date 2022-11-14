import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/presentation/measure/measure_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/camera_preview.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/close_icon.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/face_position/face_position_cubit.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/measurement_area/measurement_area.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/snr_view/snr_view.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/warning_icon/warning_icon_cubit.dart';
import 'package:shenai_sdk_example/widgets/info_dialog.dart';
import 'package:shenai_sdk_flutter/shenai_sdk_flutter.dart';

class MeasurePage extends StatefulWidget {
  @override
  _MeasurePageState createState() {
    return _MeasurePageState();
  }
}

class _MeasurePageState extends State<MeasurePage> {
  @override
  void initState() {
    super.initState();
    BlocProvider.of<MeasureCubit>(context).initMeasurement();
    BlocProvider.of<FacePositionCubit>(context).init();
    BlocProvider.of<WarningIconCubit>(context).init();
  }

  @override
  void dispose() {
    ShenaiSdk.deinitialize();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocConsumer<MeasureCubit, MeasureCubitState>(
          listener: (_, state) {
            if (state is MeasureFailure) {
              const InfoDialog(message: ConstantsValues.errorText)
                  .show(context);
            }
            if (state is MeasureDeinitialized) {
              Navigator.of(context).pop();
            }
          },
          builder: (_, state) {
            if (state is MeasureLoading) {
              return const Center(child: CircularProgressIndicator());
            } else {
              return Stack(
                children: [
                  if (state is MeasureReady)
                    MeasureCameraPreview(
                      textureId: state.textureId,
                      isMeasurement: state is MeasureInProgress,
                    )
                  else
                    const Center(child: Text(ConstantsValues.notInitText)),
                  MeasurementArea(),
                  const CloseIcon(),
                  SnrView(),
                ],
              );
            }
          },
        ),
      ),
    );
  }
}
