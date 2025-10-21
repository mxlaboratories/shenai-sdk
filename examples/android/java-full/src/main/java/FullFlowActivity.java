package ai.mxlabs.sdk_android_full_example;

import android.Manifest;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Toast;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;
import ai.mxlabs.shenai_sdk.ShenAIView;

/**
 * Demonstrates the full Shen.AI embedded UI flow.
 */
public class FullFlowActivity extends ComponentActivity {
    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();

    private final ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new RequestPermission(),
            isGranted -> {
                if (isGranted) {
                    startSdkFlow();
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
            startSdkFlow();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void startSdkFlow() {
        ShenAIAndroidSDK.InitializationResult result = initializeShenAI();
        if (result != ShenAIAndroidSDK.InitializationResult.OK) {
            Toast.makeText(this, "Initialization failed: " + result, Toast.LENGTH_LONG).show();
            return;
        }
        ShenAIView shenaiView = new ShenAIView(this);
        setContentView(shenaiView);
    }

    private ShenAIAndroidSDK.InitializationResult initializeShenAI() {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        // Initialization options reference: https://developer.shen.ai/getting-started/initialization#initialization-settings
        settings.eventCallback = event -> {
            System.out.println("Shen.AI event: " + event);
            if (event == ShenAIAndroidSDK.Event.USER_FLOW_FINISHED) {
                runOnUiThread(this::finish);
            }
        };
        return shenaiSDKHandler.initialize(this, ExampleConfig.API_KEY, ExampleConfig.USER_ID, settings);
    }

    @Override
    protected void onDestroy() {
        shenaiSDKHandler.deinitialize();
        super.onDestroy();
    }
}
