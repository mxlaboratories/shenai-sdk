package ai.mxlabs.sdk_android_example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

class TopBarClass {

  @Composable
  fun BuildView(measurementView: MeasurementView) {
    val signalQuality by remember { measurementView.signalQuality }

    Row(
      modifier = Modifier.padding(horizontal = 8.dp, vertical = 16.dp), Arrangement.End
    ) {
      Box(
        modifier = Modifier.size(13.dp).clip(CircleShape).background(
          Color.White.copy(alpha = if (signalQuality > 1) 1f else 0.5f)
        ),
      )
      Spacer(modifier = Modifier.width(4.dp))
      Box(
        modifier = Modifier.size(13.dp).clip(CircleShape).background(
          Color.White.copy(alpha = if (signalQuality > 4) 1f else 0.5f)
        ),
      )
      Spacer(modifier = Modifier.width(4.dp))
      Box(
        modifier = Modifier.size(13.dp).clip(CircleShape).background(
          Color.White.copy(alpha = if (signalQuality > 7) 1f else 0.5f)
        ),
      )
    }
  }
}
