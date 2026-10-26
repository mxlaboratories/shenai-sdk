# Shen.AI SDK — React Native Minimal

Minimal React Native example that embeds the SDK and its camera interface.

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
open react_native_minimal.xcworkspace
```

In Xcode, select your development team and physical iPhone, then press Run.
Use a physical device for camera measurements. Set the key before starting Metro;
restart Metro after changing it. Do not commit a real key.

