# Shenai MAUI Minimal (standalone)

This is a **standalone .NET MAUI minimal app** that uses the Shen.AI MAUI SDK you already have.

## What you do

1) **Copy your SDK folder** into this directory so it looks like this:

```
shenai-maui-minimal/
├─ Shenai.Maui.Minimal.csproj         # this app
├─ App.xaml
├─ App.xaml.cs
├─ MauiProgram.cs
├─ MainPage.xaml
├─ MainPage.xaml.cs
├─ Platforms/
│  ├─ Android/AndroidManifest.xml
│  └─ iOS/Info.plist
└─ **Shenai.Maui.SDK/**               # <— paste the SDK folder you already have here
```

2) **Install toolchain (first time only)**
```bash
dotnet workload install maui
```

3) **Run on Android**
```bash
dotnet clean Shenai.Maui.Minimal.csproj -f net9.0-android
dotnet build Shenai.Maui.Minimal.csproj -f net9.0-android -c Debug
dotnet build -t:Run -f net9.0-android -c Debug
```

4) **Run on iOS**  
```bash
./.dotnet/dotnet build Shenai.Maui.Minimal.csproj -c Debug -f net9.0-ios -r ios-arm64 -v minimal
MLAUNCH="./.dotnet/packs/Microsoft.iOS.Sdk.net9.0_18.5/18.5.9215/tools/bin/mlaunch"
$MLAUNCH --uninstalldevbundleid ai.mxlabs.shenai-maui-minimal --devname <YOUR_DEVICE_UDID> || true
$MLAUNCH --installdev bin/Debug/net9.0-ios/ios-arm64/Shenai.Maui.Minimal.app/ --devname <YOUR_DEVICE_UDID> --install-progress -v
$MLAUNCH --launchdevbundleid ai.mxlabs.shenai-maui-minimal --devname <YOUR_DEVICE_UDID> --wait-for-unlock --wait-for-exit -v
```

