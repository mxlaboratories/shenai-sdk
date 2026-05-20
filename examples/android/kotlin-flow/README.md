# Shen.AI Android Kotlin Flow

This native Android Kotlin app embeds the Shen.AI SDK and shows two SDK-driven
flows: the dashboard and a measurement flow with results, health risks, and an
Open PDF action.

## Setup

Download the Android SDK package and place the SDK AAR in this directory as
`libs/shenai_sdk.aar`.

Run the example from the repository root:

```bash
./scripts/run_android_kotlin_flow.sh -PshenaiApiKey=<your-api-key>
```

The API key is required at build time and is intentionally not stored in this
example. The script uses JDK 17 on macOS when it is available and `JAVA_HOME` is
not already set.
