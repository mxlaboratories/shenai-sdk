# Shen.AI Expo Minimal

A lightweight Expo dev-client project that showcases the Shen.AI React Native SDK on Android and iOS. The project lives in `examples/expo/expo-minimal`.

## Requirements
- Node.js 18+ with npm 9+
- Android Studio / Android SDK for device or emulator builds
- Xcode 14.3+ with a provisioned iPhone or simulator
- A Shen.AI API key

## Prepare the SDK once
The React Native plugin must be available at `examples/expo/expo-minimal/react-native-shenai-sdk`.
Drop the published `react-native-shenai-sdk` package into that folder so it contains `package.json`, `android/libs/shenai_sdk.aar`, and `ios/ShenaiSDK.xcframework`.

## Run the demo
```bash
cd examples/expo/expo-minimal
npm install
npx expo run:android --device
npx expo run:ios --device
```
These commands build the native shells, launch Metro automatically, and install the app on the connected device.

## Tips for devices
- Android: enable USB debugging and confirm the device appears in `adb devices` before running the command.
- iOS: trust the device in Xcode, select your signing team, and when prompted on first launch allow **Local Network** access so the app can reach the Metro server. You can change the permission later under Settings ▸ ShenaiTest.

## Configure your credentials
Open `App.js` and replace the placeholder API key and user ID before taking measurements:
```javascript
const result = await initialize("YOUR_API_KEY", "YOUR_USER_ID");
```
