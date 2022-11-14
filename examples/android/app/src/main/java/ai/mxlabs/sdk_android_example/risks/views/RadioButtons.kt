package ai.mxlabs.sdk_android_example.risks.views

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.RadioButton
import androidx.compose.material.RadioButtonDefaults
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.sp

@Composable
fun GenderRadioButton(
  selectedGender: String?,
  onSelection: (String) -> Unit,
) {
  val labelMale = "Male"
  val labelFemale = "Female"
  Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
    RadioButton(
      colors = RadioButtonDefaults.colors(
        selectedColor = Color.Green,
        unselectedColor = Color.Gray,
        disabledColor = Color.LightGray
      ),
      selected = selectedGender == labelMale,
      onClick = { onSelection(labelMale) }
    )
    Text(
      modifier = Modifier.clickable(onClick = { onSelection(labelMale) }),
      text = labelMale,
      fontSize = 14.sp
    )
    RadioButton(
      colors = RadioButtonDefaults.colors(
        selectedColor = Color.Green,
        unselectedColor = Color.Gray,
        disabledColor = Color.LightGray
      ),
      selected = selectedGender == labelFemale,
      onClick = { onSelection(labelFemale) }
    )
    Text(
      modifier = Modifier.clickable(onClick = { onSelection(labelFemale) }),
      text = labelFemale,
      fontSize = 14.sp
    )
  }
}
@Composable
fun YesNoRadioButton(
  selectedValue: String?,
  onSelection: (String) -> Unit,
) {
  val labelYes = "Yes"
  val labelNo = "No"
  Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
    RadioButton(
      colors = RadioButtonDefaults.colors(
        selectedColor = Color.Green,
        unselectedColor = Color.Gray,
        disabledColor = Color.LightGray
      ),
      selected = selectedValue == labelYes,
      onClick = { onSelection(labelYes) }
    )
    Text(
      modifier = Modifier.clickable(onClick = { onSelection(labelYes) }),
      text = labelYes,
      fontSize = 14.sp,
      fontFamily = FontFamily.SansSerif
    )
    RadioButton(
      colors = RadioButtonDefaults.colors(
        selectedColor = Color.Green,
        unselectedColor = Color.Gray,
        disabledColor = Color.LightGray
      ),
      selected = selectedValue == labelNo,
      onClick = { onSelection(labelNo) }
    )
    Text(
      modifier = Modifier.clickable(onClick = { onSelection(labelNo) }),
      text = labelNo,
      fontSize = 14.sp,
      fontFamily = FontFamily.SansSerif
    )
  }
}

@Composable
fun RaceRadioButton(
  selectedRace: String?,
  onSelection: (String) -> Unit,
) {
  val labelWhite = "White"
  val labelAfricanAmerican = "AfricanAmerican"
  val labelOther = "Other"
  Column(Modifier.fillMaxWidth()) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      RadioButton(
        colors = RadioButtonDefaults.colors(
          selectedColor = Color.Green,
          unselectedColor = Color.Gray,
          disabledColor = Color.LightGray
        ),
        selected = selectedRace == labelWhite,
        onClick = { onSelection(labelWhite) }
      )
      Text(
        modifier = Modifier.clickable(onClick = { onSelection(labelWhite) }),
        text = labelWhite,
        fontSize = 14.sp
      )
    }
    Row(verticalAlignment = Alignment.CenterVertically) {
      RadioButton(
        colors = RadioButtonDefaults.colors(
          selectedColor = Color.Green,
          unselectedColor = Color.Gray,
          disabledColor = Color.LightGray
        ),
        selected = selectedRace == labelAfricanAmerican,
        onClick = { onSelection(labelAfricanAmerican) }
      )
      Text(
        modifier = Modifier.clickable(onClick = { onSelection(labelAfricanAmerican) }),
        text = labelAfricanAmerican,
        fontSize = 14.sp
      )
    }
    Row(verticalAlignment = Alignment.CenterVertically) {
      RadioButton(
        colors = RadioButtonDefaults.colors(
          selectedColor = Color.Green,
          unselectedColor = Color.Gray,
          disabledColor = Color.LightGray
        ),
        selected = selectedRace == labelOther,
        onClick = { onSelection(labelOther) }
      )
      Text(
        modifier = Modifier.clickable(onClick = { onSelection(labelOther) }),
        text = labelOther,
        fontSize = 14.sp
      )
    }
  }
}