# Shen.AI SDK - React Native Custom UI Example

This example hides the built-in Shen.AI SDK UI and renders a React Native
measurement experience around the native camera view:

- custom start and stop buttons
- live progress and signal quality
- realtime headline metrics
- editable health-risk profile
- results and health indices screen

## Setup

Download the React Native SDK from the Customer Portal and unzip it next to
`package.json` as `react-native-shenai-sdk`.

## Run

From the repository root:

```bash
SHENAI_API_KEY=<your-api-key> ./scripts/run_react_native_custom_ui_android.sh
SHENAI_API_KEY=<your-api-key> ./scripts/run_react_native_custom_ui_ios.sh
```

The run scripts use Metro port `8083` by default. Override it with
`RCT_METRO_PORT=<port>` if needed.

iOS simulators do not provide camera frames, so measurements need a physical
device.
