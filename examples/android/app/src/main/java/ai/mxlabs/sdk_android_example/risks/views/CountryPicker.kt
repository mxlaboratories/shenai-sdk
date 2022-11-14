package ai.mxlabs.sdk_android_example.risks.views

import ai.mxlabs.sdk_android_example.utils.Country
import ai.mxlabs.sdk_android_example.utils.getFlagEmojiFor
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog

@Composable
fun CountryPickerView(
  selectedCountry: Country?,
  onSelection: (Country) -> Unit,
  countries: List<Country>
) {
  var showDialog by remember { mutableStateOf(false) }
  Text(
    modifier = Modifier
      .clickable { showDialog = true }
      .padding(start = 8.dp),
    fontSize = 15.sp,
    color = if (selectedCountry != null) Color.DarkGray else Color.Gray,
    text = if (selectedCountry != null)
      "${getFlagEmojiFor(selectedCountry.nameCode)} ${selectedCountry.fullName}"
    else "Select Country",
  )

  if (showDialog)
    CountryCodePickerDialog(countries, onSelection) {
      showDialog = false
    }
}

@Composable
fun CountryCodePickerDialog(
  countries: List<Country>,
  onSelection: (Country) -> Unit,
  dismiss: () -> Unit,
) {
  Dialog(onDismissRequest = dismiss) {
    Box {
      LazyColumn(
        Modifier
          .fillMaxWidth()
          .padding(horizontal = 30.dp, vertical = 40.dp)
          .background(shape = RoundedCornerShape(20.dp), color = Color.White)
      ) {
        for (country in countries) {
          item {
            Text(
              fontSize = 14.sp,
              modifier = Modifier
                .clickable {
                  onSelection(country)
                  dismiss()
                }
                .fillMaxWidth()
                .padding(10.dp),
              text = "${getFlagEmojiFor(country.nameCode)} ${country.fullName}"
            )
          }
        }
      }
    }
  }
}