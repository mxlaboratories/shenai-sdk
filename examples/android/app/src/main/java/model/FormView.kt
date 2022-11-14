import ai.mxlabs.sdk_android_example.utils.Country
import ai.mxlabs.sdk_android_example.utils.getCountriesList
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

class FormViewModel : ViewModel() {
  var age by mutableStateOf("")
  var gender by mutableStateOf("")
  var race by mutableStateOf("")
  var systolicBloodPressure by mutableStateOf("")
  var hdlLevel by mutableStateOf("")
  var totalCholesterolLevel by mutableStateOf("")
  var bodyHeight by mutableStateOf("")
  var bodyWeight by mutableStateOf("")
  var country by mutableStateOf<Country?>(null)
  var currentSmoker by mutableStateOf("")
  var hypertensionTreatment by mutableStateOf("")
  var diabetes by mutableStateOf("")
}