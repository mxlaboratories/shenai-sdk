import CreateShenaiSDK, { CameraMode } from "../../shenai-sdk/index.mjs";
import { APP_CONFIG } from "../../app-config.js";
import Module from "../../shenai-sdk/shenai_sdk.mjs";

// helpers
function formatFactorsAsJSObject(obj, indentLevel = 0) {
    const enumFields = {
        hypertensionTreatment: shenai.HypertensionTreatment,
        gender: shenai.Gender,
        race: shenai.Race,
        physicalActivity: shenai.PhysicalActivity,
        parentalHypertension: shenai.ParentalHistory,
        familyDiabetes: shenai.FamilyHistory,
        nonAlcoholicFattyLiverDiseaseRisk: shenai.NAFLDRisk
    };

    const enumPrefixes = {
        hypertensionTreatment: "shenai.HypertensionTreatment",
        gender: "shenai.Gender",
        race: "shenai.Race",
        physicalActivity: "shenai.PhysicalActivity",
        parentalHypertension: "shenai.ParentalHistory",
        familyDiabetes: "shenai.FamilyHistory",
        nonAlcoholicFattyLiverDiseaseRisk: "shenai.NAFLDRisk"
    };

    const indent = "  ".repeat(indentLevel);
    const lines = ["{"];

    for (const [key, value] of Object.entries(obj)) {
        const lineIndent = "  ".repeat(indentLevel + 1);

        if (enumFields[key]) {
            const enumObj = enumFields[key];
            const found = Object.entries(enumObj).find(([, val]) => val === value);
            if (found) {
                lines.push(`${lineIndent}${key}: ${enumPrefixes[key]}.${found[0]},`);
                continue;
            }
        }

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            lines.push(`${lineIndent}${key}: ${formatFactorsAsJSObject(value, indentLevel + 1)},`);
        } else if (Array.isArray(value)) {
            lines.push(`${lineIndent}${key}: [`);
            for (const item of value) {
                if (typeof item === "object") {
                    lines.push(formatFactorsAsJSObject(item, indentLevel + 2) + ",");
                } else {
                    lines.push("  ".repeat(indentLevel + 2) + JSON.stringify(item) + ",");
                }
            }
            lines.push(`${lineIndent}],`);
        } else if (typeof value === "string") {
            lines.push(`${lineIndent}${key}: "${value}",`);
        } else {
            lines.push(`${lineIndent}${key}: ${value},`);
        }
    }
    lines.push(indent + "}");
    return lines.join("\n");
}
// end of helpers

const urlParams = new URLSearchParams(window.location.search);
const API_KEY = urlParams.get("apiKey") || APP_CONFIG.API_KEY;

let factors = {};

export function calculate() {
    // computing health indices
    // for more information see: https://developer.shen.ai/health-indices/integration  
    const indices = shenai.computeHealthRisks(factors);
    // output.textContent = JSON.stringify(indices, null, 2);
    document.getElementById("output").textContent = formatFactorsAsJSObject(indices);
}
window.calculate = calculate;

document.addEventListener("DOMContentLoaded", async () => {
    const shenai = await CreateShenaiSDK({
        enablePreloadDisplay: false,
    });

    shenai.initialize(
      API_KEY,
      APP_CONFIG.USER_ID,
  
      // camera mode in initialization settings
      // for more information see: https://developer.shen.ai/getting-started/initialization#initialization-settings
      {
        cameraMode: CameraMode.OFF
      },
  
      // initialization results handling
      // for more information see: https://developer.shen.ai/getting-started/initialization#error-handling
      (result) => {
        if (result === shenai.InitializationResult.OK) {
            console.log("Shen.AI SDK initialized");
            
            // example risk factors object
            // for more information see: https://developer.shen.ai/health-indices/integration
            factors = {
                age: 30,                       // years
                cholesterol: 190,              // mg/dL
                cholesterolHdl: 55,            // mg/dL
                sbp: 132,                      // mmHg
                dbp: 85,                       // mmHg
               
                isSmoker: false,
                hypertensionTreatment: shenai.HypertensionTreatment.NO,
                //   ↳ HypertensionTreatment.NOT_NEEDED | .NO | .YES
               
                hasDiabetes: true,
               
                bodyHeight: 178,               // centimeters
                bodyWeight: 85,                // kilograms
                waistCircumference: 92,        // centimeters
               
                gender: shenai.Gender.MALE,
                //   ↳ Gender.MALE | .FEMALE | .OTHER
               
                country: "US",                 // 2-letter ISO code, e.g. "US"
               
                race: shenai.Race.WHITE,
                //   ↳ Race.WHITE | .AFRICAN_AMERICAN | .OTHER
               
                physicalActivity: shenai.PhysicalActivity.MODERATELY,
                //   ↳ PhysicalActivity.SEDENTARY | .LIGHTLY_ACTIVE 
                //     | .MODERATELY | .VERY_ACTIVE | .EXTRA_ACTIVE
               
                vegetableFruitDiet: true,
                historyOfHypertension: false,
                historyOfHighGlucose: true,
               
                fastingGlucose: 95,            // mg/dL
                triglyceride: 160,             // mg/dL
               
                parentalHypertension: shenai.ParentalHistory.ONE,
                //   ↳ ParentalHistory.NONE | .ONE | .BOTH
               
                familyDiabetes: shenai.FamilyHistory.NONE_FIRST_DEGREE,
                //   ↳ FamilyHistory.NONE | .NONE_FIRST_DEGREE | .FIRST_DEGREE
            };
        
            document.getElementById("input").textContent = formatFactorsAsJSObject(factors);

        } else {
          alert("Shen.AI license activation error " + result.toString());
        }
      }
    );
  
    // providing the user interface
    // for more information see: https://developer.shen.ai/getting-started/initialization#providing-the-user-interface
    window.shenai = shenai;
});

  