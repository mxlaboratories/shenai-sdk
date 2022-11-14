package ai.mxlabs.sdk_android_example.risks

import ai.mxlabs.sdk_android_example.risks.views.AppTextField
import ai.mxlabs.sdk_android_example.risks.views.CountryCodePickerDialog
import ai.mxlabs.sdk_android_example.risks.views.CountryPickerView
import FormViewModel
import ai.mxlabs.sdk_android_example.risks.views.GenderRadioButton
import ai.mxlabs.sdk_android_example.risks.views.RaceRadioButton
import ai.mxlabs.sdk_android_example.risks.views.YesNoRadioButton
import ai.mxlabs.sdk_android_example.theme.AppColors
import ai.mxlabs.sdk_android_example.utils.getCountriesList
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Button
import androidx.compose.material.ButtonDefaults
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class RisksForm {
  @Composable
  fun BuildView(viewModel: FormViewModel, risksButtonOnClick: () -> Unit) {
    var showDialog by remember { mutableStateOf(false) }
    Column(modifier = Modifier.padding(horizontal = 64.dp, vertical = 16.dp)
      .fillMaxHeight().verticalScroll(rememberScrollState())) {
      val focusManager = LocalFocusManager.current

      Row(modifier = Modifier.fillMaxWidth()) {
        AppTextField(
          isRow = true,
          text = viewModel.age,
          placeholder = "Age",
          onChange = { viewModel.age = it },
          keyBoardActions = KeyboardActions(
            onNext = { focusManager.moveFocus(FocusDirection.Next) }
          )
        )
        Spacer(modifier = Modifier.width(4.dp))
        AppTextField(
          isRow = true,
          text = viewModel.hdlLevel,
          placeholder = "HDL level",
          onChange = { viewModel.hdlLevel = it },
          keyBoardActions = KeyboardActions(
            onNext = { focusManager.moveFocus(FocusDirection.Next) }
          )
        )
      }
      Spacer(modifier = Modifier.height(8.dp))
      Row() {
        AppTextField(
          isRow = true,
          text = viewModel.bodyWeight,
          placeholder = "Weight (kg)",
          onChange = { viewModel.bodyWeight = it },
          keyBoardActions = KeyboardActions(
            onNext = { focusManager.moveFocus(FocusDirection.Next) }
          )
        )
        Spacer(modifier = Modifier.width(4.dp))
        AppTextField(
          isRow = true,
          text = viewModel.bodyHeight,
          placeholder = "Height (cm)",
          onChange = { viewModel.bodyHeight = it },
          keyBoardActions = KeyboardActions(
            onNext = { focusManager.moveFocus(FocusDirection.Next) }
          )
        )
      }
      Spacer(modifier = Modifier.height(8.dp))
      AppTextField(
        text = viewModel.systolicBloodPressure,
        placeholder = "Systolic Blood Pressure",
        onChange = { viewModel.systolicBloodPressure = it },
        keyBoardActions = KeyboardActions(
          onNext = { focusManager.moveFocus(FocusDirection.Next) }
        )
      )
      Spacer(modifier = Modifier.height(8.dp))
      AppTextField(
        text = viewModel.totalCholesterolLevel,
        placeholder = "Total cholesterol level",
        onChange = { viewModel.totalCholesterolLevel = it },
        keyBoardActions = KeyboardActions(
          onNext = { focusManager.moveFocus(FocusDirection.Down) }
        )
      )
      Spacer(modifier = Modifier.height(8.dp))
      Text(text = "Country:", fontSize = 15.sp)
      CountryPickerView(
        selectedCountry = viewModel.country,
        countries = getCountriesList(),
        onSelection = {
          viewModel.country = it
          showDialog = false
        },
      )
      Spacer(modifier = Modifier.height(8.dp))
      Text(text = "Gender:", fontSize = 15.sp)
      GenderRadioButton(
        selectedGender = viewModel.gender,
        onSelection = { viewModel.gender = it }
      )
      Text(text = "Race:", fontSize = 15.sp)
      RaceRadioButton(
        selectedRace = viewModel.race,
        onSelection = { viewModel.race = it }
      )
      Text(text = "Diabetes:", fontSize = 15.sp)
      YesNoRadioButton(
        selectedValue = viewModel.diabetes,
        onSelection = { viewModel.diabetes = it }
      )
      Text(text = "Hypertension treatment:", fontSize = 15.sp)
      YesNoRadioButton(
        selectedValue = viewModel.hypertensionTreatment,
        onSelection = { viewModel.hypertensionTreatment = it }
      )
      Text(text = "Current smoker:", fontSize = 15.sp)
      YesNoRadioButton(
        selectedValue = viewModel.currentSmoker,
        onSelection = { viewModel.currentSmoker = it }
      )
      Button(
        colors = ButtonDefaults.buttonColors(AppColors().mainColorTeal),
        modifier = Modifier.fillMaxWidth(),
        onClick = risksButtonOnClick,
      ) {
        Text(
          color = AppColors().white,
          text = "Show risks"
        )
      }
      if (showDialog)
        CountryCodePickerDialog(getCountriesList(), { selectedCountry ->
          viewModel.country = selectedCountry
        }) {
          showDialog = false
        }
    }
  }
}

