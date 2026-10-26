# Shen.AI Android Kotlin Minimal

This is a small native Android Kotlin app that embeds the Shen.AI SDK, starts the
native camera UI, and runs a 30 second all-metrics measurement flow.

## Setup and run

The public example resolves `ai.shen:shenai-sdk` from Maven Central. The SDK
version is pinned in `build.gradle`.

Use JDK 17 and install the Android SDK, including platform 35 and build tools
36.0.0. From this example directory, with an Android device connected:

```bash
./gradlew assembleDebug -PshenaiApiKey="YOUR_API_KEY"
./gradlew installDebug -PshenaiApiKey="YOUR_API_KEY"
```

Open the installed app on the device and allow camera access. Use your Shen.AI
client API key; keep it out of committed files.

