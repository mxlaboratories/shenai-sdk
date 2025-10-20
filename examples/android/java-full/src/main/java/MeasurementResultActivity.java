package ai.mxlabs.sdk_android_full_example;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.ComponentActivity;

public class MeasurementResultActivity extends ComponentActivity {
    static final String EXTRA_MEASUREMENT_JSON = "extra_measurement_json";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setTitle(R.string.measurement_result_title);
        setContentView(R.layout.activity_measurement_result);

        TextView jsonView = findViewById(R.id.measurement_result_json);
        Button backButton = findViewById(R.id.button_back_to_main);

        String json = getIntent().getStringExtra(EXTRA_MEASUREMENT_JSON);
        if (TextUtils.isEmpty(json)) {
            jsonView.setText(R.string.measurement_result_missing);
        } else {
            jsonView.setText(json);
        }

        backButton.setOnClickListener(view -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            startActivity(intent);
            finish();
        });
    }
}
