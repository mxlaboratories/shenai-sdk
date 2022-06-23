import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

class MeasureFaceOutline extends CustomPainter {
  final Color frameColor;

  MeasureFaceOutline(this.frameColor);

  @override
  void paint(ui.Canvas canvas, ui.Size size) {
    final Path path = Path();
    final Rect rect = Rect.fromCenter(
      center: size.center(Offset.zero),
      width: size.width * 0.95,
      height: size.width * 0.95,
    );

    path.addArc(
      rect.translate(0.0, -rect.height * 0.4),
      math.pi * 9.0 / 8.0,
      math.pi * 2.0 / 8.0,
    );
    path.addArc(
      rect.translate(0.0, -rect.height * 0.4),
      math.pi * 13.0 / 8.0,
      math.pi * 2.0 / 8.0,
    );
    path.addArc(
      rect.translate(0.0, rect.height * 0.00),
      math.pi * 1.0 / 8.0,
      math.pi * 2.0 / 8.0,
    );
    path.addArc(
      rect.translate(0.0, rect.height * 0.00),
      math.pi * 5.0 / 8.0,
      math.pi * 2.0 / 8.0,
    );

    canvas.drawPath(
      path,
      Paint()
        ..filterQuality = FilterQuality.low
        ..isAntiAlias = true
        ..strokeWidth = 8
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..style = PaintingStyle.stroke
        ..color = frameColor
        ..blendMode = BlendMode.screen,
    );
  }

  @override
  bool shouldRepaint(MeasureFaceOutline oldDelegate) {
    return frameColor != oldDelegate.frameColor;
  }
}
