import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/face_frame/measure_face_outline.dart';
import 'package:shenai_sdk_example/presentation/measure/widgets/warning_icon/warning_icon.dart';
import 'package:shenai_sdk_example/style/colors.dart';

class FaceFrame extends StatefulWidget {
  final bool isPosCorrect;
  final bool isMeasurement;
  final int textureId;

  const FaceFrame({
    Key? key,
    required this.isPosCorrect,
    required this.textureId,
    required this.isMeasurement,
  }) : super(key: key);

  @override
  _FaceFrameState createState() => _FaceFrameState();
}

class _FaceFrameState extends State<FaceFrame> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
     _controller.repeat();
  }

  @override
  void didUpdateWidget(FaceFrame oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller.view,
      builder: (BuildContext context, _) {
        double o = AppColors.cameraOverlayBackgroundColor.opacity;
        final double v = Curves.easeOutCubic.transform(_controller.value);
        o = 1.0 - v / 2;
        return CustomPaint(
          foregroundPainter: MeasureFaceOutline(widget.isMeasurement && widget.isPosCorrect
              ? Colors.transparent
              : widget.isPosCorrect
              ? AppColors.cameraOverlayBackgroundFadedColor
              : AppColors.cameraOverlayBackgroundColor.withOpacity(o),
          ),
          child: Transform(
            alignment: Alignment.center,
            transform: Platform.isIOS ? Matrix4.rotationX(math.pi) : Matrix4.identity(),
            child: Stack(
              children: [
                FractionallySizedBox(
                  heightFactor: 1,
                  widthFactor: 1.4,
                  child: Texture(textureId: widget.textureId),
                ),
                const WarningIcon()
              ],
            ),
          ),
        );
      },
    );
  }
}
