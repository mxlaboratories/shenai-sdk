# Shen.AI Android Java Custom UI

This native Android Java app embeds the Shen.AI SDK without the built-in SDK UI,
renders a custom measurement screen, polls live metrics, shows results, and lets
the risk profile be edited.

## Setup

The Android SDK is restored from Maven Central as `ai.shen:shenai-sdk`. The
default version is set in `gradle.properties` as `shenaiSdkVersion=3.1.2`; pass
`-PshenaiSdkVersion=<version>` to use a different SDK version.

Run the example from the repository root:

```bash
./scripts/run_android_java_custom_ui.sh -PshenaiApiKey=<your-api-key>
```

The API key is required at build time and is intentionally not stored in this
example. The script uses JDK 17 on macOS when it is available and `JAVA_HOME` is
not already set.
