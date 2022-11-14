package ai.mxlabs.sdk_android_example.risks

import FormViewModel
import HealthRisksResultModel
import ai.mxlabs.sdk_android_example.theme.ShenaiSdkAndroidTheme
import ai.mxlabs.shenai_sdk_android.ShenAIAndroidSDK
import androidx.compose.ui.platform.ComposeView
import model.HealthRisksModel
import java.util.*
import kotlin.jvm.optionals.getOrNull

class RiskPage {
  private val formViewModel = FormViewModel()
  private val healthRisksResultModel = HealthRisksResultModel()

  fun showMeasurementView(pageView: ComposeView, shenaiSDKHandler: ShenAIAndroidSDK) {
    pageView.setContent {
      ShenaiSdkAndroidTheme {
        RisksForm().BuildView(formViewModel, risksButtonOnClick = {
          val risksFactors: ShenAIAndroidSDK.RisksFactors = mapRisksFactors(formViewModel)
          val risks = shenaiSDKHandler.computeHealthRisks(risksFactors)
          val maxRisks = shenaiSDKHandler.getMaximalHealthRisks(risksFactors)
          val minRisks = shenaiSDKHandler.getMinimalHealthRisks(risksFactors)
          healthRisksResultModel.healthRisksModel = mapHealthRisks(risks)
          healthRisksResultModel.maxHealthRisksModel = mapHealthRisks(maxRisks)
          healthRisksResultModel.minHealthRisksModel = mapHealthRisks(minRisks)

          pageView.setContent {
            ShenaiSdkAndroidTheme {
              RisksResult().BuildView(healthRisksResultModel)
            }
          }
        })
      }
    }
  }

  @OptIn(ExperimentalStdlibApi::class)
  private fun mapHealthRisks(risks: ShenAIAndroidSDK.HealthRisks): HealthRisksModel {
    val healthRisksModel = HealthRisksModel()
    healthRisksModel.vascularAge = risks.vascularAge.getOrNull()
    healthRisksModel.ageScore = risks.scores.ageScore.getOrNull()
    healthRisksModel.bmiScore = risks.scores.bmiScore.getOrNull()
    healthRisksModel.cholesterolHdlScore = risks.scores.cholesterolHdlScore.getOrNull()
    healthRisksModel.cholesterolScore = risks.scores.cholesterolScore.getOrNull()
    healthRisksModel.diabetesScore = risks.scores.diabetesScore.getOrNull()
    healthRisksModel.sbpScore = risks.scores.sbpScore.getOrNull()
    healthRisksModel.smokingScore = risks.scores.smokingScore.getOrNull()
    healthRisksModel.totalScore = risks.scores.totalScore.getOrNull()
    healthRisksModel.coronaryDeathEventRisk =
      risks.hardAndFatalEvents.coronaryDeathEventRisk.getOrNull()?.toDouble()
    healthRisksModel.coronaryHeartDiseaseRisk =
      risks.cvDiseases.coronaryHeartDiseaseRisk.getOrNull()?.toDouble()
    healthRisksModel.fatalStrokeEventRisk =
      risks.hardAndFatalEvents.fatalStrokeEventRisk.getOrNull()?.toDouble()
    healthRisksModel.hardCVEventRisk =
      risks.hardAndFatalEvents.hardCVEventRisk.getOrNull()?.toDouble()
    healthRisksModel.heartFailureRisk = risks.cvDiseases.heartFailureRisk.getOrNull()?.toDouble()
    healthRisksModel.overallRisk = risks.cvDiseases.overallRisk.getOrNull()?.toDouble()
    healthRisksModel.peripheralVascularDiseaseRisk =
      risks.cvDiseases.peripheralVascularDiseaseRisk.getOrNull()?.toDouble()
    healthRisksModel.strokeRisk = risks.cvDiseases.strokeRisk.getOrNull()?.toDouble()
    healthRisksModel.totalCVMortalityRisk =
      risks.hardAndFatalEvents.totalCVMortalityRisk.getOrNull()?.toDouble()

    return healthRisksModel
  }

  private fun mapRisksFactors(formViewModel: FormViewModel): ShenAIAndroidSDK.RisksFactors {
    val risksFactors = ShenAIAndroidSDK().RisksFactors()
    if (formViewModel.age.isNotEmpty()) {
      risksFactors.age = Optional.of(formViewModel.age.toInt())
    }
    if (formViewModel.bodyHeight.isNotEmpty()) {
      risksFactors.bodyHeight = Optional.of(formViewModel.bodyHeight.toFloat())
    }
    if (formViewModel.bodyWeight.isNotEmpty()) {
      risksFactors.bodyWeight = Optional.of(formViewModel.bodyWeight.toFloat())
    }
    if (formViewModel.currentSmoker.isNotEmpty()) {
      risksFactors.isSmoker = Optional.of(formViewModel.currentSmoker == "Yes")
    }
    if (formViewModel.diabetes.isNotEmpty()) {
      risksFactors.hasDiabetes = Optional.of(formViewModel.diabetes == "Yes")
    }
    if (formViewModel.hypertensionTreatment.isNotEmpty()) {
      risksFactors.hypertensionTreatment = Optional.of(formViewModel.hypertensionTreatment == "Yes")
    }
    if (formViewModel.hdlLevel.isNotEmpty()) {
      risksFactors.cholesterolHdl = Optional.of(formViewModel.hdlLevel.toFloat())
    }
    if (formViewModel.systolicBloodPressure.isNotEmpty()) {
      risksFactors.sbp = Optional.of(formViewModel.systolicBloodPressure.toFloat())
    }
    if (formViewModel.totalCholesterolLevel.isNotEmpty()) {
      risksFactors.cholesterol = Optional.of(formViewModel.totalCholesterolLevel.toFloat())
    }
    if (formViewModel.race.isNotEmpty()) {
      risksFactors.race = when (formViewModel.race) {
        "White" -> Optional.of(ShenAIAndroidSDK.Race.WHITE)
        "AfricanAmerican" -> Optional.of(ShenAIAndroidSDK.Race.AFRICAN_AMERICAN)
        else -> Optional.of(ShenAIAndroidSDK.Race.OTHER)
      }
    }
    if (formViewModel.country != null) {
      risksFactors.country = formViewModel.country!!.nameCode.uppercase()
    }
    if (formViewModel.gender.isNotEmpty()) {
      risksFactors.gender = if (formViewModel.gender == "Male") Optional.of(ShenAIAndroidSDK.Gender.MALE)
      else Optional.of(ShenAIAndroidSDK.Gender.FEMALE)
    }

    return risksFactors
  }
}

