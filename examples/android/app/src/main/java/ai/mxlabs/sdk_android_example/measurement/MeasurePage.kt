package ai.mxlabs.sdk_android_example.measurement

import ai.mxlabs.sdk_android_example.theme.ShenaiSdkAndroidTheme
import ai.mxlabs.sdk_android_example.ui.*
import ai.mxlabs.shenai_sdk_android.ShenAIAndroidSDK
import androidx.compose.material.Surface
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import kotlinx.coroutines.*

class MeasurePage {
  private val shenaiSDKHandler = ShenAIAndroidSDK()
  private val measurementView = MeasurementView()
  private var measurementJob: Job? = null
  private val scope = MainScope()

  fun showMeasurementView(bottomBar: ComposeView) {
    checkMeasurementData()
    bottomBar.setContent {
      ShenaiSdkAndroidTheme {
        Surface(
          color = Color.Transparent,
        ) {
          TopBarClass().BuildView(measurementView = measurementView)
          FaceOutlineClass().BuildView(measurementView = measurementView)
          WarningIconClass().BuildView(measurementView)
          BottomBarClass().BuildView(
            measurementViewModel = measurementView,
            measurementButtonOnClick = {
              if (measurementView.isMeasurement.value) {
                endMeasurement()
              } else if (measurementView.isReadyToMeasurement.value
                && !measurementView.movingWarning.value
              ) {
                startMeasurement()
              }
            },
          )
        }
      }
    }
  }

  private fun checkMeasurementData() {
    measurementJob = scope.launch {
      while (measurementJob != null && scope.isActive) {
        if (shenaiSDKHandler.isInitialized) {

          val status = shenaiSDKHandler.engineState.name
          val face = shenaiSDKHandler.faceState.name
          measurementView.updateModelValues(
            lightingWarningVal = shenaiSDKHandler.lightingConditions.name != ShenAIAndroidSDK.LightingConditions.OK.name,
            movingWarningVal = shenaiSDKHandler.faceState.name == ShenAIAndroidSDK.FaceState.UNSTABLE.name,
            isReadyToMeasurementVal = status == ShenAIAndroidSDK.EngineState.READY.name,
            isFacePositionWarningVal = face != ShenAIAndroidSDK.FaceState.OK.name,
            isMeasurementVal = shenaiSDKHandler.isMeasuring,
          )
          if (measurementView.isMeasurement.value) {
            measurementView.updateModelValues(
              heartRateVal = shenaiSDKHandler.latestHeartRate.toInt(),
              progressVal = shenaiSDKHandler.measurementProgressPercentage.toInt(),
              signalQualityVal = shenaiSDKHandler.currentSignalQualityMetric.toInt(),
            )

            if (status == ShenAIAndroidSDK.EngineState.SUCCESS.name) {
              val measurementSummary = shenaiSDKHandler.latestMeasurementSummary
              measurementView.updateModelValues(
                heartRateVal = measurementSummary.hr_bpm.toInt(),
                hrvVal = measurementSummary.hr_bpm.toInt(),
                breathingRateVal = measurementSummary.br_bpm.toInt(),
              )
            }
          }
        }

        delay(1000)
      }
    }
  }

  private fun startMeasurement() {
    measurementView.updateModelValues(
      hrvVal = 0,
      breathingRateVal = 0,
    )
    shenaiSDKHandler.beginMeasurement()
  }

  private fun endMeasurement() {
    shenaiSDKHandler.abortMeasurement()
  }
}