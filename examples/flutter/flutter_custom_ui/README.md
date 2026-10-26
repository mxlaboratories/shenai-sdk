# Shen.AI Flutter Custom UI

This example hides the SDK UI and draws a small custom Flutter interface around
the SDK camera view.

## Code organization

- `lib/main.dart`: initializes Flutter, the SDK, and the app.
- `lib/sdk_settings.dart`: shows the SDK settings used for a custom UI.
- `lib/pages/custom_measure_page.dart`: owns measurement start/stop, polling,
  progress, and health-risk computation.
- `lib/pages/risk_form_page.dart`: collects the factors passed to the SDK risk
  APIs.
- `lib/pages/result_page.dart`: displays measurement results and health risks.
- `lib/widgets/`: contains reusable Flutter-only UI pieces.
- `lib/models/` and `lib/utils/`: contain example data objects and formatting
  helpers.

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

