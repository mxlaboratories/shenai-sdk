package ai.mxlabs.sdk_android_kotlin_custom_ui_example

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK
import ai.mxlabs.shenai_sdk.ShenAIView
import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Outline
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewOutlineProvider
import android.view.WindowManager
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission
import androidx.core.content.ContextCompat
import java.util.Locale
import java.util.Optional
import kotlin.math.max
import kotlin.math.roundToInt

class MainActivity : ComponentActivity() {
    private val shenaiSDKHandler = ShenAIAndroidSDK()
    private val handler = Handler(Looper.getMainLooper())
    private var profile = RiskProfile.defaults()
    private var currentScreen = AppScreen.MEASURE
    private var riskFormReturnScreen = AppScreen.MEASURE

    private var initializationResult: ShenAIAndroidSDK.InitializationResult? = null
    private var progressBar: ProgressBar? = null
    private var statusText: TextView? = null
    private var qualityGrid: LinearLayout? = null
    private var headlineGrid: LinearLayout? = null
    private var startButton: Button? = null
    private var stopButton: Button? = null
    private var resultsButton: Button? = null

    private var isPolling = false
    private var isResettingMeasurement = false
    private var measurementState: ShenAIAndroidSDK.MeasurementState? = null
    private var realtimeMetrics: ShenAIAndroidSDK.MeasurementResults? = null
    private var results: ShenAIAndroidSDK.MeasurementResults? = null
    private var healthRisks: ShenAIAndroidSDK.HealthRisks? = null
    private var violatedCondition: ShenAIAndroidSDK.MeasurementEnvironmentCondition? = null
    private var hasReachedFinalizing = false
    private var hasFinishedMeasurement = false
    private var progress = 0f

    private val pollTask = object : Runnable {
        override fun run() {
            if (currentScreen == AppScreen.MEASURE) {
                refreshSdkState(false)
                handler.postDelayed(this, POLLING_INTERVAL_MS)
            }
        }
    }

    private val requestPermissionLauncher = registerForActivityResult(RequestPermission()) { isGranted ->
        if (isGranted) {
            initializeAndShowMeasurement()
        } else {
            Toast.makeText(this, "Camera permission is required for this demo.", Toast.LENGTH_LONG).show()
            showMeasurementScreen()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        if (API_KEY.isEmpty()) {
            showMeasurementScreen()
            Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show()
            return
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initializeAndShowMeasurement()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun initializeAndShowMeasurement() {
        if (API_KEY.isEmpty()) {
            showMeasurementScreen()
            Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show()
            return
        }

        val settings = customUiSettings(profile).apply {
            eventCallback = ShenAIAndroidSDK.EventCallback { event ->
                println("Shen.AI event: $event")
                val shouldHandleFinished = isRunningMeasurementState(measurementState) ||
                    hasReachedFinalizing ||
                    measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED
                if (event == ShenAIAndroidSDK.Event.MEASUREMENT_FINISHED && !isResettingMeasurement && shouldHandleFinished) {
                    runOnUiThread {
                        hasFinishedMeasurement = true
                        refreshSdkState(true)
                    }
                }
            }
        }
        initializationResult = shenaiSDKHandler.initialize(this, API_KEY, USER_ID, settings)
        if (initializationResult != ShenAIAndroidSDK.InitializationResult.OK) {
            Toast.makeText(this, "Initialization failed: $initializationResult", Toast.LENGTH_LONG).show()
        }
        showMeasurementScreen()
    }

    private fun isInitialized(): Boolean {
        return initializationResult == ShenAIAndroidSDK.InitializationResult.OK && shenaiSDKHandler.isInitialized
    }

    private fun showMeasurementScreen() {
        currentScreen = AppScreen.MEASURE
        handler.removeCallbacks(pollTask)

        val scrollView = ScrollView(this)
        val stack = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(12), dp(20), dp(28))
        }
        scrollView.addView(stack)

        val toolbar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val title = TextView(this).apply {
            text = "Custom UI"
            textSize = 20f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
        }
        toolbar.addView(title, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        toolbar.addView(
            iconTextButton("Health form").apply { setOnClickListener { openRiskForm(AppScreen.MEASURE) } },
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(44)),
        )
        stack.addView(toolbar, matchWrap())

        val cameraContainer = CircleFrameLayout(this).apply {
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.rgb(237, 237, 237))
                setStroke(dp(2), Color.BLACK)
            }
        }
        val placeholder = TextView(this).apply {
            text = initializationText()
            setTextColor(Color.BLACK)
            gravity = Gravity.CENTER
        }
        cameraContainer.addView(
            placeholder,
            FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT),
        )
        if (isInitialized()) {
            placeholder.visibility = View.GONE
            val cameraSide = dp(260)
            val cameraHeight = (cameraSide / (9f / 16f)).roundToInt()
            cameraContainer.addView(
                ShenAIView(this),
                FrameLayout.LayoutParams(cameraSide, cameraHeight, Gravity.CENTER),
            )
        }
        val cameraParams = LinearLayout.LayoutParams(dp(260), dp(260)).apply {
            gravity = Gravity.CENTER_HORIZONTAL
            setMargins(0, dp(18), 0, dp(6))
        }
        stack.addView(cameraContainer, cameraParams)

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply { max = 1000 }
        stack.addView(progressBar, matchWrap())

        statusText = TextView(this).apply {
            gravity = Gravity.CENTER
            setTextColor(Color.BLACK)
        }
        stack.addView(statusText, matchWrap().apply { setMargins(0, dp(10), 0, 0) })

        qualityGrid = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        stack.addView(qualityGrid, matchWrap().apply { setMargins(0, dp(18), 0, 0) })

        val buttonsRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        startButton = filledButton("Start").apply { setOnClickListener { startMeasurement() } }
        stopButton = outlineButton("Stop").apply { setOnClickListener { stopMeasurement() } }
        buttonsRow.addView(startButton, LinearLayout.LayoutParams(0, dp(44), 1f))
        buttonsRow.addView(stopButton, LinearLayout.LayoutParams(0, dp(44), 1f).apply { setMargins(dp(12), 0, 0, 0) })
        stack.addView(buttonsRow, matchWrap().apply { setMargins(0, dp(20), 0, 0) })

        resultsButton = filledButton("SEE RESULTS").apply { setOnClickListener { showResultsScreen() } }
        stack.addView(resultsButton, buttonParams().apply { setMargins(0, dp(12), 0, 0) })

        headlineGrid = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        stack.addView(headlineGrid, matchWrap().apply { setMargins(0, dp(20), 0, 0) })

        setContentView(scrollView)
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER)
        }
        refreshSdkState(false)
        handler.postDelayed(pollTask, POLLING_INTERVAL_MS)
    }

    private fun initializationText(): String {
        if (API_KEY.isEmpty()) {
            return "Missing SHENAI_API_KEY.\nRun with -PshenaiApiKey=<your-api-key>."
        }
        return when (initializationResult) {
            null -> "Camera permission is required."
            ShenAIAndroidSDK.InitializationResult.OK -> ""
            else -> "Initialization failed: $initializationResult"
        }
    }

    private fun startMeasurement() {
        if (API_KEY.isEmpty()) {
            Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show()
            updateMeasurementUi()
            return
        }
        if (!isInitialized()) {
            return
        }
        isResettingMeasurement = true
        try {
            resetMeasurementUiState()
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER)
            shenaiSDKHandler.resetMeasurementSession()
            shenaiSDKHandler.setOperatingMode(ShenAIAndroidSDK.OperatingMode.MEASURE)
            shenaiSDKHandler.startMeasurement()
        } finally {
            isResettingMeasurement = false
        }
        refreshSdkState(false)
    }

    private fun stopMeasurement() {
        if (!isInitialized()) {
            return
        }
        isResettingMeasurement = true
        try {
            shenaiSDKHandler.resetMeasurementSession()
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER)
            resetMeasurementUiState()
        } finally {
            isResettingMeasurement = false
        }
    }

    private fun refreshSdkState(loadHealthRisks: Boolean) {
        if (isPolling || isResettingMeasurement || !isInitialized()) {
            updateMeasurementUi()
            return
        }
        isPolling = true
        measurementState = shenaiSDKHandler.measurementState
        progress = shenaiSDKHandler.measurementProgressPercentage
        violatedCondition = shenaiSDKHandler.currentViolatedMeasurementEnvironmentCondition
        val currentRealtime = shenaiSDKHandler.getRealtimeMetrics(10f)
        val liveMeasurementState = isRunningMeasurementState(measurementState)
        realtimeMetrics = if (liveMeasurementState && currentRealtime != null) {
            currentRealtime
        } else if (!liveMeasurementState) {
            null
        } else {
            realtimeMetrics
        }
        val currentResults = shenaiSDKHandler.measurementResults
        if (currentResults != null && (hasFinishedMeasurement || measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED)) {
            results = currentResults
        }
        if (measurementState == ShenAIAndroidSDK.MeasurementState.FINALIZING) {
            hasReachedFinalizing = true
        }
        if (measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED) {
            hasFinishedMeasurement = true
        }
        if (loadHealthRisks || (measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED && healthRisks == null)) {
            healthRisks = shenaiSDKHandler.computeHealthRisks(profile.toRisksFactors(shenaiSDKHandler, results))
        }
        isPolling = false
        updateMeasurementUi()
    }

    private fun resetMeasurementUiState() {
        measurementState = null
        realtimeMetrics = null
        results = null
        healthRisks = null
        violatedCondition = null
        hasReachedFinalizing = false
        hasFinishedMeasurement = false
        progress = 0f
        updateMeasurementUi()
    }

    private fun updateMeasurementUi() {
        if (currentScreen != AppScreen.MEASURE || progressBar == null) {
            return
        }
        val running = isRunningMeasurementState(measurementState)
        val measurementFinished = hasFinishedMeasurement || measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED
        val displayResults = results ?: realtimeMetrics

        if (API_KEY.isEmpty()) {
            progressBar?.progress = 0
            statusText?.text = "Missing SHENAI_API_KEY. Run with -PshenaiApiKey=<your-api-key>."
            startButton?.isEnabled = false
            stopButton?.isEnabled = false
            resultsButton?.visibility = View.GONE
            qualityGrid?.let { setQualityIndicator(it, "Live quality", null) }
            headlineGrid?.let { setGrid(it, null, headlineValues(null)) }
            return
        }

        progressBar?.progress = (progress * 10).roundToInt()
        statusText?.text = String.format(
            Locale.getDefault(),
            "%s - %.0f%%",
            measurementStatusText(measurementState, violatedCondition, hasReachedFinalizing, hasFinishedMeasurement),
            progress,
        )
        startButton?.isEnabled = isInitialized() && !running
        stopButton?.isEnabled = isInitialized() && running
        resultsButton?.visibility = if (measurementFinished) View.VISIBLE else View.GONE
        resultsButton?.isEnabled = measurementFinished && results != null
        qualityGrid?.let { setQualityIndicator(it, "Live quality", displayResults) }
        headlineGrid?.let { setGrid(it, null, headlineValues(displayResults)) }
    }

    private fun showResultsScreen() {
        currentScreen = AppScreen.RESULTS
        handler.removeCallbacks(pollTask)
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF)
        }

        val scrollView = ScrollView(this)
        val stack = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(28))
        }
        scrollView.addView(stack)

        val toolbar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val title = TextView(this).apply {
            text = "Results"
            textSize = 20f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
        }
        toolbar.addView(title, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        toolbar.addView(
            iconTextButton("Health form").apply { setOnClickListener { openRiskForm(AppScreen.RESULTS) } },
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(44)),
        )
        stack.addView(toolbar, matchWrap())

        addQualityToStack(stack, "Measurement quality", results)
        addGridToStack(stack, null, measurementMetricValues(results))
        addGridToStack(stack, "Health indices", healthRiskValues(healthRisks))

        setContentView(scrollView)
    }

    private fun openRiskForm(returnScreen: AppScreen) {
        riskFormReturnScreen = returnScreen
        currentScreen = AppScreen.RISK_FORM
        handler.removeCallbacks(pollTask)
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF)
        }

        val scrollView = ScrollView(this)
        val stack = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(28))
        }
        scrollView.addView(stack)

        val title = TextView(this).apply {
            text = "Health form"
            textSize = 20f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
        }
        stack.addView(title, matchWrap())

        val inputs = mutableListOf<NumberInput>()
        inputs.add(addNumberInput(stack, "Age", profile.age.toFloat()))
        inputs.add(addNumberInput(stack, "Height (cm)", profile.heightCm))
        inputs.add(addNumberInput(stack, "Weight (kg)", profile.weightKg))
        inputs.add(addNumberInput(stack, "Waist (cm)", profile.waistCm))
        inputs.add(addNumberInput(stack, "Neck (cm)", profile.neckCm))
        inputs.add(addNumberInput(stack, "Hip (cm)", profile.hipCm))
        inputs.add(addNumberInput(stack, "Cholesterol", profile.cholesterol))
        inputs.add(addNumberInput(stack, "HDL", profile.hdl))
        inputs.add(addNumberInput(stack, "SBP", profile.sbp))
        inputs.add(addNumberInput(stack, "DBP", profile.dbp))
        inputs.add(addNumberInput(stack, "Triglyceride", profile.triglyceride))
        inputs.add(addNumberInput(stack, "Fasting glucose", profile.fastingGlucose))

        val smokerSwitch = addSwitch(stack, "Smoker", profile.isSmoker)
        val diabetesSwitch = addSwitch(stack, "Diabetes", profile.hasDiabetes)
        val fruitSwitch = addSwitch(stack, "Fruit / vegetable diet", profile.vegetableFruitDiet)
        val glucoseSwitch = addSwitch(stack, "High glucose history", profile.historyOfHighGlucose)
        val hypertensionSwitch = addSwitch(stack, "Hypertension history", profile.historyOfHypertension)
        val countryInput = addTextInput(stack, "Country", profile.country)
        val genderSpinner = addEnumInput(stack, "Gender", ShenAIAndroidSDK.Gender.values(), profile.gender)
        val activitySpinner = addEnumInput(stack, "Physical activity", ShenAIAndroidSDK.PhysicalActivity.values(), profile.physicalActivity)
        val raceSpinner = addEnumInput(stack, "Race", ShenAIAndroidSDK.Race.values(), profile.race)
        val treatmentSpinner = addEnumInput(stack, "Hypertension treatment", ShenAIAndroidSDK.HypertensionTreatment.values(), profile.hypertensionTreatment)
        val familySpinner = addEnumInput(stack, "Family diabetes", ShenAIAndroidSDK.FamilyHistory.values(), profile.familyDiabetes)
        val parentalSpinner = addEnumInput(stack, "Parental hypertension", ShenAIAndroidSDK.ParentalHistory.values(), profile.parentalHypertension)

        val saveButton = filledButton("Save").apply {
            setOnClickListener {
                profile.age = inputs[0].floatValue(profile.age.toFloat()).roundToInt()
                profile.heightCm = inputs[1].floatValue(profile.heightCm)
                profile.weightKg = inputs[2].floatValue(profile.weightKg)
                profile.waistCm = inputs[3].floatValue(profile.waistCm)
                profile.neckCm = inputs[4].floatValue(profile.neckCm)
                profile.hipCm = inputs[5].floatValue(profile.hipCm)
                profile.cholesterol = inputs[6].floatValue(profile.cholesterol)
                profile.hdl = inputs[7].floatValue(profile.hdl)
                profile.sbp = inputs[8].floatValue(profile.sbp)
                profile.dbp = inputs[9].floatValue(profile.dbp)
                profile.triglyceride = inputs[10].floatValue(profile.triglyceride)
                profile.fastingGlucose = inputs[11].floatValue(profile.fastingGlucose)
                profile.isSmoker = smokerSwitch.isChecked
                profile.hasDiabetes = diabetesSwitch.isChecked
                profile.vegetableFruitDiet = fruitSwitch.isChecked
                profile.historyOfHighGlucose = glucoseSwitch.isChecked
                profile.historyOfHypertension = hypertensionSwitch.isChecked
                profile.country = countryInput.text.toString().trim().ifEmpty { "US" }
                profile.gender = genderSpinner.selectedItem as ShenAIAndroidSDK.Gender
                profile.physicalActivity = activitySpinner.selectedItem as ShenAIAndroidSDK.PhysicalActivity
                profile.race = raceSpinner.selectedItem as ShenAIAndroidSDK.Race
                profile.hypertensionTreatment = treatmentSpinner.selectedItem as ShenAIAndroidSDK.HypertensionTreatment
                profile.familyDiabetes = familySpinner.selectedItem as ShenAIAndroidSDK.FamilyHistory
                profile.parentalHypertension = parentalSpinner.selectedItem as ShenAIAndroidSDK.ParentalHistory
                computeHealthRisks()
                if (riskFormReturnScreen == AppScreen.RESULTS) {
                    showResultsScreen()
                } else {
                    showMeasurementScreen()
                }
            }
        }
        stack.addView(saveButton, buttonParams().apply { setMargins(0, dp(20), 0, 0) })

        setContentView(scrollView)
    }

    private fun computeHealthRisks() {
        if (isInitialized() && results != null) {
            healthRisks = shenaiSDKHandler.computeHealthRisks(profile.toRisksFactors(shenaiSDKHandler, results))
        }
    }

    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onBackPressed() {
        when (currentScreen) {
            AppScreen.RESULTS -> {
                showMeasurementScreen()
                return
            }
            AppScreen.RISK_FORM -> {
                if (riskFormReturnScreen == AppScreen.RESULTS) {
                    showResultsScreen()
                } else {
                    showMeasurementScreen()
                }
                return
            }
            AppScreen.MEASURE -> Unit
        }
        super.onBackPressed()
    }

    override fun onPause() {
        super.onPause()
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF)
        }
    }

    override fun onResume() {
        super.onResume()
        if (currentScreen == AppScreen.MEASURE && isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER)
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.deinitialize()
        }
        super.onDestroy()
    }

    private fun customUiSettings(profile: RiskProfile): ShenAIAndroidSDK.InitializationSettings {
        return shenaiSDKHandler.defaultInitializationSettings.apply {
            precisionMode = ShenAIAndroidSDK.PrecisionMode.RELAXED
            operatingMode = ShenAIAndroidSDK.OperatingMode.MEASURE
            measurementPreset = ShenAIAndroidSDK.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS
            cameraMode = ShenAIAndroidSDK.CameraMode.FACING_USER
            onboardingMode = ShenAIAndroidSDK.OnboardingMode.HIDDEN
            showUserInterface = false
            showFacePositioningOverlay = false
            showVisualWarnings = false
            enableCameraSwap = false
            showFaceMask = true
            showBloodFlow = false
            enableStartAfterSuccess = false
            enableSummaryScreen = false
            showResultsFinishButton = false
            enableHealthRisks = true
            showHealthIndicesFinishButton = false
            saveHealthRisksFactors = true
            showOutOfRangeResultIndicators = false
            applyPrecisionModeToBloodPressure = false
            showSignalQualityIndicator = false
            showSignalTile = false
            showStartStopButton = false
            showInfoButton = false
            showDisclaimer = false
            uiVersion = ShenAIAndroidSDK.UiVersion.V2
            risksFactors = profile.toRisksFactors(shenaiSDKHandler, null)
        }
    }

    private fun measurementStatusText(
        state: ShenAIAndroidSDK.MeasurementState?,
        condition: ShenAIAndroidSDK.MeasurementEnvironmentCondition?,
        reachedFinalizing: Boolean,
        finishedMeasurement: Boolean,
    ): String {
        if (finishedMeasurement || state == ShenAIAndroidSDK.MeasurementState.FINISHED) {
            return "Measurement finished"
        }
        if (reachedFinalizing || state == ShenAIAndroidSDK.MeasurementState.FINALIZING) {
            return "Finalizing"
        }
        if (condition != null) {
            return conditionInstruction(condition)
        }
        return when (state) {
            null,
            ShenAIAndroidSDK.MeasurementState.NOT_STARTED -> "Ready"
            ShenAIAndroidSDK.MeasurementState.WAITING_FOR_FACE -> "Waiting for face"
            ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_SHORT,
            ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_GOOD,
            ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_BAD,
            ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE -> "Measurement conditions are good"
            ShenAIAndroidSDK.MeasurementState.FAILED -> "Measurement failed"
            else -> "Ready"
        }
    }

    private fun conditionInstruction(condition: ShenAIAndroidSDK.MeasurementEnvironmentCondition): String {
        return when (condition) {
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.FACE_POSITION,
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.FOREHEAD_VISIBLE -> "Uncover your forehead"
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.GLASSES_NOT_DETECTED -> "Remove your glasses"
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.SUFFICIENT_LIGHT_LEVEL -> "Move to brighter light"
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.EVEN_LIGHTING -> "Use even lighting"
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.NO_BACKLIGHT -> "Avoid backlight"
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.FACE_STABLE -> "Keep your face still"
            ShenAIAndroidSDK.MeasurementEnvironmentCondition.DEVICE_STABLE -> "Keep the phone still"
            else -> "Ready"
        }
    }

    private fun isRunningMeasurementState(state: ShenAIAndroidSDK.MeasurementState?): Boolean {
        return state == ShenAIAndroidSDK.MeasurementState.WAITING_FOR_FACE ||
            state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_SHORT ||
            state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_GOOD ||
            state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_BAD ||
            state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE ||
            state == ShenAIAndroidSDK.MeasurementState.FINALIZING
    }

    private fun headlineValues(item: ShenAIAndroidSDK.MeasurementResults?): List<DisplayValue> {
        return listOf(
            DisplayValue("HR", item?.let { formatFloat(it.hrBpm, 0) } ?: "-", "bpm"),
            DisplayValue("SBP", formatOptionalFloat(item?.systolicBloodPressureMmhg, 0), "mmHg"),
            DisplayValue("DBP", formatOptionalFloat(item?.diastolicBloodPressureMmhg, 0), "mmHg"),
            DisplayValue("BR", formatOptionalFloat(item?.brBpm, 1), "brpm"),
        )
    }

    private fun measurementMetricValues(item: ShenAIAndroidSDK.MeasurementResults?): List<DisplayValue> {
        val quality = item?.qualityMetrics
        return listOf(
            DisplayValue("Heart rate", item?.let { formatFloat(it.hrBpm, 0) } ?: "-", "bpm"),
            DisplayValue("HRV SDNN", formatOptionalFloat(item?.hrvSdnnMs, 1), "ms"),
            DisplayValue("HRV lnRMSSD", formatOptionalFloat(item?.hrvLnrmssdMs, 2), "ms"),
            DisplayValue("Cardiac stress", formatOptionalFloat(item?.stressIndex, 1), ""),
            DisplayValue("PNS activity", formatOptionalFloat(item?.parasympatheticActivity, 1), ""),
            DisplayValue("Breathing", formatOptionalFloat(item?.brBpm, 1), "brpm"),
            DisplayValue("Systolic", formatOptionalFloat(item?.systolicBloodPressureMmhg, 0), "mmHg"),
            DisplayValue("Diastolic", formatOptionalFloat(item?.diastolicBloodPressureMmhg, 0), "mmHg"),
            DisplayValue("Workload", formatOptionalFloat(item?.cardiacWorkloadMmhgPerSec, 1), "mmHg/s"),
            DisplayValue("Age", formatOptionalFloat(item?.ageYears, 0), "years"),
            DisplayValue("BMI", formatOptionalFloat(item?.bmiKgPerM2, 1), "kg/m2"),
            DisplayValue("BMI category", formatOptionalEnum(item?.bmiCategory), ""),
            DisplayValue("Weight", formatOptionalFloat(item?.weightKg, 1), "kg"),
            DisplayValue("Height", formatOptionalFloat(item?.heightCm, 1), "cm"),
            DisplayValue("BP scale", formatBpScale(item), ""),
            DisplayValue("Signal", item?.let { formatFloat(it.averageSignalQuality, 1) } ?: "-", "dB"),
            DisplayValue("PPG quality", formatOptionalFloat(quality?.ppgQualityIndex, 1), ""),
            DisplayValue("BCG quality", formatOptionalFloat(quality?.bcgQualityIndex, 1), ""),
            DisplayValue("BP quality", formatOptionalFloat(quality?.bloodPressureQualityIndex, 1), ""),
            DisplayValue("SBP median error", formatOptionalFloat(quality?.expectedSbpMedianAbsErrorMmhg, 1), "mmHg"),
            DisplayValue("SBP p80 error", formatOptionalFloat(quality?.expectedSbpP80AbsErrorMmhg, 1), "mmHg"),
            DisplayValue("SBP mean error", formatOptionalFloat(quality?.expectedSbpMeanAbsErrorMmhg, 1), "mmHg"),
            DisplayValue("SBP balanced MAE", formatOptionalFloat(quality?.expectedSbpBalancedMaeMmhg, 1), "mmHg"),
            DisplayValue("DBP median error", formatOptionalFloat(quality?.expectedDbpMedianAbsErrorMmhg, 1), "mmHg"),
            DisplayValue("DBP p80 error", formatOptionalFloat(quality?.expectedDbpP80AbsErrorMmhg, 1), "mmHg"),
            DisplayValue("DBP mean error", formatOptionalFloat(quality?.expectedDbpMeanAbsErrorMmhg, 1), "mmHg"),
            DisplayValue("DBP balanced MAE", formatOptionalFloat(quality?.expectedDbpBalancedMaeMmhg, 1), "mmHg"),
            DisplayValue("Heartbeats", item?.heartbeats?.size?.toString() ?: "-", ""),
        )
    }

    private fun healthRiskValues(risks: ShenAIAndroidSDK.HealthRisks?): List<DisplayValue> {
        return listOf(
            DisplayValue("Wellness", formatOptionalFloat(risks?.wellnessScore, 1), ""),
            DisplayValue("Vascular age", formatOptionalInteger(risks?.vascularAge), "years"),
            DisplayValue("CVD risk", formatOptionalFloat(risks?.cvDiseases?.overallRisk, 1), "%"),
            DisplayValue("Coronary disease", formatOptionalFloat(risks?.cvDiseases?.coronaryHeartDiseaseRisk, 1), "%"),
            DisplayValue("Stroke risk", formatOptionalFloat(risks?.cvDiseases?.strokeRisk, 1), "%"),
            DisplayValue("Heart failure", formatOptionalFloat(risks?.cvDiseases?.heartFailureRisk, 1), "%"),
            DisplayValue("Peripheral vascular", formatOptionalFloat(risks?.cvDiseases?.peripheralVascularDiseaseRisk, 1), "%"),
            DisplayValue("Hard CV", formatOptionalFloat(risks?.hardAndFatalEvents?.hardCVEventRisk, 1), "%"),
            DisplayValue("Coronary death", formatOptionalFloat(risks?.hardAndFatalEvents?.coronaryDeathEventRisk, 1), "%"),
            DisplayValue("Fatal stroke", formatOptionalFloat(risks?.hardAndFatalEvents?.fatalStrokeEventRisk, 1), "%"),
            DisplayValue("CV mortality", formatOptionalFloat(risks?.hardAndFatalEvents?.totalCVMortalityRisk, 1), "%"),
            DisplayValue("Risk score", formatOptionalInteger(risks?.scores?.totalScore), ""),
            DisplayValue("Age score", formatOptionalInteger(risks?.scores?.ageScore), ""),
            DisplayValue("SBP score", formatOptionalInteger(risks?.scores?.sbpScore), ""),
            DisplayValue("Smoking score", formatOptionalInteger(risks?.scores?.smokingScore), ""),
            DisplayValue("Diabetes score", formatOptionalInteger(risks?.scores?.diabetesScore), ""),
            DisplayValue("BMI score", formatOptionalInteger(risks?.scores?.bmiScore), ""),
            DisplayValue("Cholesterol score", formatOptionalInteger(risks?.scores?.cholesterolScore), ""),
            DisplayValue("HDL score", formatOptionalInteger(risks?.scores?.cholesterolHdlScore), ""),
            DisplayValue("Hypertension", formatOptionalFloat(risks?.hypertensionRisk, 1), "%"),
            DisplayValue("Diabetes", formatOptionalFloat(risks?.diabetesRisk, 1), "%"),
            DisplayValue("Waist-height", formatOptionalFloat(risks?.waistToHeightRatio, 2), ""),
            DisplayValue("Body fat", formatOptionalFloat(risks?.bodyFatPercentage, 1), "%"),
            DisplayValue("Body roundness", formatOptionalFloat(risks?.bodyRoundnessIndex, 2), ""),
            DisplayValue("A body shape", formatOptionalFloat(risks?.aBodyShapeIndex, 3), ""),
            DisplayValue("Conicity", formatOptionalFloat(risks?.conicityIndex, 2), ""),
            DisplayValue("BMR", formatOptionalFloat(risks?.basalMetabolicRate, 0), "kcal"),
            DisplayValue("TDEE", formatOptionalFloat(risks?.totalDailyEnergyExpenditure, 0), "kcal"),
            DisplayValue("NAFLD", formatOptionalEnum(risks?.nonAlcoholicFattyLiverDiseaseRisk), ""),
        )
    }

    private fun addGridToStack(stack: LinearLayout, title: String?, values: List<DisplayValue>) {
        val grid = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        setGrid(grid, title, values)
        stack.addView(grid, matchWrap().apply { setMargins(0, dp(20), 0, 0) })
    }

    private fun addQualityToStack(stack: LinearLayout, title: String, item: ShenAIAndroidSDK.MeasurementResults?) {
        val indicator = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        setQualityIndicator(indicator, title, item)
        stack.addView(indicator, matchWrap().apply { setMargins(0, dp(20), 0, 0) })
    }

    private fun setQualityIndicator(container: LinearLayout, title: String, item: ShenAIAndroidSDK.MeasurementResults?) {
        container.removeAllViews()
        val titleView = TextView(this).apply {
            text = title
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.BLACK)
        }
        container.addView(titleView, matchWrap().apply { setMargins(0, 0, 0, dp(10)) })

        val rows = qualityRows(item)
        if (rows.isEmpty()) {
            container.addView(
                TextView(this).apply {
                    text = "Quality will appear during the measurement."
                    setTextColor(Color.BLACK)
                },
                matchWrap(),
            )
            return
        }
        rows.forEach { row ->
            container.addView(qualityRow(row), matchWrap().apply { setMargins(0, 0, 0, dp(8)) })
        }
    }

    private fun qualityRows(item: ShenAIAndroidSDK.MeasurementResults?): List<QualityValue> {
        if (item == null) {
            return emptyList()
        }
        val rows = mutableListOf(QualityValue("Signal", formatFloat(item.averageSignalQuality, 1), qualityProgress(item.averageSignalQuality)))
        val quality = item.qualityMetrics
        addQualityRow(rows, "PPG", quality?.ppgQualityIndex)
        addQualityRow(rows, "BCG", quality?.bcgQualityIndex)
        addQualityRow(rows, "BP", quality?.bloodPressureQualityIndex)
        return rows
    }

    private fun addQualityRow(rows: MutableList<QualityValue>, label: String, value: Optional<Float>?) {
        val resolved = optionalFloat(value)
        if (resolved != null) {
            rows.add(QualityValue(label, formatFloat(resolved, 1), qualityProgress(resolved)))
        }
    }

    private fun qualityRow(row: QualityValue): View {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        layout.addView(
            TextView(this).apply {
                text = row.label
                setTextColor(Color.BLACK)
            },
            LinearLayout.LayoutParams(dp(72), LinearLayout.LayoutParams.WRAP_CONTENT),
        )
        if (row.progress == null) {
            layout.addView(
                View(this).apply { setBackgroundColor(Color.BLACK) },
                LinearLayout.LayoutParams(0, dp(1), 1f),
            )
        } else {
            layout.addView(
                ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
                    max = 1000
                    progress = (row.progress * 1000).roundToInt()
                },
                LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f),
            )
        }
        layout.addView(
            TextView(this).apply {
                text = row.value
                gravity = Gravity.RIGHT
                setTextColor(Color.BLACK)
            },
            LinearLayout.LayoutParams(dp(52), LinearLayout.LayoutParams.WRAP_CONTENT).apply { setMargins(dp(10), 0, 0, 0) },
        )
        return layout
    }

    private fun setGrid(grid: LinearLayout, title: String?, values: List<DisplayValue>) {
        grid.removeAllViews()
        if (title != null) {
            grid.addView(
                TextView(this).apply {
                    text = title
                    typeface = Typeface.DEFAULT_BOLD
                    setTextColor(Color.BLACK)
                },
                matchWrap().apply { setMargins(0, 0, 0, dp(10)) },
            )
        }
        for (index in values.indices step 2) {
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            row.addView(tile(values[index]), LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
            if (index + 1 < values.size) {
                row.addView(tile(values[index + 1]), LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply { setMargins(dp(10), 0, 0, 0) })
            } else {
                row.addView(View(this), LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
            }
            grid.addView(row, matchWrap().apply { setMargins(0, 0, 0, dp(10)) })
        }
    }

    private fun tile(value: DisplayValue): View {
        val stack = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(12), dp(10), dp(12), dp(10))
            minimumHeight = dp(112)
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                setStroke(dp(1), Color.BLACK)
            }
        }
        stack.addView(
            TextView(this).apply {
                text = value.title
                textSize = 12f
                setTextColor(Color.DKGRAY)
            },
            matchWrap(),
        )
        stack.addView(
            TextView(this).apply {
                text = if (value.unit.isEmpty()) value.value else "${value.value} ${value.unit}"
                textSize = 16f
                typeface = Typeface.DEFAULT_BOLD
                setTextColor(Color.BLACK)
                setSingleLine(true)
            },
            matchWrap().apply { setMargins(0, dp(4), 0, 0) },
        )
        return stack
    }

    private fun addNumberInput(stack: LinearLayout, label: String, value: Float): NumberInput {
        addFormLabel(stack, label)
        val field = EditText(this).apply {
            hint = label
            setTextColor(Color.BLACK)
            setHintTextColor(Color.DKGRAY)
            setSingleLine(true)
            inputType = InputType.TYPE_CLASS_NUMBER or InputType.TYPE_NUMBER_FLAG_DECIMAL
            setText(formatFloat(value, if (value == value.roundToInt().toFloat()) 0 else 1))
        }
        stack.addView(field, matchWrap())
        return NumberInput(field)
    }

    private fun addTextInput(stack: LinearLayout, label: String, value: String): EditText {
        addFormLabel(stack, label)
        val field = EditText(this).apply {
            hint = label
            setTextColor(Color.BLACK)
            setHintTextColor(Color.DKGRAY)
            setSingleLine(true)
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS
            setText(value)
        }
        stack.addView(field, matchWrap())
        return field
    }

    private fun <T : Enum<T>> addEnumInput(stack: LinearLayout, label: String, values: Array<T>, selected: T): Spinner {
        addFormLabel(stack, label)
        val spinner = Spinner(this)
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, values)
        spinner.adapter = adapter
        spinner.setSelection(max(0, adapter.getPosition(selected)))
        stack.addView(spinner, matchWrap())
        return spinner
    }

    private fun addFormLabel(stack: LinearLayout, label: String) {
        stack.addView(
            TextView(this).apply {
                text = label
                setTextColor(Color.BLACK)
                typeface = Typeface.DEFAULT_BOLD
            },
            matchWrap().apply { setMargins(0, dp(12), 0, 0) },
        )
    }

    private fun addSwitch(stack: LinearLayout, label: String, checked: Boolean): Switch {
        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        row.addView(
            TextView(this).apply {
                text = label
                setTextColor(Color.BLACK)
            },
            LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f),
        )
        val control = Switch(this).apply { isChecked = checked }
        row.addView(control)
        stack.addView(row, matchWrap().apply { setMargins(0, dp(12), 0, 0) })
        return control
    }

    private fun formatOptionalFloat(value: Optional<Float>?, decimals: Int): String {
        return if (value == null || !value.isPresent) "-" else formatFloat(value.get(), decimals)
    }

    private fun formatOptionalInteger(value: Optional<Int>?): String {
        return if (value == null || !value.isPresent) "-" else value.get().toString()
    }

    private fun optionalFloat(value: Optional<Float>?): Float? {
        return if (value == null || !value.isPresent) null else value.get()
    }

    private fun formatOptionalEnum(value: Optional<*>?): String {
        return if (value == null || !value.isPresent) "-" else value.get().toString()
    }

    private fun formatFloat(value: Float, decimals: Int): String {
        return String.format(Locale.getDefault(), "%.${decimals}f", value)
    }

    private fun formatBpScale(item: ShenAIAndroidSDK.MeasurementResults?): String {
        if (item == null) {
            return "-"
        }
        val hasSbp = item.systolicBloodPressureMmhg?.isPresent == true
        val hasDbp = item.diastolicBloodPressureMmhg?.isPresent == true
        return if (hasSbp && hasDbp) "Included" else "-"
    }

    private fun qualityProgress(value: Float?): Float? {
        if (value == null || value.isNaN() || value.isInfinite()) {
            return null
        }
        val normalized = if (value <= 1f) value else value / 100f
        return normalized.coerceIn(0f, 1f)
    }

    private fun iconTextButton(label: String): Button {
        return Button(this).apply {
            text = label
            isAllCaps = false
            setTextColor(Color.BLACK)
            setBackgroundColor(Color.TRANSPARENT)
        }
    }

    private fun filledButton(label: String): Button {
        return Button(this).apply {
            text = label
            isAllCaps = false
            setTextColor(Color.WHITE)
            typeface = Typeface.DEFAULT_BOLD
            background = GradientDrawable().apply {
                setColor(Color.BLACK)
                cornerRadius = dp(8).toFloat()
            }
        }
    }

    private fun outlineButton(label: String): Button {
        return Button(this).apply {
            text = label
            isAllCaps = false
            setTextColor(Color.BLACK)
            background = GradientDrawable().apply {
                setColor(Color.WHITE)
                setStroke(dp(1), Color.BLACK)
                cornerRadius = dp(8).toFloat()
            }
        }
    }

    private fun buttonParams(): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(44))
    }

    private fun matchWrap(): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT)
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private enum class AppScreen {
        MEASURE,
        RESULTS,
        RISK_FORM,
    }

    private data class DisplayValue(val title: String, val value: String, val unit: String)

    private data class QualityValue(val label: String, val value: String, val progress: Float?)

    private class NumberInput(private val field: EditText) {
        fun floatValue(fallback: Float): Float {
            return field.text.toString().toFloatOrNull() ?: fallback
        }
    }

    private class RiskProfile {
        var age = 45
        var heightCm = 172f
        var weightKg = 74f
        var waistCm = 84f
        var cholesterol = 190f
        var hdl = 52f
        var sbp = 128f
        var dbp = 82f
        var isSmoker = false
        var hypertensionTreatment = ShenAIAndroidSDK.HypertensionTreatment.NO
        var hasDiabetes = false
        var gender = ShenAIAndroidSDK.Gender.FEMALE
        var neckCm = 38f
        var hipCm = 98f
        var physicalActivity = ShenAIAndroidSDK.PhysicalActivity.MODERATELY
        var country = "US"
        var race = ShenAIAndroidSDK.Race.WHITE
        var vegetableFruitDiet = true
        var historyOfHighGlucose = false
        var historyOfHypertension = false
        var triglyceride = 120f
        var fastingGlucose = 92f
        var familyDiabetes = ShenAIAndroidSDK.FamilyHistory.NONE_FIRST_DEGREE
        var parentalHypertension = ShenAIAndroidSDK.ParentalHistory.NONE

        fun toRisksFactors(
            sdk: ShenAIAndroidSDK,
            results: ShenAIAndroidSDK.MeasurementResults?,
        ): ShenAIAndroidSDK.RisksFactors {
            return sdk.RisksFactors().apply {
                age = Optional.of(this@RiskProfile.age)
                cholesterol = Optional.of(this@RiskProfile.cholesterol)
                cholesterolHdl = Optional.of(hdl)
                sbp = if (results?.systolicBloodPressureMmhg?.isPresent == true) {
                    results.systolicBloodPressureMmhg
                } else {
                    Optional.of(this@RiskProfile.sbp)
                }
                dbp = if (results?.diastolicBloodPressureMmhg?.isPresent == true) {
                    results.diastolicBloodPressureMmhg
                } else {
                    Optional.of(this@RiskProfile.dbp)
                }
                isSmoker = Optional.of(this@RiskProfile.isSmoker)
                hypertensionTreatment = Optional.of(this@RiskProfile.hypertensionTreatment)
                hasDiabetes = Optional.of(this@RiskProfile.hasDiabetes)
                bodyHeight = Optional.of(heightCm)
                bodyWeight = Optional.of(weightKg)
                waistCircumference = Optional.of(waistCm)
                neckCircumference = Optional.of(neckCm)
                hipCircumference = Optional.of(hipCm)
                gender = Optional.of(this@RiskProfile.gender)
                physicalActivity = Optional.of(this@RiskProfile.physicalActivity)
                country = this@RiskProfile.country
                race = Optional.of(this@RiskProfile.race)
                vegetableFruitDiet = Optional.of(this@RiskProfile.vegetableFruitDiet)
                historyOfHighGlucose = Optional.of(this@RiskProfile.historyOfHighGlucose)
                historyOfHypertension = Optional.of(this@RiskProfile.historyOfHypertension)
                triglyceride = Optional.of(this@RiskProfile.triglyceride)
                fastingGlucose = Optional.of(this@RiskProfile.fastingGlucose)
                familyDiabetes = Optional.of(this@RiskProfile.familyDiabetes)
                parentalHypertension = Optional.of(this@RiskProfile.parentalHypertension)
            }
        }

        companion object {
            fun defaults(): RiskProfile = RiskProfile()
        }
    }

    private class CircleFrameLayout(context: Context) : FrameLayout(context) {
        init {
            clipToOutline = true
            outlineProvider = object : ViewOutlineProvider() {
                override fun getOutline(view: View, outline: Outline) {
                    outline.setOval(0, 0, view.width, view.height)
                }
            }
        }
    }

    private companion object {
        val API_KEY: String = BuildConfig.SHENAI_API_KEY
        const val USER_ID = ""
        const val POLLING_INTERVAL_MS = 200L
    }
}
