package model

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

class HealthRisksModel : ViewModel() {
  var ageScore by mutableStateOf<Int?>(null)
  var sbpScore by mutableStateOf<Int?>(null)
  var smokingScore by mutableStateOf<Int?>(null)
  var diabetesScore by mutableStateOf<Int?>(null)
  var bmiScore by mutableStateOf<Int?>(null)
  var cholesterolScore by mutableStateOf<Int?>(null)
  var cholesterolHdlScore by mutableStateOf<Int?>(null)
  var totalScore by mutableStateOf<Int?>(null)
  var vascularAge by mutableStateOf<Int?>(null)
  var overallRisk by mutableStateOf<Double?>(null)
  var coronaryHeartDiseaseRisk by mutableStateOf<Double?>(null)
  var strokeRisk by mutableStateOf<Double?>(null)
  var heartFailureRisk by mutableStateOf<Double?>(null)
  var peripheralVascularDiseaseRisk by mutableStateOf<Double?>(null)
  var coronaryDeathEventRisk by mutableStateOf<Double?>(null)
  var fatalStrokeEventRisk by mutableStateOf<Double?>(null)
  var totalCVMortalityRisk by mutableStateOf<Double?>(null)
  var hardCVEventRisk by mutableStateOf<Double?>(null)
}