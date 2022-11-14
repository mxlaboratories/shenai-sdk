import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import model.HealthRisksModel

class HealthRisksResultModel : ViewModel() {
  var healthRisksModel by mutableStateOf<HealthRisksModel?>(null)
  var minHealthRisksModel by mutableStateOf<HealthRisksModel?>(null)
  var maxHealthRisksModel by mutableStateOf<HealthRisksModel?>(null)
}