package ai.mxlabs.sdk_android_example.risks

import HealthRisksResultModel
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.roundToInt

class RisksResult {
  @Composable
  fun BuildView(healthRisksResultModel: HealthRisksResultModel) {
    Column(modifier = Modifier.padding(horizontal = 64.dp, vertical = 16.dp)
      .fillMaxHeight().verticalScroll(rememberScrollState())) {
      Text(text = "Cardiovascular diseases:", fontSize = 15.sp)
      if (healthRisksResultModel.healthRisksModel?.overallRisk != null)
        Text(text = "Overall score: ${healthRisksResultModel.healthRisksModel?.overallRisk?.roundToInt()}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.coronaryHeartDiseaseRisk != null)
        Text(text = "Coronary heart disease: ${healthRisksResultModel.healthRisksModel?.coronaryHeartDiseaseRisk?.roundToInt()}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.strokeRisk != null)
        Text(text = "Stroke: ${healthRisksResultModel.healthRisksModel?.strokeRisk?.roundToInt()}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.heartFailureRisk != null)
        Text(text = "Heart failure: ${healthRisksResultModel.healthRisksModel?.heartFailureRisk?.roundToInt()}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.peripheralVascularDiseaseRisk != null)
        Text(text = "Peripheral vascular disease: ${healthRisksResultModel.healthRisksModel?.peripheralVascularDiseaseRisk?.roundToInt()}",
          fontSize = 12.sp)
      Text(text = "Cardiovascular events:", fontSize = 15.sp)
      if (healthRisksResultModel.healthRisksModel?.hardCVEventRisk != null)
        Text(text = "Hard events: ${healthRisksResultModel.healthRisksModel?.hardCVEventRisk?.roundToInt()}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.coronaryDeathEventRisk != null)
        Text(text = "Coronary death: ${healthRisksResultModel.healthRisksModel?.coronaryDeathEventRisk?.roundToInt()}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.fatalStrokeEventRisk != null)
        Text(text = "Fatal stroke: ${healthRisksResultModel.healthRisksModel?.fatalStrokeEventRisk?.roundToInt()}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.totalCVMortalityRisk != null)
        Text(text = "Total cardiovascular mortality (coronary + stroke): ${healthRisksResultModel.healthRisksModel?.totalCVMortalityRisk?.roundToInt()}",
          fontSize = 12.sp)
      Text(text = "Risk score:", fontSize = 15.sp)
      if (healthRisksResultModel.healthRisksModel?.totalScore != null)
        Text(text = "Overall score: ${healthRisksResultModel.healthRisksModel?.totalScore}/${healthRisksResultModel.maxHealthRisksModel?.totalScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.ageScore != null)
        Text(text = "Age: ${healthRisksResultModel.healthRisksModel?.ageScore}/${healthRisksResultModel.maxHealthRisksModel?.ageScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.cholesterolScore != null)
        Text(text = "Total cholesterol: ${healthRisksResultModel.healthRisksModel?.cholesterolScore}/${healthRisksResultModel.maxHealthRisksModel?.cholesterolScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.cholesterolHdlScore != null)
        Text(text = "HDL: ${healthRisksResultModel.healthRisksModel?.cholesterolHdlScore}/${healthRisksResultModel.maxHealthRisksModel?.cholesterolHdlScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.bmiScore != null)
        Text(text = "BMI: ${healthRisksResultModel.healthRisksModel?.bmiScore}/${healthRisksResultModel.maxHealthRisksModel?.bmiScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.sbpScore != null)
        Text(text = "Systolic Blood Pressure: ${healthRisksResultModel.healthRisksModel?.sbpScore}/${healthRisksResultModel.maxHealthRisksModel?.sbpScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.smokingScore != null)
        Text(text = "Smoking: ${healthRisksResultModel.healthRisksModel?.smokingScore}/${healthRisksResultModel.maxHealthRisksModel?.smokingScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.diabetesScore != null)
        Text(text = "Diabetes: ${healthRisksResultModel.healthRisksModel?.diabetesScore}/${healthRisksResultModel.maxHealthRisksModel?.diabetesScore}",
          fontSize = 12.sp)
      if (healthRisksResultModel.healthRisksModel?.vascularAge != null)
        Text(text = "Vascular age: ${healthRisksResultModel.healthRisksModel?.vascularAge}", fontSize = 15.sp)
    }
  }
}