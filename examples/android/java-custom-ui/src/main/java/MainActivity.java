package ai.mxlabs.sdk_android_custom_ui_example;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Outline;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.view.WindowManager;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;
import ai.mxlabs.shenai_sdk.ShenAIView;

public class MainActivity extends ComponentActivity {
    private static final String API_KEY = BuildConfig.SHENAI_API_KEY;
    private static final String USER_ID = "";
    private static final int POLLING_INTERVAL_MS = 200;

    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private RiskProfile profile = RiskProfile.defaults();
    private AppScreen currentScreen = AppScreen.MEASURE;
    private AppScreen riskFormReturnScreen = AppScreen.MEASURE;

    private ShenAIAndroidSDK.InitializationResult initializationResult;
    private CircleFrameLayout cameraContainer;
    private TextView cameraPlaceholder;
    private ProgressBar progressBar;
    private TextView statusText;
    private LinearLayout qualityGrid;
    private LinearLayout headlineGrid;
    private Button startButton;
    private Button stopButton;
    private Button resultsButton;

    private boolean isPolling;
    private boolean isResettingMeasurement;
    private ShenAIAndroidSDK.MeasurementState measurementState;
    private ShenAIAndroidSDK.MeasurementResults realtimeMetrics;
    private ShenAIAndroidSDK.MeasurementResults results;
    private ShenAIAndroidSDK.HealthRisks healthRisks;
    private ShenAIAndroidSDK.MeasurementEnvironmentCondition violatedCondition;
    private boolean hasReachedFinalizing;
    private boolean hasFinishedMeasurement;
    private float progress;
    private int measurementResetGeneration;

    private final Runnable pollTask = new Runnable() {
        @Override
        public void run() {
            if (currentScreen == AppScreen.MEASURE) {
                refreshSdkState(false);
                handler.postDelayed(this, POLLING_INTERVAL_MS);
            }
        }
    };

    private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new RequestPermission(),
            isGranted -> {
                if (isGranted) {
                    initializeAndShowMeasurement();
                } else {
                    Toast.makeText(this, "Camera permission is required for this demo.", Toast.LENGTH_LONG).show();
                    showMeasurementScreen();
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (API_KEY.isEmpty()) {
            showMeasurementScreen();
            Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show();
            return;
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initializeAndShowMeasurement();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void initializeAndShowMeasurement() {
        if (API_KEY.isEmpty()) {
            showMeasurementScreen();
            Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show();
            return;
        }

        ShenAIAndroidSDK.InitializationSettings settings = customUiSettings(profile);
        settings.eventCallback = event -> {
            System.out.println("Shen.AI event: " + event);
            boolean shouldHandleFinished = isRunningMeasurementState(measurementState)
                    || hasReachedFinalizing
                    || measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED;
            if (event == ShenAIAndroidSDK.Event.MEASUREMENT_FINISHED
                    && !isResettingMeasurement
                    && shouldHandleFinished) {
                runOnUiThread(() -> {
                    hasFinishedMeasurement = true;
                    refreshSdkState(true);
                });
            }
        };
        initializationResult = shenaiSDKHandler.initialize(this, API_KEY, USER_ID, settings);
        if (initializationResult != ShenAIAndroidSDK.InitializationResult.OK) {
            Toast.makeText(this, "Initialization failed: " + initializationResult, Toast.LENGTH_LONG).show();
        }
        showMeasurementScreen();
    }

    private boolean isInitialized() {
        return initializationResult == ShenAIAndroidSDK.InitializationResult.OK && shenaiSDKHandler.isInitialized();
    }

    private void showMeasurementScreen() {
        currentScreen = AppScreen.MEASURE;
        handler.removeCallbacks(pollTask);

        ScrollView scrollView = new ScrollView(this);
        LinearLayout stack = new LinearLayout(this);
        stack.setOrientation(LinearLayout.VERTICAL);
        stack.setPadding(dp(20), dp(12), dp(20), dp(28));
        scrollView.addView(stack);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        TextView title = new TextView(this);
        title.setText("Custom UI");
        title.setTextSize(20);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        toolbar.addView(title, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        Button formButton = iconTextButton("Health form");
        formButton.setOnClickListener(view -> openRiskForm(AppScreen.MEASURE));
        toolbar.addView(formButton, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(44)));
        stack.addView(toolbar, matchWrap());

        cameraContainer = new CircleFrameLayout(this);
        GradientDrawable cameraBackground = new GradientDrawable();
        cameraBackground.setShape(GradientDrawable.OVAL);
        cameraBackground.setColor(Color.rgb(237, 237, 237));
        cameraBackground.setStroke(dp(2), Color.BLACK);
        cameraContainer.setBackground(cameraBackground);
        cameraPlaceholder = new TextView(this);
        cameraPlaceholder.setTextColor(Color.BLACK);
        cameraPlaceholder.setGravity(Gravity.CENTER);
        cameraPlaceholder.setText(initializationText());
        cameraContainer.addView(cameraPlaceholder, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        if (isInitialized()) {
            cameraPlaceholder.setVisibility(View.GONE);
            int cameraSide = dp(260);
            int cameraHeight = Math.round(cameraSide / (9f / 16f));
            cameraContainer.addView(new ShenAIView(this), new FrameLayout.LayoutParams(
                    cameraSide,
                    cameraHeight,
                    Gravity.CENTER));
        }
        LinearLayout.LayoutParams cameraParams = new LinearLayout.LayoutParams(dp(260), dp(260));
        cameraParams.gravity = Gravity.CENTER_HORIZONTAL;
        cameraParams.setMargins(0, dp(18), 0, dp(6));
        stack.addView(cameraContainer, cameraParams);

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(1000);
        stack.addView(progressBar, matchWrap());

        statusText = new TextView(this);
        statusText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams statusParams = matchWrap();
        statusParams.setMargins(0, dp(10), 0, 0);
        stack.addView(statusText, statusParams);

        qualityGrid = new LinearLayout(this);
        qualityGrid.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams qualityParams = matchWrap();
        qualityParams.setMargins(0, dp(18), 0, 0);
        stack.addView(qualityGrid, qualityParams);

        LinearLayout buttonsRow = new LinearLayout(this);
        buttonsRow.setOrientation(LinearLayout.HORIZONTAL);
        buttonsRow.setGravity(Gravity.CENTER);
        startButton = filledButton("Start");
        stopButton = outlineButton("Stop");
        startButton.setOnClickListener(view -> startMeasurement());
        stopButton.setOnClickListener(view -> stopMeasurement());
        LinearLayout.LayoutParams rowButtonParams = new LinearLayout.LayoutParams(0, dp(44), 1);
        buttonsRow.addView(startButton, rowButtonParams);
        LinearLayout.LayoutParams stopParams = new LinearLayout.LayoutParams(0, dp(44), 1);
        stopParams.setMargins(dp(12), 0, 0, 0);
        buttonsRow.addView(stopButton, stopParams);
        LinearLayout.LayoutParams buttonsParams = matchWrap();
        buttonsParams.setMargins(0, dp(20), 0, 0);
        stack.addView(buttonsRow, buttonsParams);

        resultsButton = filledButton("SEE RESULTS");
        resultsButton.setOnClickListener(view -> showResultsScreen());
        LinearLayout.LayoutParams resultsParams = buttonParams();
        resultsParams.setMargins(0, dp(12), 0, 0);
        stack.addView(resultsButton, resultsParams);

        headlineGrid = new LinearLayout(this);
        headlineGrid.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams headlineParams = matchWrap();
        headlineParams.setMargins(0, dp(20), 0, 0);
        stack.addView(headlineGrid, headlineParams);

        setContentView(scrollView);
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER);
        }
        refreshSdkState(false);
        handler.postDelayed(pollTask, POLLING_INTERVAL_MS);
    }

    private String initializationText() {
        if (API_KEY.isEmpty()) {
            return "Missing SHENAI_API_KEY.\nRun with -PshenaiApiKey=<your-api-key>.";
        }
        if (initializationResult == null) {
            return "Camera permission is required.";
        }
        if (initializationResult == ShenAIAndroidSDK.InitializationResult.OK) {
            return "";
        }
        return "Initialization failed: " + initializationResult;
    }

    private void startMeasurement() {
        if (API_KEY.isEmpty()) {
            Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show();
            updateMeasurementUi();
            return;
        }
        if (!isInitialized()) {
            return;
        }
        isResettingMeasurement = true;
        try {
            resetMeasurementUiState();
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER);
            shenaiSDKHandler.resetMeasurementSession();
            shenaiSDKHandler.setOperatingMode(ShenAIAndroidSDK.OperatingMode.MEASURE);
            shenaiSDKHandler.startMeasurement();
        } finally {
            isResettingMeasurement = false;
        }
        refreshSdkState(false);
    }

    private void stopMeasurement() {
        if (!isInitialized()) {
            return;
        }
        isResettingMeasurement = true;
        try {
            shenaiSDKHandler.resetMeasurementSession();
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER);
            resetMeasurementUiState();
        } finally {
            isResettingMeasurement = false;
        }
    }

    private void refreshSdkState(boolean loadHealthRisks) {
        if (isPolling || isResettingMeasurement || !isInitialized()) {
            updateMeasurementUi();
            return;
        }
        isPolling = true;
        measurementState = shenaiSDKHandler.getMeasurementState();
        progress = shenaiSDKHandler.getMeasurementProgressPercentage();
        violatedCondition = shenaiSDKHandler.getCurrentViolatedMeasurementEnvironmentCondition();
        ShenAIAndroidSDK.MeasurementResults currentRealtime = shenaiSDKHandler.getRealtimeMetrics(10f);
        boolean liveMeasurementState = isRunningMeasurementState(measurementState);
        if (liveMeasurementState && currentRealtime != null) {
            realtimeMetrics = currentRealtime;
        } else if (!liveMeasurementState) {
            realtimeMetrics = null;
        }
        ShenAIAndroidSDK.MeasurementResults currentResults = shenaiSDKHandler.getMeasurementResults();
        if (currentResults != null
                && (hasFinishedMeasurement || measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED)) {
            results = currentResults;
        }
        if (measurementState == ShenAIAndroidSDK.MeasurementState.FINALIZING) {
            hasReachedFinalizing = true;
        }
        if (measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED) {
            hasFinishedMeasurement = true;
        }
        if (loadHealthRisks || (measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED && healthRisks == null)) {
            healthRisks = shenaiSDKHandler.computeHealthRisks(profile.toRisksFactors(shenaiSDKHandler, results));
        }
        isPolling = false;
        updateMeasurementUi();
    }

    private void resetMeasurementUiState() {
        measurementResetGeneration++;
        measurementState = null;
        realtimeMetrics = null;
        results = null;
        healthRisks = null;
        violatedCondition = null;
        hasReachedFinalizing = false;
        hasFinishedMeasurement = false;
        progress = 0;
        updateMeasurementUi();
    }

    private void updateMeasurementUi() {
        if (currentScreen != AppScreen.MEASURE || progressBar == null) {
            return;
        }
        boolean running = isRunningMeasurementState(measurementState);
        boolean measurementFinished = hasFinishedMeasurement || measurementState == ShenAIAndroidSDK.MeasurementState.FINISHED;
        ShenAIAndroidSDK.MeasurementResults displayResults = results != null ? results : realtimeMetrics;

        if (API_KEY.isEmpty()) {
            progressBar.setProgress(0);
            statusText.setText("Missing SHENAI_API_KEY. Run with -PshenaiApiKey=<your-api-key>.");
            startButton.setEnabled(false);
            stopButton.setEnabled(false);
            resultsButton.setVisibility(View.GONE);
            setQualityIndicator(qualityGrid, "Live quality", null);
            setGrid(headlineGrid, null, headlineValues(null));
            return;
        }

        progressBar.setProgress(Math.round(progress * 10));
        statusText.setText(String.format(Locale.getDefault(), "%s - %.0f%%",
                measurementStatusText(measurementState, violatedCondition, hasReachedFinalizing, hasFinishedMeasurement),
                progress));
        startButton.setEnabled(isInitialized() && !running);
        stopButton.setEnabled(isInitialized() && running);
        resultsButton.setVisibility(measurementFinished ? View.VISIBLE : View.GONE);
        resultsButton.setEnabled(measurementFinished && results != null);
        setQualityIndicator(qualityGrid, "Live quality", displayResults);
        setGrid(headlineGrid, null, headlineValues(displayResults));
    }

    private void showResultsScreen() {
        currentScreen = AppScreen.RESULTS;
        handler.removeCallbacks(pollTask);
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF);
        }

        ScrollView scrollView = new ScrollView(this);
        LinearLayout stack = new LinearLayout(this);
        stack.setOrientation(LinearLayout.VERTICAL);
        stack.setPadding(dp(20), dp(20), dp(20), dp(28));
        scrollView.addView(stack);

        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        TextView title = new TextView(this);
        title.setText("Results");
        title.setTextSize(20);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        toolbar.addView(title, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        Button formButton = iconTextButton("Health form");
        formButton.setOnClickListener(view -> openRiskForm(AppScreen.RESULTS));
        toolbar.addView(formButton, new LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, dp(44)));
        stack.addView(toolbar, matchWrap());

        addQualityToStack(stack, "Measurement quality", results);
        addGridToStack(stack, null, measurementMetricValues(results));
        addGridToStack(stack, "Health indices", healthRiskValues(healthRisks));

        setContentView(scrollView);
    }

    private void openRiskForm(AppScreen returnScreen) {
        riskFormReturnScreen = returnScreen;
        currentScreen = AppScreen.RISK_FORM;
        handler.removeCallbacks(pollTask);
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF);
        }

        ScrollView scrollView = new ScrollView(this);
        LinearLayout stack = new LinearLayout(this);
        stack.setOrientation(LinearLayout.VERTICAL);
        stack.setPadding(dp(20), dp(20), dp(20), dp(28));
        scrollView.addView(stack);

        TextView title = new TextView(this);
        title.setText("Health form");
        title.setTextSize(20);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        stack.addView(title, matchWrap());

        List<NumberInput> inputs = new ArrayList<>();
        inputs.add(addNumberInput(stack, "Age", profile.age));
        inputs.add(addNumberInput(stack, "Height (cm)", profile.heightCm));
        inputs.add(addNumberInput(stack, "Weight (kg)", profile.weightKg));
        inputs.add(addNumberInput(stack, "Waist (cm)", profile.waistCm));
        inputs.add(addNumberInput(stack, "Neck (cm)", profile.neckCm));
        inputs.add(addNumberInput(stack, "Hip (cm)", profile.hipCm));
        inputs.add(addNumberInput(stack, "Cholesterol", profile.cholesterol));
        inputs.add(addNumberInput(stack, "HDL", profile.hdl));
        inputs.add(addNumberInput(stack, "SBP", profile.sbp));
        inputs.add(addNumberInput(stack, "DBP", profile.dbp));
        inputs.add(addNumberInput(stack, "Triglyceride", profile.triglyceride));
        inputs.add(addNumberInput(stack, "Fasting glucose", profile.fastingGlucose));

        Switch smokerSwitch = addSwitch(stack, "Smoker", profile.isSmoker);
        Switch diabetesSwitch = addSwitch(stack, "Diabetes", profile.hasDiabetes);
        Switch fruitSwitch = addSwitch(stack, "Fruit / vegetable diet", profile.vegetableFruitDiet);
        Switch glucoseSwitch = addSwitch(stack, "High glucose history", profile.historyOfHighGlucose);
        Switch hypertensionSwitch = addSwitch(stack, "Hypertension history", profile.historyOfHypertension);
        EditText countryInput = addTextInput(stack, "Country", profile.country);
        Spinner genderSpinner = addEnumInput(stack, "Gender", ShenAIAndroidSDK.Gender.values(), profile.gender);
        Spinner activitySpinner = addEnumInput(stack, "Physical activity", ShenAIAndroidSDK.PhysicalActivity.values(), profile.physicalActivity);
        Spinner raceSpinner = addEnumInput(stack, "Race", ShenAIAndroidSDK.Race.values(), profile.race);
        Spinner treatmentSpinner = addEnumInput(stack, "Hypertension treatment", ShenAIAndroidSDK.HypertensionTreatment.values(), profile.hypertensionTreatment);
        Spinner familySpinner = addEnumInput(stack, "Family diabetes", ShenAIAndroidSDK.FamilyHistory.values(), profile.familyDiabetes);
        Spinner parentalSpinner = addEnumInput(stack, "Parental hypertension", ShenAIAndroidSDK.ParentalHistory.values(), profile.parentalHypertension);

        Button saveButton = filledButton("Save");
        saveButton.setOnClickListener(view -> {
            profile.age = Math.round(inputs.get(0).floatValue(profile.age));
            profile.heightCm = inputs.get(1).floatValue(profile.heightCm);
            profile.weightKg = inputs.get(2).floatValue(profile.weightKg);
            profile.waistCm = inputs.get(3).floatValue(profile.waistCm);
            profile.neckCm = inputs.get(4).floatValue(profile.neckCm);
            profile.hipCm = inputs.get(5).floatValue(profile.hipCm);
            profile.cholesterol = inputs.get(6).floatValue(profile.cholesterol);
            profile.hdl = inputs.get(7).floatValue(profile.hdl);
            profile.sbp = inputs.get(8).floatValue(profile.sbp);
            profile.dbp = inputs.get(9).floatValue(profile.dbp);
            profile.triglyceride = inputs.get(10).floatValue(profile.triglyceride);
            profile.fastingGlucose = inputs.get(11).floatValue(profile.fastingGlucose);
            profile.isSmoker = smokerSwitch.isChecked();
            profile.hasDiabetes = diabetesSwitch.isChecked();
            profile.vegetableFruitDiet = fruitSwitch.isChecked();
            profile.historyOfHighGlucose = glucoseSwitch.isChecked();
            profile.historyOfHypertension = hypertensionSwitch.isChecked();
            String country = countryInput.getText().toString().trim();
            profile.country = country.isEmpty() ? "US" : country;
            profile.gender = (ShenAIAndroidSDK.Gender) genderSpinner.getSelectedItem();
            profile.physicalActivity = (ShenAIAndroidSDK.PhysicalActivity) activitySpinner.getSelectedItem();
            profile.race = (ShenAIAndroidSDK.Race) raceSpinner.getSelectedItem();
            profile.hypertensionTreatment = (ShenAIAndroidSDK.HypertensionTreatment) treatmentSpinner.getSelectedItem();
            profile.familyDiabetes = (ShenAIAndroidSDK.FamilyHistory) familySpinner.getSelectedItem();
            profile.parentalHypertension = (ShenAIAndroidSDK.ParentalHistory) parentalSpinner.getSelectedItem();
            computeHealthRisks();
            if (riskFormReturnScreen == AppScreen.RESULTS) {
                showResultsScreen();
            } else {
                showMeasurementScreen();
            }
        });
        LinearLayout.LayoutParams saveParams = buttonParams();
        saveParams.setMargins(0, dp(20), 0, 0);
        stack.addView(saveButton, saveParams);

        setContentView(scrollView);
    }

    private void computeHealthRisks() {
        if (isInitialized() && results != null) {
            healthRisks = shenaiSDKHandler.computeHealthRisks(profile.toRisksFactors(shenaiSDKHandler, results));
        }
    }

    @Override
    public void onBackPressed() {
        if (currentScreen == AppScreen.RESULTS) {
            showMeasurementScreen();
            return;
        }
        if (currentScreen == AppScreen.RISK_FORM) {
            if (riskFormReturnScreen == AppScreen.RESULTS) {
                showResultsScreen();
            } else {
                showMeasurementScreen();
            }
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (currentScreen == AppScreen.MEASURE && isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER);
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

    private ShenAIAndroidSDK.InitializationSettings customUiSettings(RiskProfile profile) {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        settings.precisionMode = ShenAIAndroidSDK.PrecisionMode.RELAXED;
        settings.operatingMode = ShenAIAndroidSDK.OperatingMode.MEASURE;
        settings.measurementPreset = ShenAIAndroidSDK.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS;
        settings.cameraMode = ShenAIAndroidSDK.CameraMode.FACING_USER;
        settings.onboardingMode = ShenAIAndroidSDK.OnboardingMode.HIDDEN;
        settings.showUserInterface = false;
        settings.showFacePositioningOverlay = false;
        settings.showVisualWarnings = false;
        settings.enableCameraSwap = false;
        settings.showFaceMask = true;
        settings.showBloodFlow = false;
        settings.enableStartAfterSuccess = false;
        settings.enableSummaryScreen = false;
        settings.showResultsFinishButton = false;
        settings.enableHealthRisks = true;
        settings.showHealthIndicesFinishButton = false;
        settings.saveHealthRisksFactors = true;
        settings.showOutOfRangeResultIndicators = false;
        settings.applyPrecisionModeToBloodPressure = false;
        settings.showSignalQualityIndicator = false;
        settings.showSignalTile = false;
        settings.showStartStopButton = false;
        settings.showInfoButton = false;
        settings.showDisclaimer = false;
        settings.uiVersion = ShenAIAndroidSDK.UiVersion.V2;
        settings.risksFactors = profile.toRisksFactors(shenaiSDKHandler, null);
        return settings;
    }

    private String measurementStatusText(
            ShenAIAndroidSDK.MeasurementState state,
            ShenAIAndroidSDK.MeasurementEnvironmentCondition condition,
            boolean hasReachedFinalizing,
            boolean hasFinishedMeasurement) {
        if (hasFinishedMeasurement || state == ShenAIAndroidSDK.MeasurementState.FINISHED) {
            return "Measurement finished";
        }
        if (hasReachedFinalizing || state == ShenAIAndroidSDK.MeasurementState.FINALIZING) {
            return "Finalizing";
        }
        if (condition != null) {
            return conditionInstruction(condition);
        }
        if (state == null || state == ShenAIAndroidSDK.MeasurementState.NOT_STARTED) {
            return "Ready";
        }
        switch (state) {
            case WAITING_FOR_FACE:
                return "Waiting for face";
            case RUNNING_SIGNAL_SHORT:
            case RUNNING_SIGNAL_GOOD:
            case RUNNING_SIGNAL_BAD:
            case RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE:
                return "Measurement conditions are good";
            case FAILED:
                return "Measurement failed";
            default:
                return "Ready";
        }
    }

    private String conditionInstruction(ShenAIAndroidSDK.MeasurementEnvironmentCondition condition) {
        switch (condition) {
            case FACE_POSITION:
            case FOREHEAD_VISIBLE:
                return "Uncover your forehead";
            case GLASSES_NOT_DETECTED:
                return "Remove your glasses";
            case SUFFICIENT_LIGHT_LEVEL:
                return "Move to brighter light";
            case EVEN_LIGHTING:
                return "Use even lighting";
            case NO_BACKLIGHT:
                return "Avoid backlight";
            case FACE_STABLE:
                return "Keep your face still";
            case DEVICE_STABLE:
                return "Keep the phone still";
            default:
                return "Ready";
        }
    }

    private boolean isRunningMeasurementState(ShenAIAndroidSDK.MeasurementState state) {
        return state == ShenAIAndroidSDK.MeasurementState.WAITING_FOR_FACE
                || state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_SHORT
                || state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_GOOD
                || state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_BAD
                || state == ShenAIAndroidSDK.MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE
                || state == ShenAIAndroidSDK.MeasurementState.FINALIZING;
    }

    private List<DisplayValue> headlineValues(ShenAIAndroidSDK.MeasurementResults item) {
        List<DisplayValue> values = new ArrayList<>();
        values.add(new DisplayValue("HR", item == null ? "-" : formatFloat(item.hrBpm, 0), "bpm"));
        values.add(new DisplayValue("SBP", formatOptionalFloat(item == null ? null : item.systolicBloodPressureMmhg, 0), "mmHg"));
        values.add(new DisplayValue("DBP", formatOptionalFloat(item == null ? null : item.diastolicBloodPressureMmhg, 0), "mmHg"));
        values.add(new DisplayValue("BR", formatOptionalFloat(item == null ? null : item.brBpm, 1), "brpm"));
        return values;
    }

    private List<DisplayValue> measurementMetricValues(ShenAIAndroidSDK.MeasurementResults item) {
        List<DisplayValue> values = new ArrayList<>();
        ShenAIAndroidSDK.MeasurementQualityMetrics quality = item == null ? null : item.qualityMetrics;
        values.add(new DisplayValue("Heart rate", item == null ? "-" : formatFloat(item.hrBpm, 0), "bpm"));
        values.add(new DisplayValue("HRV SDNN", formatOptionalFloat(item == null ? null : item.hrvSdnnMs, 1), "ms"));
        values.add(new DisplayValue("HRV lnRMSSD", formatOptionalFloat(item == null ? null : item.hrvLnrmssdMs, 2), "ms"));
        values.add(new DisplayValue("Cardiac stress", formatOptionalFloat(item == null ? null : item.stressIndex, 1), ""));
        values.add(new DisplayValue("PNS activity", formatOptionalFloat(item == null ? null : item.parasympatheticActivity, 1), ""));
        values.add(new DisplayValue("Breathing", formatOptionalFloat(item == null ? null : item.brBpm, 1), "brpm"));
        values.add(new DisplayValue("Systolic", formatOptionalFloat(item == null ? null : item.systolicBloodPressureMmhg, 0), "mmHg"));
        values.add(new DisplayValue("Diastolic", formatOptionalFloat(item == null ? null : item.diastolicBloodPressureMmhg, 0), "mmHg"));
        values.add(new DisplayValue("Workload", formatOptionalFloat(item == null ? null : item.cardiacWorkloadMmhgPerSec, 1), "mmHg/s"));
        values.add(new DisplayValue("Age", formatOptionalFloat(item == null ? null : item.ageYears, 0), "years"));
        values.add(new DisplayValue("BMI", formatOptionalFloat(item == null ? null : item.bmiKgPerM2, 1), "kg/m2"));
        values.add(new DisplayValue("BMI category", formatOptionalEnum(item == null ? null : item.bmiCategory), ""));
        values.add(new DisplayValue("Weight", formatOptionalFloat(item == null ? null : item.weightKg, 1), "kg"));
        values.add(new DisplayValue("Height", formatOptionalFloat(item == null ? null : item.heightCm, 1), "cm"));
        values.add(new DisplayValue("BP scale", formatBpScale(item), ""));
        values.add(new DisplayValue("Signal", item == null ? "-" : formatFloat(item.averageSignalQuality, 1), "dB"));
        values.add(new DisplayValue("PPG quality", formatOptionalFloat(quality == null ? null : quality.ppgQualityIndex, 1), ""));
        values.add(new DisplayValue("BCG quality", formatOptionalFloat(quality == null ? null : quality.bcgQualityIndex, 1), ""));
        values.add(new DisplayValue("BP quality", formatOptionalFloat(quality == null ? null : quality.bloodPressureQualityIndex, 1), ""));
        values.add(new DisplayValue("SBP median error", formatOptionalFloat(quality == null ? null : quality.expectedSbpMedianAbsErrorMmhg, 1), "mmHg"));
        values.add(new DisplayValue("SBP p80 error", formatOptionalFloat(quality == null ? null : quality.expectedSbpP80AbsErrorMmhg, 1), "mmHg"));
        values.add(new DisplayValue("SBP mean error", formatOptionalFloat(quality == null ? null : quality.expectedSbpMeanAbsErrorMmhg, 1), "mmHg"));
        values.add(new DisplayValue("SBP balanced MAE", formatOptionalFloat(quality == null ? null : quality.expectedSbpBalancedMaeMmhg, 1), "mmHg"));
        values.add(new DisplayValue("DBP median error", formatOptionalFloat(quality == null ? null : quality.expectedDbpMedianAbsErrorMmhg, 1), "mmHg"));
        values.add(new DisplayValue("DBP p80 error", formatOptionalFloat(quality == null ? null : quality.expectedDbpP80AbsErrorMmhg, 1), "mmHg"));
        values.add(new DisplayValue("DBP mean error", formatOptionalFloat(quality == null ? null : quality.expectedDbpMeanAbsErrorMmhg, 1), "mmHg"));
        values.add(new DisplayValue("DBP balanced MAE", formatOptionalFloat(quality == null ? null : quality.expectedDbpBalancedMaeMmhg, 1), "mmHg"));
        values.add(new DisplayValue("Heartbeats", item == null || item.heartbeats == null ? "-" : String.valueOf(item.heartbeats.length), ""));
        return values;
    }

    private List<DisplayValue> healthRiskValues(ShenAIAndroidSDK.HealthRisks risks) {
        List<DisplayValue> values = new ArrayList<>();
        values.add(new DisplayValue("Wellness", formatOptionalFloat(risks == null ? null : risks.wellnessScore, 1), ""));
        values.add(new DisplayValue("Vascular age", formatOptionalInteger(risks == null ? null : risks.vascularAge), "years"));
        values.add(new DisplayValue("CVD risk", formatOptionalFloat(risks == null ? null : risks.cvDiseases.overallRisk, 1), "%"));
        values.add(new DisplayValue("Coronary disease", formatOptionalFloat(risks == null ? null : risks.cvDiseases.coronaryHeartDiseaseRisk, 1), "%"));
        values.add(new DisplayValue("Stroke risk", formatOptionalFloat(risks == null ? null : risks.cvDiseases.strokeRisk, 1), "%"));
        values.add(new DisplayValue("Heart failure", formatOptionalFloat(risks == null ? null : risks.cvDiseases.heartFailureRisk, 1), "%"));
        values.add(new DisplayValue("Peripheral vascular", formatOptionalFloat(risks == null ? null : risks.cvDiseases.peripheralVascularDiseaseRisk, 1), "%"));
        values.add(new DisplayValue("Hard CV", formatOptionalFloat(risks == null ? null : risks.hardAndFatalEvents.hardCVEventRisk, 1), "%"));
        values.add(new DisplayValue("Coronary death", formatOptionalFloat(risks == null ? null : risks.hardAndFatalEvents.coronaryDeathEventRisk, 1), "%"));
        values.add(new DisplayValue("Fatal stroke", formatOptionalFloat(risks == null ? null : risks.hardAndFatalEvents.fatalStrokeEventRisk, 1), "%"));
        values.add(new DisplayValue("CV mortality", formatOptionalFloat(risks == null ? null : risks.hardAndFatalEvents.totalCVMortalityRisk, 1), "%"));
        values.add(new DisplayValue("Risk score", formatOptionalInteger(risks == null ? null : risks.scores.totalScore), ""));
        values.add(new DisplayValue("Age score", formatOptionalInteger(risks == null ? null : risks.scores.ageScore), ""));
        values.add(new DisplayValue("SBP score", formatOptionalInteger(risks == null ? null : risks.scores.sbpScore), ""));
        values.add(new DisplayValue("Smoking score", formatOptionalInteger(risks == null ? null : risks.scores.smokingScore), ""));
        values.add(new DisplayValue("Diabetes score", formatOptionalInteger(risks == null ? null : risks.scores.diabetesScore), ""));
        values.add(new DisplayValue("BMI score", formatOptionalInteger(risks == null ? null : risks.scores.bmiScore), ""));
        values.add(new DisplayValue("Cholesterol score", formatOptionalInteger(risks == null ? null : risks.scores.cholesterolScore), ""));
        values.add(new DisplayValue("HDL score", formatOptionalInteger(risks == null ? null : risks.scores.cholesterolHdlScore), ""));
        values.add(new DisplayValue("Hypertension", formatOptionalFloat(risks == null ? null : risks.hypertensionRisk, 1), "%"));
        values.add(new DisplayValue("Diabetes", formatOptionalFloat(risks == null ? null : risks.diabetesRisk, 1), "%"));
        values.add(new DisplayValue("Waist-height", formatOptionalFloat(risks == null ? null : risks.waistToHeightRatio, 2), ""));
        values.add(new DisplayValue("Body fat", formatOptionalFloat(risks == null ? null : risks.bodyFatPercentage, 1), "%"));
        values.add(new DisplayValue("Body roundness", formatOptionalFloat(risks == null ? null : risks.bodyRoundnessIndex, 2), ""));
        values.add(new DisplayValue("A body shape", formatOptionalFloat(risks == null ? null : risks.aBodyShapeIndex, 3), ""));
        values.add(new DisplayValue("Conicity", formatOptionalFloat(risks == null ? null : risks.conicityIndex, 2), ""));
        values.add(new DisplayValue("BMR", formatOptionalFloat(risks == null ? null : risks.basalMetabolicRate, 0), "kcal"));
        values.add(new DisplayValue("TDEE", formatOptionalFloat(risks == null ? null : risks.totalDailyEnergyExpenditure, 0), "kcal"));
        values.add(new DisplayValue("NAFLD", formatOptionalEnum(risks == null ? null : risks.nonAlcoholicFattyLiverDiseaseRisk), ""));
        return values;
    }

    private void addGridToStack(LinearLayout stack, String title, List<DisplayValue> values) {
        LinearLayout grid = new LinearLayout(this);
        grid.setOrientation(LinearLayout.VERTICAL);
        setGrid(grid, title, values);
        LinearLayout.LayoutParams params = matchWrap();
        params.setMargins(0, dp(20), 0, 0);
        stack.addView(grid, params);
    }

    private void addQualityToStack(LinearLayout stack, String title, ShenAIAndroidSDK.MeasurementResults item) {
        LinearLayout indicator = new LinearLayout(this);
        indicator.setOrientation(LinearLayout.VERTICAL);
        setQualityIndicator(indicator, title, item);
        LinearLayout.LayoutParams params = matchWrap();
        params.setMargins(0, dp(20), 0, 0);
        stack.addView(indicator, params);
    }

    private void setQualityIndicator(LinearLayout container, String title, ShenAIAndroidSDK.MeasurementResults item) {
        container.removeAllViews();
        TextView titleView = new TextView(this);
        titleView.setText(title);
        titleView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        LinearLayout.LayoutParams titleParams = matchWrap();
        titleParams.setMargins(0, 0, 0, dp(10));
        container.addView(titleView, titleParams);

        List<QualityValue> rows = qualityRows(item);
        if (rows.isEmpty()) {
            TextView emptyView = new TextView(this);
            emptyView.setText("Quality will appear during the measurement.");
            container.addView(emptyView, matchWrap());
            return;
        }
        for (QualityValue row : rows) {
            LinearLayout.LayoutParams rowParams = matchWrap();
            rowParams.setMargins(0, 0, 0, dp(8));
            container.addView(qualityRow(row), rowParams);
        }
    }

    private List<QualityValue> qualityRows(ShenAIAndroidSDK.MeasurementResults item) {
        List<QualityValue> rows = new ArrayList<>();
        if (item == null) {
            return rows;
        }
        ShenAIAndroidSDK.MeasurementQualityMetrics quality = item.qualityMetrics;
        rows.add(new QualityValue("Signal", formatFloat(item.averageSignalQuality, 1), qualityProgress(item.averageSignalQuality)));
        addQualityRow(rows, "PPG", quality == null ? null : quality.ppgQualityIndex);
        addQualityRow(rows, "BCG", quality == null ? null : quality.bcgQualityIndex);
        addQualityRow(rows, "BP", quality == null ? null : quality.bloodPressureQualityIndex);
        return rows;
    }

    private void addQualityRow(List<QualityValue> rows, String label, Optional<Float> value) {
        Float resolved = optionalFloat(value);
        if (resolved != null) {
            rows.add(new QualityValue(label, formatFloat(resolved, 1), qualityProgress(resolved)));
        }
    }

    private View qualityRow(QualityValue row) {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.HORIZONTAL);
        layout.setGravity(Gravity.CENTER_VERTICAL);

        TextView label = new TextView(this);
        label.setText(row.label);
        layout.addView(label, new LinearLayout.LayoutParams(dp(72), LinearLayout.LayoutParams.WRAP_CONTENT));

        if (row.progress == null) {
            View line = new View(this);
            line.setBackgroundColor(Color.BLACK);
            LinearLayout.LayoutParams lineParams = new LinearLayout.LayoutParams(0, dp(1), 1);
            layout.addView(line, lineParams);
        } else {
            ProgressBar bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
            bar.setMax(1000);
            bar.setProgress(Math.round(row.progress * 1000));
            layout.addView(bar, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        }

        TextView value = new TextView(this);
        value.setText(row.value);
        value.setGravity(Gravity.RIGHT);
        LinearLayout.LayoutParams valueParams = new LinearLayout.LayoutParams(dp(52), LinearLayout.LayoutParams.WRAP_CONTENT);
        valueParams.setMargins(dp(10), 0, 0, 0);
        layout.addView(value, valueParams);
        return layout;
    }

    private void setGrid(LinearLayout grid, String title, List<DisplayValue> values) {
        grid.removeAllViews();
        if (title != null) {
            TextView titleView = new TextView(this);
            titleView.setText(title);
            titleView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
            LinearLayout.LayoutParams titleParams = matchWrap();
            titleParams.setMargins(0, 0, 0, dp(10));
            grid.addView(titleView, titleParams);
        }
        for (int i = 0; i < values.size(); i += 2) {
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            row.addView(tile(values.get(i)), new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
            if (i + 1 < values.size()) {
                LinearLayout.LayoutParams secondParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1);
                secondParams.setMargins(dp(10), 0, 0, 0);
                row.addView(tile(values.get(i + 1)), secondParams);
            } else {
                row.addView(new View(this), new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
            }
            LinearLayout.LayoutParams rowParams = matchWrap();
            rowParams.setMargins(0, 0, 0, dp(10));
            grid.addView(row, rowParams);
        }
    }

    private View tile(DisplayValue value) {
        LinearLayout stack = new LinearLayout(this);
        stack.setOrientation(LinearLayout.VERTICAL);
        stack.setPadding(dp(12), dp(10), dp(12), dp(10));
        GradientDrawable background = new GradientDrawable();
        background.setColor(Color.WHITE);
        background.setStroke(dp(1), Color.BLACK);
        stack.setBackground(background);
        stack.setMinimumHeight(dp(112));

        TextView title = new TextView(this);
        title.setText(value.title);
        title.setTextSize(12);
        title.setTextColor(Color.DKGRAY);
        stack.addView(title, matchWrap());

        TextView metric = new TextView(this);
        metric.setText(value.unit.isEmpty() ? value.value : value.value + " " + value.unit);
        metric.setTextSize(16);
        metric.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        metric.setSingleLine(true);
        LinearLayout.LayoutParams metricParams = matchWrap();
        metricParams.setMargins(0, dp(4), 0, 0);
        stack.addView(metric, metricParams);
        return stack;
    }

    private NumberInput addNumberInput(LinearLayout stack, String label, float value) {
        addFormLabel(stack, label);

        EditText field = new EditText(this);
        field.setHint(label);
        field.setTextColor(Color.BLACK);
        field.setHintTextColor(Color.DKGRAY);
        field.setSingleLine(true);
        field.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        field.setText(formatFloat(value, value == Math.round(value) ? 0 : 1));
        LinearLayout.LayoutParams params = matchWrap();
        stack.addView(field, params);
        return new NumberInput(field);
    }

    private EditText addTextInput(LinearLayout stack, String label, String value) {
        addFormLabel(stack, label);

        EditText field = new EditText(this);
        field.setHint(label);
        field.setTextColor(Color.BLACK);
        field.setHintTextColor(Color.DKGRAY);
        field.setSingleLine(true);
        field.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_CHARACTERS);
        field.setText(value);
        stack.addView(field, matchWrap());
        return field;
    }

    private <T extends Enum<T>> Spinner addEnumInput(LinearLayout stack, String label, T[] values, T selected) {
        addFormLabel(stack, label);

        Spinner spinner = new Spinner(this);
        ArrayAdapter<T> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, values);
        spinner.setAdapter(adapter);
        spinner.setSelection(Math.max(0, adapter.getPosition(selected)));
        stack.addView(spinner, matchWrap());
        return spinner;
    }

    private void addFormLabel(LinearLayout stack, String label) {
        TextView text = new TextView(this);
        text.setText(label);
        text.setTextColor(Color.BLACK);
        text.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        LinearLayout.LayoutParams labelParams = matchWrap();
        labelParams.setMargins(0, dp(12), 0, 0);
        stack.addView(text, labelParams);
    }

    private Switch addSwitch(LinearLayout stack, String label, boolean checked) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        TextView text = new TextView(this);
        text.setText(label);
        text.setTextColor(Color.BLACK);
        row.addView(text, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        Switch control = new Switch(this);
        control.setChecked(checked);
        row.addView(control);
        LinearLayout.LayoutParams params = matchWrap();
        params.setMargins(0, dp(12), 0, 0);
        stack.addView(row, params);
        return control;
    }

    private String formatOptionalFloat(Optional<Float> value, int decimals) {
        if (value == null || !value.isPresent()) {
            return "-";
        }
        return formatFloat(value.get(), decimals);
    }

    private String formatOptionalInteger(Optional<Integer> value) {
        if (value == null || !value.isPresent()) {
            return "-";
        }
        return String.valueOf(value.get());
    }

    private Float optionalFloat(Optional<Float> value) {
        if (value == null || !value.isPresent()) {
            return null;
        }
        return value.get();
    }

    private <T> String formatOptionalEnum(Optional<T> value) {
        if (value == null || !value.isPresent()) {
            return "-";
        }
        return String.valueOf(value.get());
    }

    private String formatFloat(float value, int decimals) {
        return String.format(Locale.getDefault(), "%." + decimals + "f", value);
    }

    private String formatBpScale(ShenAIAndroidSDK.MeasurementResults item) {
        if (item == null) {
            return "-";
        }
        boolean hasSbp = item.systolicBloodPressureMmhg != null && item.systolicBloodPressureMmhg.isPresent();
        boolean hasDbp = item.diastolicBloodPressureMmhg != null && item.diastolicBloodPressureMmhg.isPresent();
        return hasSbp && hasDbp ? "Included" : "-";
    }

    private Float qualityProgress(Float value) {
        if (value == null || value.isNaN() || value.isInfinite()) {
            return null;
        }
        float normalized = value <= 1f ? value : value / 100f;
        return Math.max(0f, Math.min(1f, normalized));
    }

    private Button iconTextButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextColor(Color.BLACK);
        button.setBackgroundColor(Color.TRANSPARENT);
        return button;
    }

    private Button filledButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextColor(Color.WHITE);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        GradientDrawable background = new GradientDrawable();
        background.setColor(Color.BLACK);
        background.setCornerRadius(dp(8));
        button.setBackground(background);
        return button;
    }

    private Button outlineButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextColor(Color.BLACK);
        GradientDrawable background = new GradientDrawable();
        background.setColor(Color.WHITE);
        background.setStroke(dp(1), Color.BLACK);
        background.setCornerRadius(dp(8));
        button.setBackground(background);
        return button;
    }

    private LinearLayout.LayoutParams buttonParams() {
        return new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(44));
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private enum AppScreen {
        MEASURE,
        RESULTS,
        RISK_FORM
    }

    private static final class DisplayValue {
        final String title;
        final String value;
        final String unit;

        DisplayValue(String title, String value, String unit) {
            this.title = title;
            this.value = value;
            this.unit = unit;
        }
    }

    private static final class QualityValue {
        final String label;
        final String value;
        final Float progress;

        QualityValue(String label, String value, Float progress) {
            this.label = label;
            this.value = value;
            this.progress = progress;
        }
    }

    private static final class NumberInput {
        final EditText field;

        NumberInput(EditText field) {
            this.field = field;
        }

        float floatValue(float fallback) {
            try {
                return Float.parseFloat(field.getText().toString());
            } catch (NumberFormatException ex) {
                return fallback;
            }
        }
    }

    private static final class RiskProfile {
        int age;
        float heightCm;
        float weightKg;
        float waistCm;
        float cholesterol;
        float hdl;
        float sbp;
        float dbp;
        boolean isSmoker;
        ShenAIAndroidSDK.HypertensionTreatment hypertensionTreatment;
        boolean hasDiabetes;
        ShenAIAndroidSDK.Gender gender;
        float neckCm;
        float hipCm;
        ShenAIAndroidSDK.PhysicalActivity physicalActivity;
        String country;
        ShenAIAndroidSDK.Race race;
        boolean vegetableFruitDiet;
        boolean historyOfHighGlucose;
        boolean historyOfHypertension;
        float triglyceride;
        float fastingGlucose;
        ShenAIAndroidSDK.FamilyHistory familyDiabetes;
        ShenAIAndroidSDK.ParentalHistory parentalHypertension;

        static RiskProfile defaults() {
            RiskProfile profile = new RiskProfile();
            profile.age = 45;
            profile.heightCm = 172f;
            profile.weightKg = 74f;
            profile.waistCm = 84f;
            profile.cholesterol = 190f;
            profile.hdl = 52f;
            profile.sbp = 128f;
            profile.dbp = 82f;
            profile.isSmoker = false;
            profile.hypertensionTreatment = ShenAIAndroidSDK.HypertensionTreatment.NO;
            profile.hasDiabetes = false;
            profile.gender = ShenAIAndroidSDK.Gender.FEMALE;
            profile.neckCm = 38f;
            profile.hipCm = 98f;
            profile.physicalActivity = ShenAIAndroidSDK.PhysicalActivity.MODERATELY;
            profile.country = "US";
            profile.race = ShenAIAndroidSDK.Race.WHITE;
            profile.vegetableFruitDiet = true;
            profile.historyOfHighGlucose = false;
            profile.historyOfHypertension = false;
            profile.triglyceride = 120f;
            profile.fastingGlucose = 92f;
            profile.familyDiabetes = ShenAIAndroidSDK.FamilyHistory.NONE_FIRST_DEGREE;
            profile.parentalHypertension = ShenAIAndroidSDK.ParentalHistory.NONE;
            return profile;
        }

        ShenAIAndroidSDK.RisksFactors toRisksFactors(
                ShenAIAndroidSDK sdk,
                ShenAIAndroidSDK.MeasurementResults results) {
            ShenAIAndroidSDK.RisksFactors factors = sdk.new RisksFactors();
            factors.age = Optional.of(age);
            factors.cholesterol = Optional.of(cholesterol);
            factors.cholesterolHdl = Optional.of(hdl);
            factors.sbp = results != null && results.systolicBloodPressureMmhg != null
                    && results.systolicBloodPressureMmhg.isPresent()
                    ? results.systolicBloodPressureMmhg
                    : Optional.of(sbp);
            factors.dbp = results != null && results.diastolicBloodPressureMmhg != null
                    && results.diastolicBloodPressureMmhg.isPresent()
                    ? results.diastolicBloodPressureMmhg
                    : Optional.of(dbp);
            factors.isSmoker = Optional.of(isSmoker);
            factors.hypertensionTreatment = Optional.of(hypertensionTreatment);
            factors.hasDiabetes = Optional.of(hasDiabetes);
            factors.bodyHeight = Optional.of(heightCm);
            factors.bodyWeight = Optional.of(weightKg);
            factors.waistCircumference = Optional.of(waistCm);
            factors.neckCircumference = Optional.of(neckCm);
            factors.hipCircumference = Optional.of(hipCm);
            factors.gender = Optional.of(gender);
            factors.physicalActivity = Optional.of(physicalActivity);
            factors.country = country;
            factors.race = Optional.of(race);
            factors.vegetableFruitDiet = Optional.of(vegetableFruitDiet);
            factors.historyOfHighGlucose = Optional.of(historyOfHighGlucose);
            factors.historyOfHypertension = Optional.of(historyOfHypertension);
            factors.triglyceride = Optional.of(triglyceride);
            factors.fastingGlucose = Optional.of(fastingGlucose);
            factors.familyDiabetes = Optional.of(familyDiabetes);
            factors.parentalHypertension = Optional.of(parentalHypertension);
            return factors;
        }
    }

    private static final class CircleFrameLayout extends FrameLayout {
        CircleFrameLayout(android.content.Context context) {
            super(context);
            setClipToOutline(true);
            setOutlineProvider(new ViewOutlineProvider() {
                @Override
                public void getOutline(View view, Outline outline) {
                    outline.setOval(0, 0, view.getWidth(), view.getHeight());
                }
            });
        }
    }
}
