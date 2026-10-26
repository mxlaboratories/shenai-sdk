# Shen.AI SDK - React Native Flow Example

This example opens selected Shen.AI SDK UI flows from a React Native home
screen:

- `Dashboard`
- `Measurement` -> `Results` -> `Health Risks` -> PDF action screen

## Setup

The public example installs `@shenai/react-native-sdk` from npm through the
`react-native-shenai-sdk` alias in `package.json`. Native dependencies resolve
through Maven Central and CocoaPods. Versions come from the package manifests.

Use Node.js compatible with `package.json`, Yarn Classic, JDK 17 and Android
Studio for Android, and Xcode plus CocoaPods for iOS. Run from this example directory:

```bash
yarn install
export SHENAI_API_KEY="YOUR_API_KEY"
yarn start
```

Keep Metro running. In a second terminal in the same example directory, launch
Android with a connected device or running emulator:

```bash
yarn android
```

For iOS, install the pods on macOS and open the workspace:

```bash
cd ios
pod install
open react_native_flow.xcworkspace
```

In Xcode, select your development team and physical iPhone, then press Run.
Use a physical device for camera measurements. Set the key before starting Metro;
restart Metro after changing it. Do not commit a real key.

## Flow Behavior

`Dashboard` initializes the SDK with only the dashboard screen.

`Measurement` initializes the SDK with measurement, results, and health-risks
screens. When the SDK emits `USER_FLOW_FINISHED`, the example shows a PDF action
screen where the user can request the generated measurement report and then
finish the flow.

