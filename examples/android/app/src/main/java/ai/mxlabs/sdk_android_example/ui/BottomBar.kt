package ai.mxlabs.sdk_android_example.ui

import ai.mxlabs.sdk_android_example.R
import ai.mxlabs.sdk_android_example.theme.AppColors
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults.buttonColors
import androidx.compose.material.LinearProgressIndicator
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment.Companion.CenterHorizontally
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

class BottomBarClass {
    @Composable
    fun BuildView(
        measurementViewModel: MeasurementView,
        measurementButtonOnClick: () -> Unit
    ) {
        val pulseValue by remember { measurementViewModel.heartRate }
        val hrvValue by remember { measurementViewModel.hrv }
        val breathingRateValue by remember { measurementViewModel.breathingRate }
        val isMeasurementValue by remember { measurementViewModel.isMeasurement }
        val isReadyToMeasurementValue by remember { measurementViewModel.isReadyToMeasurement }
        val isLightingWarning by remember { measurementViewModel.lightingWarning }
        val isMovingWarning by remember { measurementViewModel.movingWarning }

        Column(
            verticalArrangement = Arrangement.Bottom,
            horizontalAlignment = CenterHorizontally,
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.Transparent),
            ) {
            Button(
                colors = buttonColors(
                    if ((isReadyToMeasurementValue && !isLightingWarning && !isMovingWarning)
                        || isMeasurementValue) AppColors().mainColorTeal
                    else AppColors().mainColorLightGrey
                ),
                modifier = Modifier.width(100.dp),
                onClick = measurementButtonOnClick,
            ) {
                Text(
                    color = AppColors().white,
                    text = if (isMeasurementValue) "STOP" else "START"
                )
            }
            CustomLinearProgressBar(measurementViewModel.progress.value/10)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Transparent),
                Arrangement.SpaceBetween
            ) {
                Spacer(modifier = Modifier.width(8.dp))
                MeasurementResultTile(
                    resultTitle = "PULL",
                    value = pulseValue,
                    unit = "bpm",
                    iconId = R.drawable.heart_icon
                )
                Spacer(modifier = Modifier.width(8.dp))
                MeasurementResultTile(
                    resultTitle = "HRV",
                    value = hrvValue,
                    unit = "ms",
                    iconId = R.drawable.heart_icon
                )
                Spacer(modifier = Modifier.width(8.dp))
                MeasurementResultTile(
                    resultTitle = "BR",
                    value = breathingRateValue,
                    unit = "bpm",
                    iconId = R.drawable.br_icon
                )

                Spacer(modifier = Modifier.width(8.dp))
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }

    @Composable
    private fun CustomLinearProgressBar(progress: Int){
        Column(modifier = Modifier.fillMaxWidth()) {
            LinearProgressIndicator(
                modifier = Modifier
                    .height(5.dp)
                    .padding(start = 16.dp, end = 16.dp)
                    .fillMaxWidth(),
                backgroundColor = AppColors().mainColorLightGrey,
                color = AppColors().mainColorTeal,
                progress = if (progress > 0)
                    progress.toFloat()/10 else 0.0f
            )
        }
    }
}
