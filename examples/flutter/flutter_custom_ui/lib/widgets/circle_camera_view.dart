import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';
import 'package:shenai_sdk/shenai_view.dart';

class CircleCameraView extends StatelessWidget {
  const CircleCameraView({
    super.key,
    required this.isInitialized,
    required this.showCamera,
    required this.initializationResult,
    required this.cameraViewKey,
  });

  final bool isInitialized;
  final bool showCamera;
  final InitializationResult? initializationResult;
  final Key cameraViewKey;

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: 260,
      child: Stack(
        fit: StackFit.expand,
        children: [
          ClipOval(
            child: ColoredBox(
              color: const Color(0xFFEDEDED),
              child: isInitialized && showCamera
                  ? _CoveringCameraView(cameraViewKey: cameraViewKey)
                  : Center(
                      child: Text(
                        isInitialized
                            ? 'Camera paused'
                            : initializationResult?.name ??
                                  'Missing SHENAI_API_KEY',
                      ),
                    ),
            ),
          ),
          IgnorePointer(
            child: DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.black, width: 2),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CoveringCameraView extends StatelessWidget {
  const _CoveringCameraView({required this.cameraViewKey});

  static const double _portraitCameraAspectRatio = 9 / 16;

  final Key cameraViewKey;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final side = constraints.biggest.shortestSide;
        final cameraHeight = side / _portraitCameraAspectRatio;
        return OverflowBox(
          alignment: Alignment.center,
          minWidth: side,
          maxWidth: side,
          minHeight: cameraHeight,
          maxHeight: cameraHeight,
          child: SizedBox(
            width: side,
            height: cameraHeight,
            child: KeyedSubtree(key: cameraViewKey, child: ShenaiView()),
          ),
        );
      },
    );
  }
}
