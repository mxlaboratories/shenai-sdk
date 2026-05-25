# Shen.AI SDK - React Native Flow Example

This example opens selected Shen.AI SDK UI flows from a React Native home
screen:

- `Dashboard`
- `Measurement` -> `Results` -> `Health Risks` -> PDF action screen

## Setup

Download the React Native SDK from the Customer Portal and unzip it next to
`package.json` as `react-native-shenai-sdk`.

## Run

From the repository root:

```bash
SHENAI_API_KEY=<your-api-key> ./scripts/run_react_native_flow_android.sh
SHENAI_API_KEY=<your-api-key> ./scripts/run_react_native_flow_ios.sh
```

The run scripts use Metro port `8082` by default. Override it with
`RCT_METRO_PORT=<port>` if needed.

iOS simulators do not provide camera frames, so measurements need a physical
device.

## Flow Behavior

`Dashboard` initializes the SDK with only the dashboard screen.

`Measurement` initializes the SDK with measurement, results, and health-risks
screens. When the SDK emits `USER_FLOW_FINISHED`, the example shows a PDF action
screen where the user can request the generated measurement report and then
finish the flow.
