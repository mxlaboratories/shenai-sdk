using Android.App;
using Android.Content.PM;
using Microsoft.Maui;

namespace Shenai.Maui.Minimal;

[Activity(
    Theme = "@style/Maui.SplashTheme",
    MainLauncher = true,
    ConfigurationChanges = ConfigChanges.ScreenSize | ConfigChanges.Orientation | ConfigChanges.UiMode | ConfigChanges.ScreenLayout | ConfigChanges.SmallestScreenSize,
    Exported = true
)]
public class MainActivity : MauiAppCompatActivity
{
}

