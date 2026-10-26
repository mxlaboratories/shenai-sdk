# Shen.AI Expo Minimal

A lightweight Expo dev-client project that showcases the Shen.AI React Native SDK on Android and iOS. The project lives in `examples/expo/expo-minimal`.

## Requirements

- Node.js 18+ with npm 9+
- Android Studio / Android SDK for device or emulator builds
- Xcode 14.3+ with a provisioned iPhone or simulator
- A Shen.AI API key

## SDK dependency

The public example installs `@shenai/react-native-sdk` through the
`react-native-shenai-sdk` npm alias declared in `package.json`. Its native SDK
dependencies resolve through the platform package managers.

## Run the demo

```bash
cd examples/expo/expo-minimal
export EXPO_PUBLIC_SHENAI_API_KEY="YOUR_API_KEY"
npm install
npx expo run:android --device
npx expo run:ios --device
```

These commands build the native shells, launch Metro automatically, and install the app on the connected device.

## Tips for devices

- Android: enable USB debugging and confirm the device appears in `adb devices` before running the command.
- iOS: trust the device in Xcode, select your signing team, and when prompted on first launch allow **Local Network** access so the app can reach the Metro server. You can change the permission later under Settings ▸ ShenaiTest.

## Configure your credentials

Set your API key before starting Expo/Metro (or put it in a local, uncommitted `.env` file):

```bash
export EXPO_PUBLIC_SHENAI_API_KEY="your-api-key"
npx expo run:android --device
```

Expo embeds this value in the application bundle; use an SDK client API key, not a server credential.

