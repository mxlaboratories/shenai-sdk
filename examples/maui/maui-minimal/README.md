# Shen.AI MAUI Minimal

Minimal .NET MAUI example that initializes the Shen.AI SDK with the embedded
SDK UI, `MeasurementPreset.THIRTY_SECONDS_ALL_METRICS`, and sample health-risk
form data. The only app-level control is the top-left initialize/deinitialize
button.

## Setup

Download the Shen.AI MAUI SDK package and place it in this directory as
`Shenai.Maui.SDK`. The SDK directory must include
`src/Shenai.Maui/Shenai.Maui.csproj`.

The API key is intentionally not stored in the project. Pass it at build time
with `-p:ShenaiApiKey=<your-api-key>`, or set `SHENAI_API_KEY` in your shell.

## Android

Run from this example directory:

```bash
cd examples/maui/maui-minimal

dotnet restore -p:TargetFrameworks=net9.0-android
dotnet build Shenai.Maui.Minimal.csproj -f net9.0-android -c Debug -p:TargetFrameworks=net9.0-android -p:ShenaiApiKey=<your-api-key>
dotnet build Shenai.Maui.Minimal.csproj -t:Run -f net9.0-android -c Debug -p:TargetFrameworks=net9.0-android -p:ShenaiApiKey=<your-api-key>
```

## iOS

Run from macOS with a signed physical iPhone target. First find the connected
device id:

```bash
xcrun xctrace list devices
```

Then build, install, and launch the app:

```bash
cd examples/maui/maui-minimal

DEVICE="<device-id>"
APP_ID=ai.mxlabs.shenai.maui.minimal

dotnet restore -p:TargetFrameworks=net9.0-ios -r ios-arm64
dotnet build Shenai.Maui.Minimal.csproj \
  -f net9.0-ios \
  -c Debug \
  -r ios-arm64 \
  -p:TargetFrameworks=net9.0-ios \
  -p:ValidateXcodeVersion=false \
  -p:ApplicationId="$APP_ID" \
  -p:ShenaiApiKey=<your-api-key> \
  --no-restore

xcrun devicectl device install app \
  --device "$DEVICE" \
  bin/Debug/net9.0-ios/ios-arm64/Shenai.Maui.Minimal.app

xcrun devicectl device process launch \
  --terminate-existing \
  --device "$DEVICE" \
  "$APP_ID"
```

MAUI CLI requires an installed Apple development certificate and a development
provisioning profile matching the bundle id.
