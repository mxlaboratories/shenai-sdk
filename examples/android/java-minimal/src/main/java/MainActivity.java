package ai.mxlabs.sdk_android_minimal_example;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
import android.Manifest;
import android.content.pm.PackageManager;

import androidx.activity.ComponentActivity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts.RequestPermission;
import androidx.core.content.ContextCompat;
import android.view.WindowManager;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;
import ai.mxlabs.shenai_sdk.ShenAIView;

public class MainActivity extends ComponentActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            initializeShenAI();
            ShenAIView shenaiView = new ShenAIView(this);
            setContentView(shenaiView);
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }

    }

    private ActivityResultLauncher<String> requestPermissionLauncher = registerForActivityResult(
            new RequestPermission(), isGranted -> {
                if (isGranted) {
                    initializeShenAI();
                    ShenAIView shenaiView = new ShenAIView(this);
                    setContentView(shenaiView);
                }
            });

    private void initializeShenAI() {
        shenaiSDKHandler.initialize(this, "YOUR_API_KEY", "",
                shenaiSDKHandler.getDefaultInitializationSettings());
    }

    private ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();
}