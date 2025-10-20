package ai.mxlabs.sdk_android_full_example;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.activity.ComponentActivity;

public class MainActivity extends ComponentActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button fullFlowButton = findViewById(R.id.button_full_flow);
        Button noUiButton = findViewById(R.id.button_no_ui);
        Button calibrationButton = findViewById(R.id.button_calibration);
        Button healthIndicesButton = findViewById(R.id.button_health_indices);
        Button historyButton = findViewById(R.id.button_history);

        fullFlowButton.setOnClickListener(
                view -> startActivity(new Intent(this, FullFlowActivity.class)));
        noUiButton.setOnClickListener(
                view -> startActivity(new Intent(this, NoUiActivity.class)));
        calibrationButton.setOnClickListener(
                view -> startActivity(new Intent(this, CalibrationActivity.class)));
        healthIndicesButton.setOnClickListener(
                view -> startActivity(new Intent(this, HealthIndicesActivity.class)));
        historyButton.setOnClickListener(
                view -> startActivity(new Intent(this, HistoryActivity.class)));
    }
}
