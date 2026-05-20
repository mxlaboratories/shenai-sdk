# Shen.AI Flutter UI Flow

This example keeps the Flutter side intentionally small and uses the embedded
Shen.AI UI-flow screens. The home page has two actions:

- `Dashboard` opens a dashboard-only SDK UI flow.
- `Measurement` opens the SDK measurement screen with the
  `thirtySecondsAllMetrics` preset. After the embedded SDK measurement flow
  finishes, the Flutter screen shows an Open PDF action for the finished
  measurement. This flow disables dashboard access with
  `ShenaiSdk.setEnableMeasurementsDashboard(false)` after initialization.

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
example.

## iOS device signing

Running on a physical iOS device requires a valid Apple Development account,
development team, and provisioning profile. If the build fails with a signing
error such as `No Account for Team` or `No profiles for ... were found`, open
the workspace in Xcode and configure signing for the Runner target:

```bash
open examples/flutter/flutter_flow/ios/Runner.xcworkspace
```

Select your team and use a bundle identifier that belongs to your account, then
build or run the app again.
