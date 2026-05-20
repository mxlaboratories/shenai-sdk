package ai.mxlabs.sdk_android_minimal_example;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;

import java.util.Optional;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;
import ai.mxlabs.shenai_sdk.ShenAIView;

public class MainActivity extends ComponentActivity {
    private static final String API_KEY = BuildConfig.SHENAI_API_KEY;
    private static final String USER_ID = "";
    private static final int POLLING_INTERVAL_MS = 1000;

    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private FrameLayout contentFrame;
    private Button toggleButton;
    private ShenAIAndroidSDK.InitializationResult initializationResult;
    private boolean initialized;
    private boolean appResumed = true;

    private final Runnable resultsTask = new Runnable() {
        @Override
        public void run() {
            if (!initialized) {
                return;
            }
            ShenAIAndroidSDK.MeasurementResults results = shenaiSDKHandler.getMeasurementResults();
            int heartRate10s = shenaiSDKHandler.getHeartRate10s();
            if (results != null) {
                System.out.println("Measurement result: HR " + results.hrBpm + ", SDNN " + results.hrvSdnnMs);
            } else {
                System.out.println("Current heart rate: " + heartRate10s);
            }
            handler.postDelayed(this, POLLING_INTERVAL_MS);
        }
    };

    private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new RequestPermission(),
            isGranted -> {
                if (isGranted) {
                    initializeSdk();
                } else {
                    Toast.makeText(this, "Camera permission is required for this demo.", Toast.LENGTH_LONG).show();
                    showStatus("Camera permission is required.");
                }
            });

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        showShell();

        if (API_KEY.isEmpty()) {
            showMissingApiKey();
            return;
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initializeSdk();
        } else {
            showStatus("Camera permission is required.");
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void showShell() {
        LinearLayout shell = new LinearLayout(this);
        shell.setOrientation(LinearLayout.VERTICAL);
        shell.setBackgroundColor(Color.WHITE);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(8), 0, dp(16), 0);
        shell.addView(toolbar, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(56)));

        toggleButton = new Button(this);
        toggleButton.setAllCaps(false);
        toggleButton.setText("Initialize");
        toggleButton.setOnClickListener(view -> toggleSdkInitialization());
        toolbar.addView(toggleButton, new LinearLayout.LayoutParams(dp(132), dp(44)));

        TextView title = new TextView(this);
        title.setText("Shen.AI Minimal");
        title.setTextColor(Color.BLACK);
        title.setTextSize(20);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1);
        titleParams.setMargins(dp(12), 0, 0, 0);
        toolbar.addView(title, titleParams);

        contentFrame = new FrameLayout(this);
        shell.addView(contentFrame, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1));

        setContentView(shell);
    }

    private void toggleSdkInitialization() {
        if (initialized) {
            deinitializeSdk();
            return;
        }
        if (API_KEY.isEmpty()) {
            showMissingApiKey();
            return;
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initializeSdk();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void initializeSdk() {
        if (API_KEY.isEmpty()) {
            showMissingApiKey();
            return;
        }

        showStatus("Initializing SDK...");

        ShenAIAndroidSDK.InitializationSettings settings = minimalSettings();
        settings.eventCallback = event -> System.out.println("Shen.AI event: " + event);

        initializationResult = shenaiSDKHandler.initialize(this, API_KEY, USER_ID, settings);
        initialized = initializationResult == ShenAIAndroidSDK.InitializationResult.OK;
        if (initialized) {
            showSdkView();
            handler.removeCallbacks(resultsTask);
            handler.postDelayed(resultsTask, POLLING_INTERVAL_MS);
        } else {
            showStatus("Initialization failed: " + initializationResult);
        }
        updateToggleButton();
    }

    private void deinitializeSdk() {
        handler.removeCallbacks(resultsTask);
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.deinitialize();
        }
        initialized = false;
        showStatus("SDK deinitialized");
        updateToggleButton();
    }

    private void showSdkView() {
        if (contentFrame == null) {
            return;
        }
        contentFrame.removeAllViews();
        if (!appResumed) {
            showStatus("SDK view paused");
            return;
        }
        contentFrame.addView(new ShenAIView(this), new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER);
        }
    }

    private void showStatus(String message) {
        if (contentFrame == null) {
            return;
        }
        contentFrame.removeAllViews();
        TextView statusText = new TextView(this);
        statusText.setText(message);
        statusText.setTextColor(Color.BLACK);
        statusText.setGravity(Gravity.CENTER);
        contentFrame.addView(statusText, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
    }

    private void updateToggleButton() {
        if (toggleButton != null) {
            toggleButton.setText(initialized ? "Deinitialize" : "Initialize");
        }
    }

    private void showMissingApiKey() {
        showStatus("Missing SHENAI_API_KEY. Run with -PshenaiApiKey=<your-api-key>.");
        Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show();
        updateToggleButton();
    }

    @Override
    protected void onPause() {
        super.onPause();
        appResumed = false;
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        appResumed = true;
        if (initialized) {
            showSdkView();
        }
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.deinitialize();
        }
        super.onDestroy();
    }

    private ShenAIAndroidSDK.InitializationSettings minimalSettings() {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        settings.precisionMode = ShenAIAndroidSDK.PrecisionMode.RELAXED;
        settings.operatingMode = ShenAIAndroidSDK.OperatingMode.MEASURE;
        settings.measurementPreset = ShenAIAndroidSDK.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS;
        settings.cameraMode = ShenAIAndroidSDK.CameraMode.FACING_USER;
        settings.onboardingMode = ShenAIAndroidSDK.OnboardingMode.SHOW_ONCE;
        settings.showUserInterface = true;
        settings.showFacePositioningOverlay = true;
        settings.showVisualWarnings = true;
        settings.enableCameraSwap = true;
        settings.showFaceMask = true;
        settings.showBloodFlow = true;
        settings.enableStartAfterSuccess = false;
        settings.enableSummaryScreen = true;
        settings.showResultsFinishButton = true;
        settings.enableHealthRisks = true;
        settings.showHealthIndicesFinishButton = true;
        settings.saveHealthRisksFactors = true;
        settings.showOutOfRangeResultIndicators = true;
        settings.applyPrecisionModeToBloodPressure = false;
        settings.showSignalQualityIndicator = true;
        settings.showSignalTile = true;
        settings.showStartStopButton = true;
        settings.showInfoButton = true;
        settings.showDisclaimer = true;
        settings.uiVersion = ShenAIAndroidSDK.UiVersion.V2;
        settings.risksFactors = exampleRiskFactors();
        return settings;
    }

    private ShenAIAndroidSDK.RisksFactors exampleRiskFactors() {
        ShenAIAndroidSDK.RisksFactors factors = shenaiSDKHandler.new RisksFactors();
        factors.age = Optional.of(45);
        factors.cholesterol = Optional.of(190f);
        factors.cholesterolHdl = Optional.of(52f);
        factors.sbp = Optional.of(128f);
        factors.dbp = Optional.of(82f);
        factors.isSmoker = Optional.of(false);
        factors.hypertensionTreatment = Optional.of(ShenAIAndroidSDK.HypertensionTreatment.NO);
        factors.hasDiabetes = Optional.of(false);
        factors.bodyHeight = Optional.of(172f);
        factors.bodyWeight = Optional.of(74f);
        factors.waistCircumference = Optional.of(84f);
        factors.neckCircumference = Optional.of(38f);
        factors.hipCircumference = Optional.of(98f);
        factors.gender = Optional.of(ShenAIAndroidSDK.Gender.FEMALE);
        factors.physicalActivity = Optional.of(ShenAIAndroidSDK.PhysicalActivity.MODERATELY);
        factors.country = "US";
        factors.race = Optional.of(ShenAIAndroidSDK.Race.WHITE);
        factors.vegetableFruitDiet = Optional.of(true);
        factors.historyOfHighGlucose = Optional.of(false);
        factors.historyOfHypertension = Optional.of(false);
        factors.triglyceride = Optional.of(120f);
        factors.fastingGlucose = Optional.of(92f);
        factors.familyDiabetes = Optional.of(ShenAIAndroidSDK.FamilyHistory.NONE_FIRST_DEGREE);
        factors.parentalHypertension = Optional.of(ShenAIAndroidSDK.ParentalHistory.NONE);
        return factors;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
