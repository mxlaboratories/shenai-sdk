package ai.mxlabs.sdk_android_kotlin_minimal_example

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK
import ai.mxlabs.shenai_sdk.ShenAIView
import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission
import androidx.core.content.ContextCompat
import java.util.Optional

class MainActivity : ComponentActivity() {
    private val shenaiSDKHandler = ShenAIAndroidSDK()
    private val handler = Handler(Looper.getMainLooper())
    private var contentFrame: FrameLayout? = null
    private var toggleButton: Button? = null
    private var initializationResult: ShenAIAndroidSDK.InitializationResult? = null
    private var initialized = false
    private var appResumed = true

    private val resultsTask = object : Runnable {
        override fun run() {
            if (!initialized) {
                return
            }
            val results = shenaiSDKHandler.measurementResults
            val heartRate10s = shenaiSDKHandler.heartRate10s
            if (results != null) {
                println("Measurement result: HR ${results.hrBpm}, SDNN ${results.hrvSdnnMs}")
            } else {
                println("Current heart rate: $heartRate10s")
            }
            handler.postDelayed(this, POLLING_INTERVAL_MS)
        }
    }

    private val requestPermissionLauncher = registerForActivityResult(RequestPermission()) { isGranted ->
        if (isGranted) {
            initializeSdk()
        } else {
            Toast.makeText(this, "Camera permission is required for this demo.", Toast.LENGTH_LONG).show()
            showStatus("Camera permission is required.")
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        showShell()

        if (API_KEY.isEmpty()) {
            showMissingApiKey()
            return
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initializeSdk()
        } else {
            showStatus("Camera permission is required.")
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun showShell() {
        val shell = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.WHITE)
        }

        val toolbar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(8), 0, dp(16), 0)
        }
        shell.addView(toolbar, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(56)))

        toggleButton = Button(this).apply {
            isAllCaps = false
            text = "Initialize"
            setOnClickListener { toggleSdkInitialization() }
        }
        toolbar.addView(toggleButton, LinearLayout.LayoutParams(dp(132), dp(44)))

        val title = TextView(this).apply {
            text = "Shen.AI Minimal"
            setTextColor(Color.BLACK)
            textSize = 20f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER_VERTICAL
        }
        val titleParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1f).apply {
            setMargins(dp(12), 0, 0, 0)
        }
        toolbar.addView(title, titleParams)

        contentFrame = FrameLayout(this)
        shell.addView(contentFrame, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))
        setContentView(shell)
    }

    private fun toggleSdkInitialization() {
        if (initialized) {
            deinitializeSdk()
            return
        }
        if (API_KEY.isEmpty()) {
            showMissingApiKey()
            return
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initializeSdk()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun initializeSdk() {
        if (API_KEY.isEmpty()) {
            showMissingApiKey()
            return
        }

        showStatus("Initializing SDK...")
        val settings = minimalSettings().apply {
            eventCallback = ShenAIAndroidSDK.EventCallback { event ->
                println("Shen.AI event: $event")
            }
        }

        initializationResult = shenaiSDKHandler.initialize(this, API_KEY, USER_ID, settings)
        initialized = initializationResult == ShenAIAndroidSDK.InitializationResult.OK
        if (initialized) {
            showSdkView()
            handler.removeCallbacks(resultsTask)
            handler.postDelayed(resultsTask, POLLING_INTERVAL_MS)
        } else {
            showStatus("Initialization failed: $initializationResult")
        }
        updateToggleButton()
    }

    private fun deinitializeSdk() {
        handler.removeCallbacks(resultsTask)
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.deinitialize()
        }
        initialized = false
        showStatus("SDK deinitialized")
        updateToggleButton()
    }

    private fun showSdkView() {
        val frame = contentFrame ?: return
        frame.removeAllViews()
        if (!appResumed) {
            showStatus("SDK view paused")
            return
        }
        frame.addView(
            ShenAIView(this),
            FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT),
        )
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER)
        }
    }

    private fun showStatus(message: String) {
        val frame = contentFrame ?: return
        frame.removeAllViews()
        frame.addView(
            TextView(this).apply {
                text = message
                setTextColor(Color.BLACK)
                gravity = Gravity.CENTER
            },
            FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT),
        )
    }

    private fun updateToggleButton() {
        toggleButton?.text = if (initialized) "Deinitialize" else "Initialize"
    }

    private fun showMissingApiKey() {
        showStatus("Missing SHENAI_API_KEY. Run with -PshenaiApiKey=<your-api-key>.")
        Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show()
        updateToggleButton()
    }

    override fun onPause() {
        super.onPause()
        appResumed = false
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF)
        }
    }

    override fun onResume() {
        super.onResume()
        appResumed = true
        if (initialized) {
            showSdkView()
        }
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        if (shenaiSDKHandler.isInitialized) {
            shenaiSDKHandler.deinitialize()
        }
        super.onDestroy()
    }

    private fun minimalSettings(): ShenAIAndroidSDK.InitializationSettings {
        return shenaiSDKHandler.defaultInitializationSettings.apply {
            precisionMode = ShenAIAndroidSDK.PrecisionMode.RELAXED
            operatingMode = ShenAIAndroidSDK.OperatingMode.MEASURE
            measurementPreset = ShenAIAndroidSDK.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS
            cameraMode = ShenAIAndroidSDK.CameraMode.FACING_USER
            onboardingMode = ShenAIAndroidSDK.OnboardingMode.SHOW_ONCE
            showUserInterface = true
            showFacePositioningOverlay = true
            showVisualWarnings = true
            enableCameraSwap = true
            showFaceMask = true
            showBloodFlow = true
            enableStartAfterSuccess = false
            enableSummaryScreen = true
            showResultsFinishButton = true
            enableHealthRisks = true
            showHealthIndicesFinishButton = true
            saveHealthRisksFactors = true
            showOutOfRangeResultIndicators = true
            applyPrecisionModeToBloodPressure = false
            showSignalQualityIndicator = true
            showSignalTile = true
            showStartStopButton = true
            showInfoButton = true
            showDisclaimer = true
            uiVersion = ShenAIAndroidSDK.UiVersion.V2
            risksFactors = exampleRiskFactors()
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

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

    private companion object {
        val API_KEY: String = BuildConfig.SHENAI_API_KEY
        const val USER_ID = ""
        const val POLLING_INTERVAL_MS = 1000L
    }
}
