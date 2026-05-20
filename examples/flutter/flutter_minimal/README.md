# Shen.AI Flutter Minimal

This is the smallest Flutter app in this repository that embeds the Shen.AI SDK,
starts the native camera UI, and runs a 30 second all-metrics measurement flow.

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
./scripts/run_flutter_minimal.sh --dart-define=SHENAI_API_KEY=<your-api-key>
```

## iOS device signing

Running on a physical iOS device requires a valid Apple Development account,
development team, and provisioning profile. If the build fails with a signing
error such as `No Account for Team` or `No profiles for ... were found`, open
the workspace in Xcode and configure signing for the Runner target:

```bash
open examples/flutter/flutter_minimal/ios/Runner.xcworkspace
```

Select your team and use a bundle identifier that belongs to your account, then
build or run the app again.
