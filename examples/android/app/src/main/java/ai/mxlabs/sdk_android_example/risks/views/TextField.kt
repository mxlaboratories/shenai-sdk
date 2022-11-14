package ai.mxlabs.sdk_android_example.risks.views

import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Text
import androidx.compose.material.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AppTextField(
  modifier: Modifier = Modifier,
  text: String,
  isRow: Boolean = false,
  placeholder: String,
  onChange: (String) -> Unit = {},
  keyBoardActions: KeyboardActions = KeyboardActions(),
) {
  val configuration = LocalConfiguration.current

  val screenWidth = configuration.screenWidthDp.dp
  OutlinedTextField(
    modifier = modifier.height(48.dp).width(if (isRow) screenWidth/3 else screenWidth),
    value = text,
    onValueChange = onChange,
    textStyle = TextStyle(fontSize = 14.sp),
    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next, keyboardType = KeyboardType.Number),
    keyboardActions = keyBoardActions,
    colors = TextFieldDefaults.outlinedTextFieldColors(
      focusedBorderColor = Color.Black,
      unfocusedBorderColor = Color.Gray,
      disabledBorderColor = Color.Gray,
      disabledTextColor = Color.Black
    ),
    placeholder = {
      Text(text = placeholder, style = TextStyle(fontSize = 13.sp, color = Color.LightGray))
    }
  )
}