using Shenai.Maui;
using System.Diagnostics;
#if IOS
using AVFoundation;
using Foundation;
using UIKit;
#endif

namespace Shenai.Maui.Minimal;

public partial class MainPage : ContentPage
{
    private const string API_KEY = ""; // TODO: put your API key here
    private const string USER_ID = "";
    private IDisposable? _sub;

    public MainPage()
    {
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        // Ensure camera permission
#if IOS
        var granted = await EnsureCameraPermissioniOSAsync();
        if (!granted)
            return;
#else
        try
        {
            var st = await Permissions.CheckStatusAsync<Permissions.Camera>();
            if (st != PermissionStatus.Granted)
                st = await Permissions.RequestAsync<Permissions.Camera>();
            if (st != PermissionStatus.Granted)
            {
                var open = await DisplayAlert("Camera Permission",
                    "Camera access is required to display the measurement view.",
                    "Open Settings", "Cancel");
                if (open)
                    AppInfo.ShowSettingsUI();
                return;
            }
        }
        catch { }
#endif
        await InitAsync();
    }

#if IOS
    private async Task<bool> EnsureCameraPermissioniOSAsync()
    {
        var status = AVCaptureDevice.GetAuthorizationStatus(AVAuthorizationMediaType.Video);
        if (status == AVAuthorizationStatus.NotDetermined)
        {
            var tcs = new TaskCompletionSource<bool>();
            AVCaptureDevice.RequestAccessForMediaType(AVAuthorizationMediaType.Video, granted => tcs.TrySetResult(granted));
            var granted = await tcs.Task.ConfigureAwait(true);
            if (!granted)
            {
                await DisplayAlert("Camera Permission",
                    "Camera access is required to display the measurement view.",
                    "OK");
                return false;
            }
            return true;
        }
        if (status == AVAuthorizationStatus.Authorized)
            return true;

        var open = await DisplayAlert("Camera Permission",
            "Camera access is disabled for this app. Please enable it in Settings.",
            "Open Settings", "Cancel");
        if (open)
        {
            var url = new NSUrl(UIApplication.OpenSettingsUrlString);
            if (UIApplication.SharedApplication.CanOpenUrl(url))
                UIApplication.SharedApplication.OpenUrl(url);
        }
        return false;
    }
#endif

    private async Task InitAsync()
    {
        _sub?.Dispose();
        _sub = ShenaiSdk.Events.Subscribe(e =>
        {
            Debug.WriteLine($"Shen.AI event: {e.Name}");
        });

        var init = await ShenaiSdk.InitializeAsync(API_KEY, USER_ID, new InitializationSettings
        {
            ShowUserInterface = true,

            EnableHealthRisks = true,
            MeasurementPreset = MeasurementPreset.FOURTY_FIVE_SECONDS_UNVALIDATED,

            ShowFacePositioningOverlay = true,
            ShowVisualWarnings = true,
            ShowSignalQualityIndicator = true,
            ShowSignalTile = true,
            ShowStartStopButton = true,
            ShowInfoButton = true,
            ShowTrialMetricLabels = false,

            EnableCameraSwap = true
        });

        if (init == InitializationResult.OK)
        {
        }
        else
        {
            await DisplayAlert("Shen.AI", $"License activation error: {init}", "OK");
        }
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        _sub?.Dispose();
        _sub = null;
    }
}
