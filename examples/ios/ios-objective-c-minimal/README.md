# Shen.AI iOS Objective-C Minimal Example

Native Objective-C minimal example. It initializes the SDK, embeds the SDK UI, and exposes an initialize/deinitialize control in the navigation bar.

## Setup

The public example resolves `ShenaiSDK` through Swift Package Manager. The SDK
repository and exact version are declared in the Xcode project. Xcode downloads
the dependency when opening or building the project.

From this example directory, open `ios-objective-c-minimal.xcodeproj` in Xcode, select a physical iPhone, and set your signing team.

Set the API key for local Xcode runs:

1. Select `Product > Scheme > Edit Scheme...`.
2. Select `Run > Arguments`.
3. Add an enabled environment variable:

```text
SHENAI_API_KEY=YOUR_API_KEY
```

The app also accepts `SHENAI_API_KEY` as an `xcodebuild` build setting for command-line builds. Do not store a real API key in source files, shared schemes, or committed project settings.

## Run

Press Run in Xcode after selecting the `ios-objective-c-minimal` scheme and your device.

