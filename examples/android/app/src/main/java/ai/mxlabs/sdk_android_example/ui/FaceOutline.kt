package ai.mxlabs.sdk_android_example.ui

import ai.mxlabs.sdk_android_example.theme.AppColors
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import model.MeasurementView

class FaceOutlineClass {
  @Composable
  fun BuildView(measurementView: MeasurementView) {
    val isFacePositionWarning by remember { measurementView.isFacePositionWarning }

    Column(
      modifier = Modifier
        .fillMaxSize()
        .padding(top = 16.dp)
    ) {
      FaceOutlineComposable(
        modifier = Modifier
          .fillMaxSize(),
        frameColor = if (isFacePositionWarning)
          Color(color = AppColors().cameraOverlayBackgroundFadedColor)
          else Color.Transparent,
      )
    }
  }

  @Composable
  private fun FaceOutlineComposable(modifier: Modifier, frameColor: Color) {


    val path = remember { Path() }

    Canvas(modifier = modifier) {
      if (path.isEmpty) {
        val canvasWidth = size.width
        val canvasHeight = size.height
        val width = size.width * 0.95f

        val rect = Rect(
          offset = Offset((canvasWidth - width) / 2, (canvasHeight - width) / 2),
          size = Size(width, width)
        )

        path.apply {
          addArcRad(
            rect.translate(0.0f, -rect.height * 0.4f),
            (Math.PI * 9.0 / 8.0).toFloat(),
            (Math.PI * 2.0 / 8.0).toFloat(),
          )
          addArcRad(
            rect.translate(0.0f, -rect.height * 0.4f),
            (Math.PI * 13.0 / 8.0).toFloat(),
            (Math.PI * 2.0 / 8.0).toFloat(),
          )
          addArcRad(
            rect,
            (Math.PI * 1.0 / 8.0).toFloat(),
            (Math.PI * 2.0 / 8.0).toFloat(),
          )
          addArcRad(
            rect,
            (Math.PI * 5.0 / 8.0).toFloat(),
            (Math.PI * 2.0 / 8.0).toFloat(),
          )
        }
      }

      with(drawContext.canvas.nativeCanvas) {
        val checkPoint = saveLayer(null, null)

        drawPath(
          path = path,
          color = frameColor,
          style = Stroke(
            width = 8.dp.toPx(),
            cap = StrokeCap.Round,
            join = StrokeJoin.Round
          ),
          blendMode = BlendMode.Screen
        )

        restoreToCount(checkPoint)
      }
    }
  }
}
