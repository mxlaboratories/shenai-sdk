# Shen.AI MAUI Flow

.NET MAUI example with two SDK UI-flow entry points:

- `Dashboard` opens a dashboard-only SDK flow.
- `Measurement` opens the measurement, results, and health-risks SDK flow,
  disables dashboard access, and shows an Open PDF action after the SDK flow
  finishes.

## Setup

Download the Shen.AI MAUI SDK package and place it in this directory as
`Shenai.Maui.SDK`. The SDK directory must include
`src/Shenai.Maui/Shenai.Maui.csproj`.

The API key is intentionally not stored in the project. Pass it at build time
with `-p:ShenaiApiKey=<your-api-key>`, or set `SHENAI_API_KEY` in your shell.

## Android

Run from this example directory:

```bash
cd examples/maui/maui-flow

dotnet restore -p:TargetFrameworks=net9.0-android
dotnet build Shenai.Maui.Flow.csproj -f net9.0-android -c Debug -p:TargetFrameworks=net9.0-android -p:ShenaiApiKey=<your-api-key>
dotnet build Shenai.Maui.Flow.csproj -t:Run -f net9.0-android -c Debug -p:TargetFrameworks=net9.0-android -p:ShenaiApiKey=<your-api-key>
```

## iOS

Run from macOS with a signed physical iPhone target. First find the connected
device id:

```bash
xcrun xctrace list devices
```

Then build, install, and launch the app:

```bash
cd examples/maui/maui-flow

DEVICE="<device-id>"
APP_ID=ai.mxlabs.shenai.maui.flow

dotnet restore -p:TargetFrameworks=net9.0-ios -r ios-arm64
dotnet build Shenai.Maui.Flow.csproj \
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
  bin/Debug/net9.0-ios/ios-arm64/Shenai.Maui.Flow.app

xcrun devicectl device process launch \
  --terminate-existing \
  --device "$DEVICE" \
  "$APP_ID"
```

MAUI CLI requires an installed Apple development certificate and a development
provisioning profile matching the bundle id.
