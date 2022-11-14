package model

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel

class MeasurementView : ViewModel() {
    var heartRate = mutableStateOf(0)
    var progress = mutableStateOf(0)
    var breathingRate = mutableStateOf(0)
    var hrv = mutableStateOf(0)
    var isMeasurement = mutableStateOf(false)
    var lightingWarning = mutableStateOf(false)
    var movingWarning = mutableStateOf(false)
    var isReadyToMeasurement = mutableStateOf(false)
    var isFacePositionWarning = mutableStateOf(false)
    var signalQuality = mutableStateOf(0)

    fun updateModelValues(
        heartRateVal: Int = heartRate.value,
        progressVal: Int = progress.value,
        breathingRateVal: Int = breathingRate.value,
        hrvVal: Int = hrv.value,
        isMeasurementVal: Boolean = isMeasurement.value,
        lightingWarningVal: Boolean = lightingWarning.value,
        movingWarningVal: Boolean = movingWarning.value,
        isReadyToMeasurementVal: Boolean = isReadyToMeasurement.value,
        isFacePositionWarningVal: Boolean = isFacePositionWarning.value,
        signalQualityVal: Int = signalQuality.value,
        ) {
        heartRate.value = heartRateVal
        progress.value = progressVal
        hrv.value = hrvVal
        breathingRate.value = breathingRateVal
        isMeasurement.value = isMeasurementVal
        lightingWarning.value = lightingWarningVal
        movingWarning.value = movingWarningVal
        isReadyToMeasurement.value = isReadyToMeasurementVal
        isFacePositionWarning.value = isFacePositionWarningVal
        signalQuality.value = signalQualityVal
    }
}