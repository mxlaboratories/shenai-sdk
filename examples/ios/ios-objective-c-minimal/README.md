# Shen.AI iOS Objective-C Minimal Example

Native Objective-C minimal example. It initializes the SDK, embeds the SDK UI, and exposes an initialize/deinitialize control in the navigation bar.

## Setup

Copy the SDK package into the example:

```bash
mkdir -p examples/ios/ios-objective-c-minimal/Frameworks
cp -R /path/to/ShenaiSDK.xcframework examples/ios/ios-objective-c-minimal/Frameworks/
```

Open `ios-objective-c-minimal.xcodeproj` in Xcode, select a physical iPhone, and set your signing team.

Set the API key for local Xcode runs:

1. Select `Product > Scheme > Edit Scheme...`.
2. Select `Run > Arguments`.
3. Add an enabled environment variable:

```text
SHENAI_API_KEY=<your-api-key>
```

The app also accepts `SHENAI_API_KEY` as an `xcodebuild` build setting for command-line builds. Do not store a real API key in source files, shared schemes, or committed project settings.

## Run

Press Run in Xcode after selecting the `ios-objective-c-minimal` scheme and your device.
