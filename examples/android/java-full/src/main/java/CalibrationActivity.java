package ai.mxlabs.sdk_android_full_example;

import android.Manifest;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.WindowManager;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;
import ai.mxlabs.shenai_sdk.ShenAIView;

/**
 * Demonstrates the dedicated calibration flow.
 */
public class CalibrationActivity extends ComponentActivity {
    private static final int POLLING_INTERVAL_MS = 1000;

    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable resultsTask = new Runnable() {
        @Override
        public void run() {
            ShenAIAndroidSDK.MeasurementResults results = shenaiSDKHandler.getMeasurementResults();
            if (results != null) {
                System.out.println("Calibration result: HR " + results.hrBpm + ", SDNN " + results.hrvSdnnMs);
            }
            handler.postDelayed(this, POLLING_INTERVAL_MS);
        }
    };
    private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new RequestPermission(),
            isGranted -> {
                if (isGranted) {
                    startCalibrationFlow();
                } else {
                    Toast.makeText(this, "Camera permission is required for this demo.", Toast.LENGTH_LONG).show();
                    finish();
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == android.content.pm.PackageManager.PERMISSION_GRANTED) {
            startCalibrationFlow();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void startCalibrationFlow() {
        ShenAIAndroidSDK.InitializationResult result = initializeShenAI();
        if (result != ShenAIAndroidSDK.InitializationResult.OK) {
            Toast.makeText(this, "Initialization failed: " + result, Toast.LENGTH_LONG).show();
            return;
        }
        ShenAIView shenaiView = new ShenAIView(this);
        setContentView(shenaiView);
        handler.postDelayed(resultsTask, POLLING_INTERVAL_MS);
    }

    private ShenAIAndroidSDK.InitializationResult initializeShenAI() {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        // Calibration workflow guide: https://developer.shen.ai/video-measurement/calibration
        settings.initializationMode = ShenAIAndroidSDK.InitializationMode.CALIBRATION;
        settings.enableHealthRisks = true;
        settings.eventCallback = event -> {
            System.out.println("Calibration event: " + event);
            if (event == ShenAIAndroidSDK.Event.USER_FLOW_FINISHED) {
                runOnUiThread(this::finish);
            }
        };
        return shenaiSDKHandler.initialize(this, ExampleConfig.API_KEY, ExampleConfig.USER_ID, settings);
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(resultsTask);
        shenaiSDKHandler.deinitialize();
        super.onDestroy();
    }
}
