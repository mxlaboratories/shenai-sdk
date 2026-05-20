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

## Setup

Link or unzip the Flutter SDK package into this directory as `shenai_sdk`.
When working from this repository, use:

```bash
ln -sf /path/to/shenai-sdk/flutter shenai_sdk
```

Run the example:

```bash
fvm install
fvm flutter pub get
fvm flutter run --dart-define=SHENAI_API_KEY=<your-api-key>
```

The API key is required at runtime and is intentionally not stored in this
example. From the repository root, you can also run:

```bash
./scripts/run_flutter_custom_ui.sh --dart-define=SHENAI_API_KEY=<your-api-key>
```

The local Android build requires the generated SDK AAR at
`shenai_sdk/android/libs/shenai_sdk.aar`.

## iOS device signing

Running on a physical iOS device requires a valid Apple Development account,
development team, and provisioning profile. If the build fails with a signing
error such as `No Account for Team` or `No profiles for ... were found`, open
the workspace in Xcode and configure signing for the Runner target:

```bash
open examples/flutter/flutter_custom_ui/ios/Runner.xcworkspace
```

Select your team and use a bundle identifier that belongs to your account, then
build or run the app again.
