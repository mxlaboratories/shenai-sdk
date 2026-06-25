# Shen.AI Android Kotlin Flow

This native Android Kotlin app embeds the Shen.AI SDK and shows two SDK-driven
flows: the dashboard and a measurement flow with results, health risks, and an
Open PDF action.

## Setup

The Android SDK is restored from Maven Central as `ai.shen:shenai-sdk`. The
default version is set in `gradle.properties` as `shenaiSdkVersion=3.1.2`; pass
`-PshenaiSdkVersion=<version>` to use a different SDK version.

Run the example from the repository root:

```bash
./scripts/run_android_kotlin_flow.sh -PshenaiApiKey=<your-api-key>
```

The API key is required at build time and is intentionally not stored in this
example. The script uses JDK 17 on macOS when it is available and `JAVA_HOME` is
not already set.
