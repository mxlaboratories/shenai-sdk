# Shen.AI Android Kotlin Minimal

This is a small native Android Kotlin app that embeds the Shen.AI SDK, starts the
native camera UI, and runs a 30 second all-metrics measurement flow.

## Setup

Download the Android SDK package and place the SDK AAR in this directory as
`libs/shenai_sdk.aar`.

Run the example from the repository root:

```bash
./scripts/run_android_kotlin_minimal.sh -PshenaiApiKey=<your-api-key>
```

The API key is required at build time and is intentionally not stored in this
example. The script uses JDK 17 on macOS when it is available and `JAVA_HOME` is
not already set.
