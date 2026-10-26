# Shen.AI SDK - React Native Custom UI Example

This example hides the built-in Shen.AI SDK UI and renders a React Native
measurement experience around the native camera view:

- custom start and stop buttons
- live progress and signal quality
- realtime headline metrics
- editable health-risk profile
- results and health indices screen

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
open react_native_custom_ui.xcworkspace
```

In Xcode, select your development team and physical iPhone, then press Run.
Use a physical device for camera measurements. Set the key before starting Metro;
restart Metro after changing it. Do not commit a real key.

