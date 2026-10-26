# Shen.AI Flutter UI Flow

This example keeps the Flutter side intentionally small and uses the embedded
Shen.AI UI-flow screens. The home page has two actions:

- `Dashboard` opens a dashboard-only SDK UI flow.
- `Measurement` opens the SDK measurement screen with the
  `thirtySecondsAllMetrics` preset. After the embedded SDK measurement flow
  finishes, the Flutter screen shows an Open PDF action for the finished
  measurement. This flow disables dashboard access with
  `ShenaiSdk.setEnableMeasurementsDashboard(false)` after initialization.

## Setup and run

The public example uses `shenai_sdk` from pub.dev at the version pinned in
`pubspec.yaml`. Its Android dependency resolves through Maven Central; iOS uses
the SDK's Swift Package Manager integration.

Install Flutter with Dart compatible with `pubspec.yaml`, Android Studio for
Android, and Xcode for iOS. Run from this example directory:

```bash
flutter pub get
flutter run --dart-define=SHENAI_API_KEY="YOUR_API_KEY"
```

Choose your connected device when prompted. iOS builds require an app deployment
target of at least 14.0. Use a physical device for camera measurements. Keep the
client API key out of committed files.

## iOS device signing

Running on a physical iOS device requires a valid Apple Development account,
development team, and provisioning profile. If the build fails with a signing
error such as `No Account for Team` or `No profiles for ... were found`, open
the workspace in Xcode and configure signing for the Runner target:

```bash
open ios/Runner.xcworkspace
```

Select your team and use a bundle identifier that belongs to your account, then
build or run the app again.

