# Shen.AI MAUI Custom UI

Custom .NET MAUI example that initializes the Shen.AI SDK with the native SDK
UI hidden, renders a circular camera preview, shows custom measurement progress
and quality indicators, collects health-risk inputs, and displays a custom
results screen after measurement completion.

## Setup

The public example restores the `Shenai.Maui` NuGet package. Its version is
pinned in the project file; the package includes the platform binding dependencies.
Install .NET 9 and the MAUI workload for your target platform.

The API key is intentionally not stored in the project. Pass it at build time
with `-p:ShenaiApiKey="YOUR_API_KEY"`, or set `SHENAI_API_KEY` in your shell.

## Android

From the repository root:

```bash
cd examples/maui/maui-custom-ui

dotnet restore -p:TargetFrameworks=net9.0-android
dotnet build Shenai.Maui.CustomUi.csproj -f net9.0-android -c Debug -p:TargetFrameworks=net9.0-android -p:ShenaiApiKey="YOUR_API_KEY"
dotnet build Shenai.Maui.CustomUi.csproj -t:Run -f net9.0-android -c Debug -p:TargetFrameworks=net9.0-android -p:ShenaiApiKey="YOUR_API_KEY"
```

## iOS

Run from macOS with a signed physical iPhone target. First find the connected
device id:

```bash
xcrun xctrace list devices
```

Then build, install, and launch the app:

```bash
cd examples/maui/maui-custom-ui

DEVICE="<device-id>"
APP_ID=ai.mxlabs.shenai.maui.customui

dotnet restore -p:TargetFrameworks=net9.0-ios -r ios-arm64
dotnet build Shenai.Maui.CustomUi.csproj \
  -f net9.0-ios \
  -c Debug \
  -r ios-arm64 \
  -p:TargetFrameworks=net9.0-ios \
  -p:ValidateXcodeVersion=false \
  -p:ApplicationId="$APP_ID" \
  -p:ShenaiApiKey="YOUR_API_KEY" \
  --no-restore

xcrun devicectl device install app \
  --device "$DEVICE" \
  bin/Debug/net9.0-ios/ios-arm64/Shenai.Maui.CustomUi.app

xcrun devicectl device process launch \
  --terminate-existing \
  --device "$DEVICE" \
  "$APP_ID"
```

MAUI CLI requires an installed Apple development certificate and a development
provisioning profile matching the bundle id.

