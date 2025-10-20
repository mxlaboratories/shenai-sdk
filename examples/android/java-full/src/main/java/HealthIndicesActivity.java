package ai.mxlabs.sdk_android_full_example;

import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.ComponentActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.util.Optional;

import ai.mxlabs.shenai_sdk.ShenAIAndroidSDK;

/**
 * Demonstrates computing health indices without running a camera scan.
 */
public class HealthIndicesActivity extends ComponentActivity {

    private final ShenAIAndroidSDK shenaiSDKHandler = new ShenAIAndroidSDK();
    private boolean initializationSuccessful;

    private EditText ageField;
    private EditText heightField;
    private EditText weightField;
    private EditText sbpField;
    private EditText dbpField;
    private TextView resultText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_health_indices);

        ageField = findViewById(R.id.input_age);
        heightField = findViewById(R.id.input_height);
        weightField = findViewById(R.id.input_weight);
        sbpField = findViewById(R.id.input_sbp);
        dbpField = findViewById(R.id.input_dbp);
        resultText = findViewById(R.id.result_text);
        resultText.setTextIsSelectable(true);

        Button computeButton = findViewById(R.id.button_compute_indices);
        computeButton.setOnClickListener(view -> computeHealthIndices());

        // Health indices integration overview: https://developer.shen.ai/health-indices/integration
        ShenAIAndroidSDK.InitializationResult initResult = initializeShenAI();
        initializationSuccessful = initResult == ShenAIAndroidSDK.InitializationResult.OK;
        if (!initializationSuccessful) {
            Toast.makeText(this, "Initialization failed: " + initResult, Toast.LENGTH_LONG).show();
            computeButton.setEnabled(false);
        }
    }

    private void computeHealthIndices() {
        if (!initializationSuccessful || !shenaiSDKHandler.isInitialized()) {
            resultText.setText("SDK not initialized.");
            return;
        }

        ShenAIAndroidSDK.RisksFactors factors = shenaiSDKHandler.new RisksFactors();
        factors.country = "US";
        factors.age = parseIntegerOptional(ageField);
        factors.bodyHeight = parseFloatOptional(heightField);
        factors.bodyWeight = parseFloatOptional(weightField);
        factors.sbp = parseFloatOptional(sbpField);
        factors.dbp = parseFloatOptional(dbpField);
        factors.cholesterol = Optional.of(190f);
        factors.cholesterolHdl = Optional.of(55f);
        factors.isSmoker = Optional.of(Boolean.FALSE);
        factors.hypertensionTreatment = Optional.of(ShenAIAndroidSDK.HypertensionTreatment.NO);
        factors.hasDiabetes = Optional.of(Boolean.TRUE);
        factors.waistCircumference = Optional.of(92f);
        factors.gender = Optional.of(ShenAIAndroidSDK.Gender.MALE);
        factors.race = Optional.of(ShenAIAndroidSDK.Race.WHITE);
        factors.physicalActivity = Optional.of(ShenAIAndroidSDK.PhysicalActivity.MODERATELY);
        factors.vegetableFruitDiet = Optional.of(Boolean.TRUE);
        factors.historyOfHypertension = Optional.of(Boolean.FALSE);
        factors.historyOfHighGlucose = Optional.of(Boolean.TRUE);
        factors.fastingGlucose = Optional.of(95f);
        factors.triglyceride = Optional.of(160f);
        factors.parentalHypertension = Optional.of(ShenAIAndroidSDK.ParentalHistory.ONE);
        factors.familyDiabetes = Optional.of(ShenAIAndroidSDK.FamilyHistory.NONE_FIRST_DEGREE);

        ShenAIAndroidSDK.HealthRisks healthRisks = shenaiSDKHandler.computeHealthRisks(factors);
        if (healthRisks == null) {
            resultText.setText("Unable to compute results with the provided data.");
            return;
        }

        // Pretty-print the full set of returned indices for easier inspection.
        resultText.setText(serializeHealthRisks(healthRisks));
    }

    private Optional<Integer> parseIntegerOptional(EditText editText) {
        String value = editText.getText().toString().trim();
        if (TextUtils.isEmpty(value)) {
            return Optional.empty();
        }
        try {
            return Optional.of(Integer.parseInt(value));
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private Optional<Float> parseFloatOptional(EditText editText) {
        String value = editText.getText().toString().trim();
        if (TextUtils.isEmpty(value)) {
            return Optional.empty();
        }
        try {
            return Optional.of(Float.parseFloat(value));
        } catch (NumberFormatException ex) {
            return Optional.empty();
        }
    }

    private String serializeHealthRisks(ShenAIAndroidSDK.HealthRisks healthRisks) {
        try {
            Object jsonCompatible = convertToJsonCompatible(healthRisks);
            if (jsonCompatible instanceof JSONObject) {
                return ((JSONObject) jsonCompatible).toString(2);
            }
            return new JSONObject().put("data", jsonCompatible).toString(2);
        } catch (JSONException | IllegalAccessException e) {
            return healthRisks.toString();
        }
    }

    private Object convertToJsonCompatible(Object value) throws JSONException, IllegalAccessException {
        if (value == null) {
            return JSONObject.NULL;
        }
        if (value instanceof Optional) {
            Optional<?> optional = (Optional<?>) value;
            return optional.isPresent() ? convertToJsonCompatible(optional.get()) : JSONObject.NULL;
        }
        if (value instanceof Enum<?>) {
            return ((Enum<?>) value).name();
        }
        if (value instanceof Number || value instanceof Boolean || value instanceof String) {
            return value;
        }
        if (value.getClass().isArray()) {
            JSONArray array = new JSONArray();
            int length = Array.getLength(value);
            for (int i = 0; i < length; i++) {
                array.put(convertToJsonCompatible(Array.get(value, i)));
            }
            return array;
        }
        if (value instanceof Iterable<?>) {
            JSONArray array = new JSONArray();
            for (Object item : (Iterable<?>) value) {
                array.put(convertToJsonCompatible(item));
            }
            return array;
        }

        JSONObject jsonObject = new JSONObject();
        for (Field field : value.getClass().getFields()) {
            Object fieldValue = field.get(value);
            jsonObject.put(field.getName(), convertToJsonCompatible(fieldValue));
        }
        return jsonObject;
    }

    private ShenAIAndroidSDK.InitializationResult initializeShenAI() {
        ShenAIAndroidSDK.InitializationSettings settings = shenaiSDKHandler.getDefaultInitializationSettings();
        settings.showUserInterface = false;
        settings.enableSummaryScreen = false;
        settings.cameraMode = ShenAIAndroidSDK.CameraMode.OFF;
        return shenaiSDKHandler.initialize(this, ExampleConfig.API_KEY, ExampleConfig.USER_ID, settings);
    }

    @Override
    protected void onDestroy() {
        if (shenaiSDKHandler.isInitialized()) {
            shenaiSDKHandler.deinitialize();
        }
        super.onDestroy();
    }
}
