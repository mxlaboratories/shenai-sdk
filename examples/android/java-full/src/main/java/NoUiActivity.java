package ai.mxlabs.sdk_android_full_example;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;

import java.util.Locale;

import org.json.JSONException;
import org.json.JSONObject;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;
import ai.mxlabs.shenai_sdk.ShenAIView;

/**
 * Demonstrates using the SDK without the embedded UI. Camera preview is shown, while the
 * measurement is controlled via custom buttons.
 */
public class NoUiActivity extends ComponentActivity {
    private static final int POLLING_INTERVAL_MS = 500;

    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();
    private final Handler handler = new Handler(Looper.getMainLooper());

    private FrameLayout previewContainer;
    private TextView statusText;
    private TextView heartRateText;
    private TextView progressText;
    private TextView signalQualityText;
    private Button startButton;
    private Button stopButton;
    private boolean hasShownMeasurementResult = false;

    private final Runnable uiUpdateTask = new Runnable() {
        @Override
        public void run() {
            updateMetrics();
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
                    finish();
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_no_ui);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        previewContainer = findViewById(R.id.preview_container);
        statusText = findViewById(R.id.status_text);
        heartRateText = findViewById(R.id.heart_rate_text);
        progressText = findViewById(R.id.progress_text);
        signalQualityText = findViewById(R.id.signal_quality_text);
        startButton = findViewById(R.id.button_start);
        stopButton = findViewById(R.id.button_stop);

        stopButton.setEnabled(false);

        startButton.setOnClickListener(view -> startMeasurement());
        stopButton.setOnClickListener(view -> stopMeasurement());

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == android.content.pm.PackageManager.PERMISSION_GRANTED) {
            initializeSdk();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void initializeSdk() {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        // Running the SDK without embedded UI: https://developer.shen.ai/getting-started/choosing-mode
        settings.showUserInterface = false;
        settings.showStartStopButton = false;
        settings.enableSummaryScreen = false;
        settings.onboardingMode = ShenAIAndroidSDK.OnboardingMode.HIDDEN;
        settings.eventCallback = event -> {
            if (event == ShenAIAndroidSDK.Event.MEASUREMENT_FINISHED) {
                final ShenAIAndroidSDK.MeasurementResults results = shenaiSDKHandler.getMeasurementResults();
                final String measurementId = shenaiSDKHandler.getMeasurementID();
                final String traceId = shenaiSDKHandler.getTraceID();
                final String payload = serializeMeasurementResults(results, measurementId, traceId);
                runOnUiThread(() -> {
                    if (hasShownMeasurementResult) {
                        stopMeasurement();
                        return;
                    }
                    hasShownMeasurementResult = true;
                    stopMeasurement();
                    Intent intent = new Intent(this, MeasurementResultActivity.class);
                    if (payload != null) {
                        intent.putExtra(MeasurementResultActivity.EXTRA_MEASUREMENT_JSON, payload);
                    }
                    startActivity(intent);
                });
            } else if (event == ShenAIAndroidSDK.Event.USER_FLOW_FINISHED) {
                runOnUiThread(this::stopMeasurement);
            }
        };

        ShenAIAndroidSDK.InitializationResult result =
                shenaiSDKHandler.initialize(this, ExampleConfig.API_KEY, ExampleConfig.USER_ID, settings);
        if (result != ShenAIAndroidSDK.InitializationResult.OK) {
            Toast.makeText(this, "Initialization failed: " + result, Toast.LENGTH_LONG).show();
            return;
        }

        if (previewContainer.getChildCount() == 0) {
            ShenAIView shenaiView = new ShenAIView(this);
            previewContainer.addView(shenaiView);
        }

        statusText.setText(getString(R.string.status_ready));
        handler.post(uiUpdateTask);
    }

    private void startMeasurement() {
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.setOperatingMode(ShenAIAndroidSDK.OperatingMode.MEASURE);
        }
        hasShownMeasurementResult = false;
        startButton.setEnabled(false);
        stopButton.setEnabled(true);
        statusText.setText(getString(R.string.status_measuring));
    }

    private void stopMeasurement() {
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.setOperatingMode(ShenAIAndroidSDK.OperatingMode.POSITIONING);
        }
        startButton.setEnabled(true);
        stopButton.setEnabled(false);
        statusText.setText(getString(R.string.status_ready));
    }

    private void updateMetrics() {
        if (!shenaiSDKHandler.isInitialized()) {
            return;
        }
        ShenAIAndroidSDK.MeasurementResults results = shenaiSDKHandler.getMeasurementResults();
        if (results != null) {
            heartRateText.setText(String.format(Locale.getDefault(), "Heart rate: %.0f", results.hrBpm));
            if (results.hrvSdnnMs.isPresent()) {
                progressText.setText(String.format(Locale.getDefault(), "SDNN: %.0f ms", results.hrvSdnnMs.get()));
            } else {
                progressText.setText(R.string.progress_placeholder);
            }
        } else {
            heartRateText.setText(String.format(Locale.getDefault(), "Heart rate: %d",
                    shenaiSDKHandler.getHeartRate10s()));
            progressText.setText(String.format(Locale.getDefault(), "Progress: %.0f%%",
                    shenaiSDKHandler.getMeasurementProgressPercentage()));
        }
        signalQualityText.setText(String.format(Locale.getDefault(), "Signal quality: %.2f",
                shenaiSDKHandler.getCurrentSignalQualityMetric()));

        ShenAIAndroidSDK.MeasurementState state = shenaiSDKHandler.getMeasurementState();
        if (state != null) {
            statusText.setText(String.format(Locale.getDefault(), "Status: %s", state.name()));
        }
    }

    private String serializeMeasurementResults(ShenAIAndroidSDK.MeasurementResults results,
                                               String measurementId,
                                               String traceId) {
        if (results == null) {
            return null;
        }
        try {
            JSONObject json = new JSONObject();
            if (measurementId != null && !measurementId.isEmpty()) {
                json.put("measurementId", measurementId);
            }
            if (traceId != null && !traceId.isEmpty()) {
                json.put("traceId", traceId);
            }
            json.put("hrBpm", results.hrBpm);
            json.put("averageSignalQuality", results.averageSignalQuality);

            if (results.hrvSdnnMs != null && results.hrvSdnnMs.isPresent()) {
                json.put("hrvSdnnMs", results.hrvSdnnMs.get());
            }
            if (results.hrvLnrmssdMs != null && results.hrvLnrmssdMs.isPresent()) {
                json.put("hrvLnrmssdMs", results.hrvLnrmssdMs.get());
            }
            if (results.brBpm != null && results.brBpm.isPresent()) {
                json.put("breathingRateBpm", results.brBpm.get());
            }
            if (results.stressIndex != null && results.stressIndex.isPresent()) {
                json.put("stressIndex", results.stressIndex.get());
            }
            if (results.parasympatheticActivity != null && results.parasympatheticActivity.isPresent()) {
                json.put("parasympatheticActivity", results.parasympatheticActivity.get());
            }
            if (results.systolicBloodPressureMmhg != null && results.systolicBloodPressureMmhg.isPresent()) {
                json.put("systolicBloodPressureMmhg", results.systolicBloodPressureMmhg.get());
            }
            if (results.diastolicBloodPressureMmhg != null && results.diastolicBloodPressureMmhg.isPresent()) {
                json.put("diastolicBloodPressureMmhg", results.diastolicBloodPressureMmhg.get());
            }
            if (results.cardiacWorkloadMmhgPerSec != null && results.cardiacWorkloadMmhgPerSec.isPresent()) {
                json.put("cardiacWorkloadMmhgPerSec", results.cardiacWorkloadMmhgPerSec.get());
            }
            if (results.bmiKgPerM2 != null && results.bmiKgPerM2.isPresent()) {
                json.put("bmiKgPerM2", results.bmiKgPerM2.get());
            }
            if (results.bmiCategory != null && results.bmiCategory.isPresent()) {
                json.put("bmiCategory", results.bmiCategory.get().name());
            }
            if (results.weightKg != null && results.weightKg.isPresent()) {
                json.put("weightKg", results.weightKg.get());
            }
            if (results.heightCm != null && results.heightCm.isPresent()) {
                json.put("heightCm", results.heightCm.get());
            }

            return json.toString(2);
        } catch (JSONException jsonException) {
            return results.toString();
        }
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(uiUpdateTask);
        shenaiSDKHandler.deinitialize();
        super.onDestroy();
    }
}
