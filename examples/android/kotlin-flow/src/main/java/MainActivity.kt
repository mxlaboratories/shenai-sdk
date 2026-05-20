package ai.mxlabs.sdk_android_kotlin_flow_example

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK
import ai.mxlabs.shenai_sdk.ShenAIView
import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission
import androidx.core.content.ContextCompat
import java.util.Optional

class MainActivity : ComponentActivity() {
    private val shenaiSDKHandler = ShenAIAndroidSDK()

    private var pendingFlow: FlowConfig? = null
    private var activeFlow: FlowConfig? = null
    private var finishedFlow = false
    private var showingSdkView = false
    private var showingPdfActions = false
    private var pdfBusy = false
    private var statusText: TextView? = null
    private var pdfStatusText: TextView? = null
    private var pdfButtons: List<Button> = emptyList()

    private val requestPermissionLauncher = registerForActivityResult(RequestPermission()) { isGranted ->
        val flow = pendingFlow
        if (isGranted && flow != null) {
            startFlow(flow)
        } else {
            Toast.makeText(this, "Camera permission is required for this demo.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        showHome()
        if (API_KEY.isEmpty()) {
            showMissingApiKey()
        }
    }

    private fun showHome() {
        activeFlow = null
        showingSdkView = false
        showingPdfActions = false
        finishedFlow = false

        val stack = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(dp(24), dp(24), dp(24), dp(24))
        }

        val title = TextView(this).apply {
            text = "Shen.AI Flow"
            textSize = 22f
            gravity = Gravity.CENTER
        }
        stack.addView(title, matchWrap())

        statusText = TextView(this).apply {
            gravity = Gravity.CENTER
            visibility = View.GONE
        }
        val statusParams = matchWrap().apply { setMargins(0, dp(20), 0, 0) }
        stack.addView(statusText, statusParams)

        val dashboardButton = outlineButton("Dashboard").apply {
            setOnClickListener { openFlow(FlowConfig.dashboard()) }
        }
        stack.addView(dashboardButton, buttonParams().apply { setMargins(0, dp(32), 0, 0) })

        val measurementButton = outlineButton("Measurement").apply {
            setOnClickListener { openFlow(FlowConfig.measurement()) }
        }
        stack.addView(measurementButton, buttonParams().apply { setMargins(0, dp(12), 0, 0) })

        setContentView(stack)
    }

    private fun openFlow(flow: FlowConfig) {
        if (API_KEY.isEmpty()) {
            showMissingApiKey()
            return
        }
        pendingFlow = flow
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startFlow(flow)
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun startFlow(flow: FlowConfig) {
        if (API_KEY.isEmpty()) {
            showMissingApiKey()
            return
        }
        pendingFlow = null
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.deinitialize()
        }

        val settings = uiFlowSettings(flow.screens, flow.dashboardOnly).apply {
            eventCallback = ShenAIAndroidSDK.EventCallback { event ->
                runOnUiThread { handleSdkEvent(event) }
            }
        }

        val result = shenaiSDKHandler.initialize(this, API_KEY, USER_ID, settings)
        if (result != ShenAIAndroidSDK.InitializationResult.OK) {
            showInitializationFailure(result)
            return
        }

        activeFlow = flow
        finishedFlow = false
        if (flow.disableMeasurementsDashboard) {
            shenaiSDKHandler.setEnableMeasurementsDashboard(false)
        }
        if (flow.resetMeasurement) {
            shenaiSDKHandler.resetMeasurementSession()
        }
        flow.initialScreen?.let { shenaiSDKHandler.setScreen(it) }

        showingSdkView = true
        showingPdfActions = false
        setContentView(ShenAIView(this))
    }

    private fun showInitializationFailure(result: ShenAIAndroidSDK.InitializationResult) {
        if (statusText == null) {
            showHome()
        }
        statusText?.text = "Initialization failed: $result"
        statusText?.visibility = View.VISIBLE
    }

    private fun showMissingApiKey() {
        if (statusText == null) {
            showHome()
        }
        statusText?.text = "Missing SHENAI_API_KEY. Run with -PshenaiApiKey=<your-api-key>."
        statusText?.visibility = View.VISIBLE
        Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show()
    }

    private fun handleSdkEvent(event: ShenAIAndroidSDK.Event) {
        println("Shen.AI event: $event")
        if (event == ShenAIAndroidSDK.Event.USER_FLOW_FINISHED) {
            handleUserFlowFinished()
        }
    }

    private fun handleUserFlowFinished() {
        if (finishedFlow || activeFlow == null) {
            return
        }
        if (activeFlow?.showPdfActionsAfterFinish == true && shenaiSDKHandler.measurementResults != null) {
            showPdfActionsPage()
            return
        }
        finishFlow()
    }

    private fun showPdfActionsPage() {
        showingSdkView = false
        showingPdfActions = true
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF)
        }

        val scrollView = ScrollView(this)
        val stack = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(dp(24), dp(24), dp(24), dp(24))
        }
        scrollView.addView(stack)

        val title = TextView(this).apply {
            text = "Measurement PDF"
            textSize = 22f
            gravity = Gravity.CENTER
        }
        stack.addView(title, matchWrap())

        pdfStatusText = TextView(this).apply {
            text = "Measurement finished. Open the PDF report."
            gravity = Gravity.CENTER
        }
        stack.addView(pdfStatusText, matchWrap().apply { setMargins(0, dp(16), 0, 0) })

        val openButton = outlineButton("Open PDF").apply {
            setOnClickListener {
                runPdfAction {
                    shenaiSDKHandler.openMeasurementResultsPdfInBrowser()
                    setPdfStatus("PDF open request sent.")
                    completePdfAction()
                }
            }
        }
        val finishButton = filledButton("Finish").apply {
            setOnClickListener { finishFlow() }
        }
        pdfButtons = listOf(openButton, finishButton)
        addButtonWithTopMargin(stack, openButton, 24)
        addButtonWithTopMargin(stack, finishButton, 24)

        setContentView(scrollView)
    }

    private fun runPdfAction(action: () -> Unit) {
        if (pdfBusy) {
            return
        }
        pdfBusy = true
        setPdfButtonsEnabled(false)
        setPdfStatus("Working on PDF...")
        action()
    }

    private fun completePdfAction() {
        pdfBusy = false
        setPdfButtonsEnabled(true)
    }

    private fun setPdfStatus(status: String) {
        pdfStatusText?.text = status
    }

    private fun setPdfButtonsEnabled(enabled: Boolean) {
        pdfButtons.forEach { it.isEnabled = enabled }
    }

    private fun finishFlow() {
        if (finishedFlow) {
            return
        }
        finishedFlow = true
        showingSdkView = false
        showingPdfActions = false
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.deinitialize()
        }
        showHome()
    }

    override fun onPause() {
        super.onPause()
        if (showingSdkView && shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF)
        }
    }

    override fun onResume() {
        super.onResume()
        if (showingSdkView && !showingPdfActions && shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER)
        }
    }

    override fun onDestroy() {
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.deinitialize()
        }
        super.onDestroy()
    }

    private fun uiFlowSettings(
        screens: List<ShenAIAndroidSDK.Screen>,
        dashboardOnly: Boolean,
    ): ShenAIAndroidSDK.InitializationSettings {
        return shenaiSDKHandler.defaultInitializationSettings.apply {
            precisionMode = ShenAIAndroidSDK.PrecisionMode.RELAXED
            operatingMode = ShenAIAndroidSDK.OperatingMode.MEASURE
            measurementPreset = ShenAIAndroidSDK.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS
            cameraMode = ShenAIAndroidSDK.CameraMode.FACING_USER
            onboardingMode = ShenAIAndroidSDK.OnboardingMode.HIDDEN
            showUserInterface = true
            showFacePositioningOverlay = true
            showVisualWarnings = true
            enableCameraSwap = true
            showFaceMask = true
            showBloodFlow = true
            enableStartAfterSuccess = false
            enableSummaryScreen = !dashboardOnly
            showResultsFinishButton = !dashboardOnly
            enableHealthRisks = true
            showHealthIndicesFinishButton = !dashboardOnly
            saveHealthRisksFactors = true
            showOutOfRangeResultIndicators = true
            applyPrecisionModeToBloodPressure = false
            showSignalQualityIndicator = true
            showSignalTile = true
            showStartStopButton = !dashboardOnly
            showInfoButton = !dashboardOnly
            showDisclaimer = !dashboardOnly
            uiVersion = ShenAIAndroidSDK.UiVersion.V2
            risksFactors = exampleRiskFactors()
            uiFlowScreens.clear()
            uiFlowScreens.addAll(screens)
        }
    }

    private fun exampleRiskFactors(): ShenAIAndroidSDK.RisksFactors {
        return shenaiSDKHandler.RisksFactors().apply {
            age = Optional.of(45)
            cholesterol = Optional.of(190f)
            cholesterolHdl = Optional.of(52f)
            sbp = Optional.of(128f)
            dbp = Optional.of(82f)
            isSmoker = Optional.of(false)
            hypertensionTreatment = Optional.of(ShenAIAndroidSDK.HypertensionTreatment.NO)
            hasDiabetes = Optional.of(false)
            bodyHeight = Optional.of(172f)
            bodyWeight = Optional.of(74f)
            waistCircumference = Optional.of(84f)
            neckCircumference = Optional.of(38f)
            hipCircumference = Optional.of(98f)
            gender = Optional.of(ShenAIAndroidSDK.Gender.FEMALE)
            physicalActivity = Optional.of(ShenAIAndroidSDK.PhysicalActivity.MODERATELY)
            country = "US"
            race = Optional.of(ShenAIAndroidSDK.Race.WHITE)
            vegetableFruitDiet = Optional.of(true)
            historyOfHighGlucose = Optional.of(false)
            historyOfHypertension = Optional.of(false)
            triglyceride = Optional.of(120f)
            fastingGlucose = Optional.of(92f)
            familyDiabetes = Optional.of(ShenAIAndroidSDK.FamilyHistory.NONE_FIRST_DEGREE)
            parentalHypertension = Optional.of(ShenAIAndroidSDK.ParentalHistory.NONE)
        }
    }

    private data class FlowConfig(
        val initialScreen: ShenAIAndroidSDK.Screen?,
        val screens: List<ShenAIAndroidSDK.Screen>,
        val dashboardOnly: Boolean,
        val resetMeasurement: Boolean,
        val showPdfActionsAfterFinish: Boolean,
        val disableMeasurementsDashboard: Boolean,
    ) {
        companion object {
            fun dashboard(): FlowConfig {
                return FlowConfig(
                    initialScreen = null,
                    screens = listOf(ShenAIAndroidSDK.Screen.DASHBOARD),
                    dashboardOnly = true,
                    resetMeasurement = false,
                    showPdfActionsAfterFinish = false,
                    disableMeasurementsDashboard = false,
                )
            }

            fun measurement(): FlowConfig {
                return FlowConfig(
                    initialScreen = ShenAIAndroidSDK.Screen.MEASUREMENT,
                    screens = listOf(
                        ShenAIAndroidSDK.Screen.MEASUREMENT,
                        ShenAIAndroidSDK.Screen.RESULTS,
                        ShenAIAndroidSDK.Screen.HEALTH_RISKS,
                    ),
                    dashboardOnly = false,
                    resetMeasurement = true,
                    showPdfActionsAfterFinish = true,
                    disableMeasurementsDashboard = true,
                )
            }
        }
    }

    private fun addButtonWithTopMargin(stack: LinearLayout, button: Button, topMarginDp: Int) {
        stack.addView(button, buttonParams().apply { setMargins(0, dp(topMarginDp), 0, 0) })
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

    private fun buttonParams(): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(54))
    }

    private fun matchWrap(): LinearLayout.LayoutParams {
        return LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT,
        )
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private companion object {
        val API_KEY: String = BuildConfig.SHENAI_API_KEY
        const val USER_ID = ""
    }
}
