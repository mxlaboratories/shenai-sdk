package ai.mxlabs.sdk_android_example.ui

import ai.mxlabs.sdk_android_example.R
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import model.MeasurementView

class WarningIconClass {
    @Composable
    fun BuildView(measurementView: MeasurementView) {
        val isLightingWarning by remember { measurementView.lightingWarning }
        val isMovingWarning by remember { measurementView.movingWarning }

        if (isLightingWarning || isMovingWarning) {
            Column(
                verticalArrangement = Arrangement.Top,
                horizontalAlignment = CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp)
                    .background(Color.Transparent),
            ) {
                if (isLightingWarning || isMovingWarning)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp)
                        .background(Color.Transparent),
                    Arrangement.SpaceBetween
                ) {
                    Image(
                        painter = painterResource(
                            id = if (isLightingWarning) R.drawable.brightness
                            else R.drawable.vibrate
                        ),
                        contentDescription = "Heart Rate",
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}
