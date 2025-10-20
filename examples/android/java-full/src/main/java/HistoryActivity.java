package ai.mxlabs.sdk_android_full_example;

import android.Manifest;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;

/**
 * Shows how to fetch measurement history from the SDK.
 */
public class HistoryActivity extends ComponentActivity {

    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();

    private TextView historyText;
    private Button refreshButton;
    private Button backButton;

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
        setContentView(R.layout.activity_history);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        historyText = findViewById(R.id.history_text);
        refreshButton = findViewById(R.id.button_show_history);
        refreshButton.setOnClickListener(view -> updateHistoryText());
        backButton = findViewById(R.id.button_back_to_main_from_history);
        backButton.setOnClickListener(view -> finish());

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == android.content.pm.PackageManager.PERMISSION_GRANTED) {
            initializeSdk();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void initializeSdk() {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        settings.enableMeasurementsDashboard = true;
        settings.showUserInterface = false;
        settings.cameraMode = ShenAIAndroidSDK.CameraMode.OFF;
        settings.eventCallback = event -> System.out.println("History flow event: " + event);

        ShenAIAndroidSDK.InitializationResult result =
                shenaiSDKHandler.initialize(this, ExampleConfig.API_KEY, ExampleConfig.USER_ID, settings);
        if (result != ShenAIAndroidSDK.InitializationResult.OK) {
            Toast.makeText(this, "Initialization failed: " + result, Toast.LENGTH_LONG).show();
            return;
        }
    }

    private void updateHistoryText() {
        // Local history retrieval API: https://developer.shen.ai/video-measurement/local-memory
        ShenAIAndroidSDK.MeasurementResultsHistory history = shenaiSDKHandler.getMeasurementResultsHistory();
        if (history == null || history.history == null || history.history.length == 0) {
            historyText.setText(R.string.history_empty);
            return;
        }

        DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
        StringBuilder builder = new StringBuilder();
        for (ShenAIAndroidSDK.MeasurementResultsWithMetadata entry : history.history) {
            ShenAIAndroidSDK.MeasurementResults result = entry.measurementResults;
            Date date = new Date(entry.epochTimestamp * 1000L);
            builder.append(dateFormat.format(date))
                    .append(" - HR: ")
                    .append(Math.round(result.hrBpm))
                    .append("bpm");
            if (result.hrvSdnnMs != null && result.hrvSdnnMs.isPresent()) {
                builder.append(", HRV: ").append(Math.round(result.hrvSdnnMs.get())).append("ms");
            }
            if (entry.isCalibration) {
                builder.append(" (calibration)");
            }
            builder.append('\n');
        }
        historyText.setText(builder.toString());
    }

    @Override
    protected void onDestroy() {
        shenaiSDKHandler.deinitialize();
        super.onDestroy();
    }
}
