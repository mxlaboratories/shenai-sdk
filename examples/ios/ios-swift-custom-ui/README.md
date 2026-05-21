# Shen.AI iOS Swift Custom UI Example

Native Swift custom UI example. It hides the embedded SDK UI, renders a custom measurement screen, polls live metrics, shows results, and lets the risk profile be edited.

## Setup

Copy the SDK package into the example:

```bash
mkdir -p examples/ios/ios-swift-custom-ui/Frameworks
cp -R /path/to/ShenaiSDK.xcframework examples/ios/ios-swift-custom-ui/Frameworks/
```

Open `ios-swift-custom-ui.xcodeproj` in Xcode, select a physical iPhone, and set your signing team.

Set the API key for local Xcode runs:

1. Select `Product > Scheme > Edit Scheme...`.
2. Select `Run > Arguments`.
3. Add an enabled environment variable:

```text
SHENAI_API_KEY=<your-api-key>
```

The app also accepts `SHENAI_API_KEY` as an `xcodebuild` build setting for command-line builds. Do not store a real API key in source files, shared schemes, or committed project settings.

## Run

Press Run in Xcode after selecting the `ios-swift-custom-ui` target and your device.
