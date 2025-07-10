# Shen.AI SDK – React Native **Minimal Example** (iOS & Android)

This repository shows the **minimum glue code** required to embed the Shen.AI SDK in a React Native application.

---

## 0. Quick start (TL;DR)

```bash
# 1  Download the React Native SDK from https://admin.shen.ai/sdk/keys-downloads, unzip it and place it next to package.json
$ mv ~/Downloads/shenai_sdk_react_native.zip ./shenai_sdk_react_native.zip
$ unzip ./shenai_sdk_react_native.zip

# 2  Insert your API key in App.tsx (line with initialize("API_KEY", …))
$ sed -i '' 's/API_KEY/your‑real‑key/g' App.tsx      # macOS
# or manually edit in any editor

# 3  Run on a connected iOS device
$ ./scripts/run_react_native_ios.sh

# 4  Run on a connected Android device
$ ./scripts/run_react_native_android.sh
```

---

## 1. Prerequisites

| Platform | Requirements                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| General  | **Node 16 +**, **Yarn ≥ 1.22** (mandatory), React Native CLI (`npm i -g react-native@latest`)                             |
| iOS      | macOS 13 +, Xcode 15 +, Xcode Command‑Line Tools (`xcode-select --install`), **CocoaPods** (`sudo gem install cocoapods`) |
| Android  | Android Studio Giraffe +, Android SDK 34 +, `adb` in `$PATH`, an unlocked physical device or emulator                     |

---

## 2. Project layout

```
react_native_minimal/
├── App.tsx                   # ← replace API_KEY here
├── react-native-shenai-sdk/  # ← unzipped proprietary SDK (native + JS)
├── ios/…
├── android/…
└── ../../../scripts/
    ├── run_react_native_ios.sh
    └── run_react_native_android.sh
```

The scripts encapsulate **all set‑up steps** (dependency download, CocoaPods,
Gradle wrapper, device checks) so you can focus on the SDK.

---

## 3. Running the example

### iOS

```bash
cd ../../../
./scripts/run_react_native_ios.sh                               # default
./scripts/run_react_native_ios.sh --device "DVTDeviceIdentifier"  # explicit device
```

_Without flags_, React Native will deploy to the first **connected physical device** if one is unlocked; otherwise it falls back to the first simulator.
**Note:** iOS simulators do not provide camera frames, so Shen.AI measurement will not start there.

### Android

```bash
cd ../../../
./scripts/run_react_native_android.sh
```

The script aborts if no _unlocked_ emulator or physical device is detected.

---

## 4. Replacing the API key

Open [App.tsx](App.tsx) and locate:

```ts
const result = await initialize("API_KEY", "", { … });
```

Replace **`API_KEY`** with the value from the **Shen.AI Customer Portal → API Keys** page.

---

## 5. Common pitfalls

| Symptom                                                                                                                                    | Fix                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Yarn not found`                                                                                                                           | Install Yarn globally: `npm i -g yarn` or follow [https://yarnpkg.com/getting-started/install](https://yarnpkg.com/getting-started/install).                                                                |
| `SDK not found…`                                                                                                                           | Ensure the **unzipped** folder is named exactly **`react-native-shenai-sdk`** and placed at repository root. The SDK can be downloaded from the Customer Portal at https://admin.shen.ai/sdk/keys-downloads |
| iOS build fails with _“pod: command not found”_                                                                                            | Run `sudo gem install cocoapods` or use Homebrew (`brew install cocoapods`).                                                                                                                                |
| Android build times out downloading Gradle                                                                                                 | Set the `ANDROID_HOME` environment variable and install command‑line tools & platform 34 via Android Studio.                                                                                                |
| `initialize returned false`                                                                                                                | Double‑check your API key and bundle identifier on the portal.                                                                                                                                              |
| iOS build fails with `error: No profiles for 'org.reactjs.native.example.react-native-minimal' were found` when running on physical device | Run `open ios/react_native_minimal.xcworkspace`, configure Signing in the XCode project and run the build from XCode                                                                                        |

---

## 6. Script exit codes

| Code | Meaning                                  |
| ---- | ---------------------------------------- |
| 0    | Success                                  |
| 1    | Missing prerequisite (Node, Yarn, adb …) |
| 2    | SDK directory missing                    |
| 3    | API key placeholder not replaced         |

---

## 7. Next steps

Read the [SDK Documentation](https://developer.shen.ai) to learn how to adjust Shen.AI SDK to your needs.
