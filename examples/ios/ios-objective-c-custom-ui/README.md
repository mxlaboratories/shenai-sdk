# Shen.AI iOS Objective-C Custom UI Example

Native Objective-C custom UI example. It hides the embedded SDK UI, renders a custom measurement screen, polls live metrics, shows results, and lets the risk profile be edited.

## Setup

The iOS SDK is restored with Swift Package Manager from
`https://github.com/mxlaboratories/ShenaiSDK.git` pinned to exact version `3.1.2`.
Xcode resolves the `ShenaiSDK` package product when the project is opened or
built.

Open `ios-objective-c-custom-ui.xcodeproj` in Xcode, select a physical iPhone, and set your signing team.

Set the API key for local Xcode runs:

1. Select `Product > Scheme > Edit Scheme...`.
2. Select `Run > Arguments`.
3. Add an enabled environment variable:

```text
SHENAI_API_KEY=<your-api-key>
```

The app also accepts `SHENAI_API_KEY` as an `xcodebuild` build setting for command-line builds. Do not store a real API key in source files, shared schemes, or committed project settings.

## Run

Press Run in Xcode after selecting the `ios-objective-c-custom-ui` scheme and your device.
