package ai.mxlabs.sdk_android_flow_example;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;
import ai.mxlabs.shenai_sdk.ShenAIView;

public class MainActivity extends ComponentActivity {
    private static final String API_KEY = BuildConfig.SHENAI_API_KEY;
    private static final String USER_ID = "";

    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();

    private FlowConfig pendingFlow;
    private FlowConfig activeFlow;
    private boolean finishedFlow;
    private boolean showingSdkView;
    private boolean showingPdfActions;
    private boolean pdfBusy;
    private TextView statusText;
    private TextView pdfStatusText;
    private List<Button> pdfButtons;

    private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new RequestPermission(),
            isGranted -> {
                if (isGranted && pendingFlow != null) {
                    startFlow(pendingFlow);
                } else {
                    Toast.makeText(this, "Camera permission is required for this demo.", Toast.LENGTH_LONG).show();
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        showHome();
        if (API_KEY.isEmpty()) {
            showMissingApiKey();
        }
    }

    private void showHome() {
        activeFlow = null;
        showingSdkView = false;
        showingPdfActions = false;
        finishedFlow = false;

        LinearLayout stack = new LinearLayout(this);
        stack.setOrientation(LinearLayout.VERTICAL);
        stack.setGravity(Gravity.CENTER);
        stack.setPadding(dp(24), dp(24), dp(24), dp(24));

        TextView title = new TextView(this);
        title.setText("Shen.AI Flow");
        title.setTextSize(22);
        title.setGravity(Gravity.CENTER);
        stack.addView(title, matchWrap());

        statusText = new TextView(this);
        statusText.setGravity(Gravity.CENTER);
        statusText.setVisibility(View.GONE);
        LinearLayout.LayoutParams statusParams = matchWrap();
        statusParams.setMargins(0, dp(20), 0, 0);
        stack.addView(statusText, statusParams);

        Button dashboardButton = outlineButton("Dashboard");
        dashboardButton.setOnClickListener(view -> openFlow(FlowConfig.dashboard()));
        LinearLayout.LayoutParams dashboardParams = buttonParams();
        dashboardParams.setMargins(0, dp(32), 0, 0);
        stack.addView(dashboardButton, dashboardParams);

        Button measurementButton = outlineButton("Measurement");
        measurementButton.setOnClickListener(view -> openFlow(FlowConfig.measurement()));
        LinearLayout.LayoutParams measurementParams = buttonParams();
        measurementParams.setMargins(0, dp(12), 0, 0);
        stack.addView(measurementButton, measurementParams);

        setContentView(stack);
    }

    private void openFlow(FlowConfig flow) {
        if (API_KEY.isEmpty()) {
            showMissingApiKey();
            return;
        }
        pendingFlow = flow;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startFlow(flow);
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void startFlow(FlowConfig flow) {
        if (API_KEY.isEmpty()) {
            showMissingApiKey();
            return;
        }
        pendingFlow = null;
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.deinitialize();
        }

        ShenAIAndroidSDK.InitializationSettings settings = uiFlowSettings(flow.screens, flow.dashboardOnly);
        settings.eventCallback = event -> runOnUiThread(() -> handleSdkEvent(event));

        ShenAIAndroidSDK.InitializationResult result =
                shenaiSDKHandler.initialize(this, API_KEY, USER_ID, settings);
        if (result != ShenAIAndroidSDK.InitializationResult.OK) {
            showInitializationFailure(result);
            return;
        }

        activeFlow = flow;
        finishedFlow = false;
        if (flow.disableMeasurementsDashboard) {
            shenaiSDKHandler.setEnableMeasurementsDashboard(false);
        }

        if (flow.resetMeasurement) {
            shenaiSDKHandler.resetMeasurementSession();
        }
        if (flow.initialScreen != null) {
            shenaiSDKHandler.setScreen(flow.initialScreen);
        }

        showingSdkView = true;
        showingPdfActions = false;
        setContentView(new ShenAIView(this));
    }

    private void showInitializationFailure(ShenAIAndroidSDK.InitializationResult result) {
        if (statusText == null) {
            showHome();
        }
        statusText.setText("Initialization failed: " + result);
        statusText.setVisibility(View.VISIBLE);
    }

    private void showMissingApiKey() {
        if (statusText == null) {
            showHome();
        }
        statusText.setText("Missing SHENAI_API_KEY. Run with -PshenaiApiKey=<your-api-key>.");
        statusText.setVisibility(View.VISIBLE);
        Toast.makeText(this, "Missing SHENAI_API_KEY", Toast.LENGTH_LONG).show();
    }

    private void handleSdkEvent(ShenAIAndroidSDK.Event event) {
        System.out.println("Shen.AI event: " + event);
        if (event == ShenAIAndroidSDK.Event.USER_FLOW_FINISHED) {
            handleUserFlowFinished();
        }
    }

    private void handleUserFlowFinished() {
        if (finishedFlow || activeFlow == null) {
            return;
        }
        if (activeFlow.showPdfActionsAfterFinish && shenaiSDKHandler.getMeasurementResults() != null) {
            showPdfActionsPage();
            return;
        }
        finishFlow();
    }

    private void showPdfActionsPage() {
        showingSdkView = false;
        showingPdfActions = true;
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF);
        }

        ScrollView scrollView = new ScrollView(this);
        LinearLayout stack = new LinearLayout(this);
        stack.setOrientation(LinearLayout.VERTICAL);
        stack.setGravity(Gravity.CENTER);
        stack.setPadding(dp(24), dp(24), dp(24), dp(24));
        scrollView.addView(stack);

        TextView title = new TextView(this);
        title.setText("Measurement PDF");
        title.setTextSize(22);
        title.setGravity(Gravity.CENTER);
        stack.addView(title, matchWrap());

        pdfStatusText = new TextView(this);
        pdfStatusText.setText("Measurement finished. Open the PDF report.");
        pdfStatusText.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams statusParams = matchWrap();
        statusParams.setMargins(0, dp(16), 0, 0);
        stack.addView(pdfStatusText, statusParams);

        Button openButton = outlineButton("Open PDF");
        openButton.setOnClickListener(view -> runPdfAction(() -> {
            shenaiSDKHandler.openMeasurementResultsPdfInBrowser();
            setPdfStatus("PDF open request sent.");
            completePdfAction();
        }));

        Button finishButton = filledButton("Finish");
        finishButton.setOnClickListener(view -> finishFlow());

        pdfButtons = Arrays.asList(openButton, finishButton);
        addButtonWithTopMargin(stack, openButton, 24);
        addButtonWithTopMargin(stack, finishButton, 24);

        setContentView(scrollView);
    }

    private void runPdfAction(Runnable action) {
        if (pdfBusy) {
            return;
        }
        pdfBusy = true;
        setPdfButtonsEnabled(false);
        setPdfStatus("Working on PDF...");
        action.run();
    }

    private void completePdfAction() {
        pdfBusy = false;
        setPdfButtonsEnabled(true);
    }

    private void setPdfStatus(String status) {
        if (pdfStatusText != null) {
            pdfStatusText.setText(status);
        }
    }

    private void setPdfButtonsEnabled(boolean enabled) {
        if (pdfButtons == null) {
            return;
        }
        for (Button button : pdfButtons) {
            button.setEnabled(enabled);
        }
    }

    private void finishFlow() {
        if (finishedFlow) {
            return;
        }
        finishedFlow = true;
        showingSdkView = false;
        showingPdfActions = false;
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.deinitialize();
        }
        showHome();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (showingSdkView && shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.OFF);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (showingSdkView && !showingPdfActions && shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.setCameraMode(ShenAIAndroidSDK.CameraMode.FACING_USER);
        }
    }

    @Override
    protected void onDestroy() {
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.deinitialize();
        }
        super.onDestroy();
    }

    private ShenAIAndroidSDK.InitializationSettings uiFlowSettings(
            List<ShenAIAndroidSDK.Screen> screens,
            boolean dashboardOnly) {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        settings.precisionMode = ShenAIAndroidSDK.PrecisionMode.RELAXED;
        settings.operatingMode = ShenAIAndroidSDK.OperatingMode.MEASURE;
        settings.measurementPreset = ShenAIAndroidSDK.MeasurementPreset.THIRTY_SECONDS_ALL_METRICS;
        settings.cameraMode = ShenAIAndroidSDK.CameraMode.FACING_USER;
        settings.onboardingMode = ShenAIAndroidSDK.OnboardingMode.HIDDEN;
        settings.showUserInterface = true;
        settings.showFacePositioningOverlay = true;
        settings.showVisualWarnings = true;
        settings.enableCameraSwap = true;
        settings.showFaceMask = true;
        settings.showBloodFlow = true;
        settings.enableStartAfterSuccess = false;
        settings.enableSummaryScreen = !dashboardOnly;
        settings.showResultsFinishButton = !dashboardOnly;
        settings.enableHealthRisks = true;
        settings.showHealthIndicesFinishButton = !dashboardOnly;
        settings.saveHealthRisksFactors = true;
        settings.showOutOfRangeResultIndicators = true;
        settings.applyPrecisionModeToBloodPressure = false;
        settings.showSignalQualityIndicator = true;
        settings.showSignalTile = true;
        settings.showStartStopButton = !dashboardOnly;
        settings.showInfoButton = !dashboardOnly;
        settings.showDisclaimer = !dashboardOnly;
        settings.uiVersion = ShenAIAndroidSDK.UiVersion.V2;
        settings.risksFactors = exampleRiskFactors();
        settings.uiFlowScreens.clear();
        settings.uiFlowScreens.addAll(screens);
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

    private static final class FlowConfig {
        final ShenAIAndroidSDK.Screen initialScreen;
        final List<ShenAIAndroidSDK.Screen> screens;
        final boolean dashboardOnly;
        final boolean resetMeasurement;
        final boolean showPdfActionsAfterFinish;
        final boolean disableMeasurementsDashboard;

        FlowConfig(
                ShenAIAndroidSDK.Screen initialScreen,
                List<ShenAIAndroidSDK.Screen> screens,
                boolean dashboardOnly,
                boolean resetMeasurement,
                boolean showPdfActionsAfterFinish,
                boolean disableMeasurementsDashboard) {
            this.initialScreen = initialScreen;
            this.screens = screens;
            this.dashboardOnly = dashboardOnly;
            this.resetMeasurement = resetMeasurement;
            this.showPdfActionsAfterFinish = showPdfActionsAfterFinish;
            this.disableMeasurementsDashboard = disableMeasurementsDashboard;
        }

        static FlowConfig dashboard() {
            return new FlowConfig(
                    null,
                    Arrays.asList(ShenAIAndroidSDK.Screen.DASHBOARD),
                    true,
                    false,
                    false,
                    false);
        }

        static FlowConfig measurement() {
            return new FlowConfig(
                    ShenAIAndroidSDK.Screen.MEASUREMENT,
                    Arrays.asList(
                            ShenAIAndroidSDK.Screen.MEASUREMENT,
                            ShenAIAndroidSDK.Screen.RESULTS,
                            ShenAIAndroidSDK.Screen.HEALTH_RISKS),
                    false,
                    true,
                    true,
                    true);
        }
    }

    private void addButtonWithTopMargin(LinearLayout stack, Button button, int topMarginDp) {
        LinearLayout.LayoutParams params = buttonParams();
        params.setMargins(0, dp(topMarginDp), 0, 0);
        stack.addView(button, params);
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

    private LinearLayout.LayoutParams buttonParams() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(54));
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
