## Shen.AI flutter example

## Download the example and SDK

First clone the examples repo

```bash
git clone git@github.com:mxlaboratories/shenai-sdk.git
cd shenai-sdk/examples/flutter
```

Next, download the SDK from the [Developer Portal](https://developer.shen.ai/platforms/flutter#installing-the-sdk-package) and unzip it in the flutter example directory.

```bash
unzip shenai-sdk-flutter.zip
```

## Getting Started

**Configuration of FVM - handle multiple flutter channels**

1. Activate and install fvm:
   - Run: `pub global activate fvm`
2. Create an environmental variable for fvm path\
   a) Windows: `%APPDATA%\Pub\Cache\bin`\
   b) Linux/macOS: `$HOME/.pub-cache/bin`
3. Go to project directory
4. From your project directory set fvm to use cached channel/version(per project)
   `fvm install`

**Build runner**

5. `fvm flutter pub run build_runner build --delete-conflicting-outputs`

**Set your API license key**

6. In the file `lib/domain/constants_values.dart` set your license key in the `shenAiAPIkey` variable (access API keys in the [Licensing](https://developer.shen.ai/licensing) section of the Developer Portal)

**Run app**

7. At the end when your on stable channel (or other) and want to run application with beta channel (or other) - Run: `fvm flutter pub get` - Run: `fvm flutter run`

## Customization

#### You can customize the app to suit your style - change the logo on the splash screen, change the app icon and the colors used in the app.

#### Change logo on the splash screen

1. **Change logo icon:**
   - Replace an existing icon with your own in `assets/images/dark/icon.png` and `assets/images/light/icon.png`
     if you want to have the same icon for light and dark theme - you can use the same file in both folders
2. **Change background colors:**
   - In the file `pubspec.yaml` you can change values for variables `color` and `color_dark` to set the colors as you like
3. **Generate new splash screen:**
   - Run `fvm flutter pub run flutter_native_splash:create`

#### Change app icon

1. **Change logo icon:**
   - Replace an existing icon with your own in `assets/images/app_icon.png`
2. **Change background colors:**
   - Run `flutter pub run flutter_launcher_icons:main`

#### Change visible app name

1. **Change name:**
   - Replace an existing name with your own in `android/app/src/main/AndroidManifest.xml` in the parameter `android:label`

#### Customize the displayed language to your own

1. **Change texts:**
   - Replace existing texts with your own in the file `lib/domain/constants_values.dart`

## Tests

To run integration tests use:

```
fvm flutter drive --driver test_driver/integration_test.dart --target integration_test/general_tests.dart
```
