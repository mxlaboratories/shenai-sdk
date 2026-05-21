using System.Reflection;
using Shenai.Maui;
#if IOS
using AVFoundation;
using Foundation;
using UIKit;
#endif

namespace Shenai.Maui.Minimal;

public partial class MainPage : ContentPage
{
    private bool _initialized;
    private bool _appeared;

    public MainPage()
    {
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (_appeared)
        {
            await SetCameraAsync(CameraMode.FACING_USER);
            return;
        }
        _appeared = true;
        if (!HasApiKey)
        {
            ShowMissingApiKey();
            return;
        }
        if (await EnsureCameraPermissionAsync())
        {
            await InitializeSdkAsync();
        }
    }

    protected override async void OnDisappearing()
    {
        base.OnDisappearing();
        await SetCameraAsync(CameraMode.OFF);
    }

    private async void OnToggleClicked(object sender, EventArgs e)
    {
        if (_initialized)
        {
            await DeinitializeSdkAsync();
        }
        else if (!HasApiKey)
        {
            ShowMissingApiKey();
        }
        else if (await EnsureCameraPermissionAsync())
        {
            await InitializeSdkAsync();
        }
    }

    private async Task InitializeSdkAsync()
    {
        if (!HasApiKey)
        {
            ShowMissingApiKey();
            return;
        }
        StatusLabel.IsVisible = true;
        StatusLabel.Text = "Initializing SDK...";
        var result = await ShenaiSdk.InitializeAsync(ApiKey, "", MinimalSettings());
        _initialized = result == InitializationResult.OK;
        ToggleButton.Text = _initialized ? "Deinitialize" : "Initialize";
        StatusLabel.Text = _initialized ? "" : $"Initialization failed: {result}";
        StatusLabel.IsVisible = !_initialized;
        if (_initialized)
        {
            await SetCameraAsync(CameraMode.FACING_USER);
        }
    }

    private async Task DeinitializeSdkAsync()
    {
        await ShenaiSdk.DeinitializeAsync();
        _initialized = false;
        ToggleButton.Text = "Initialize";
        StatusLabel.Text = "SDK deinitialized";
        StatusLabel.IsVisible = true;
    }

    private async Task SetCameraAsync(CameraMode mode)
    {
        if (_initialized)
        {
            await ShenaiSdk.SetCameraModeAsync(mode);
        }
    }

    private static InitializationSettings MinimalSettings() => new()
    {
        PrecisionMode = PrecisionMode.RELAXED,
        OperatingMode = OperatingMode.MEASURE,
        MeasurementPreset = MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
        CameraMode = CameraMode.FACING_USER,
        OnboardingMode = OnboardingMode.SHOW_ONCE,
        ShowUserInterface = true,
        ShowFacePositioningOverlay = true,
        ShowVisualWarnings = true,
        EnableCameraSwap = true,
        ShowFaceMask = true,
        ShowBloodFlow = true,
        EnableStartAfterSuccess = false,
        EnableSummaryScreen = true,
        ShowResultsFinishButton = true,
        EnableHealthRisks = true,
        ShowHealthIndicesFinishButton = true,
        SaveHealthRisksFactors = true,
        ShowOutOfRangeResultIndicators = true,
        ApplyPrecisionModeToBloodPressure = false,
        ShowSignalQualityIndicator = true,
        ShowSignalTile = true,
        ShowStartStopButton = true,
        ShowInfoButton = true,
        ShowDisclaimer = true,
        UiVersion = UiVersion.V2,
        RisksFactors = ExampleRiskFactors()
    };

    private static string ApiKey => GetAssemblyMetadata("SHENAI_API_KEY");

    private bool HasApiKey => !string.IsNullOrWhiteSpace(ApiKey);

    private void ShowMissingApiKey()
    {
        _initialized = false;
        ToggleButton.Text = "Initialize";
        StatusLabel.Text = "Missing SHENAI_API_KEY. Build with -p:ShenaiApiKey=<your-api-key>.";
        StatusLabel.IsVisible = true;
    }

    private static string GetAssemblyMetadata(string key)
    {
        foreach (var attribute in Assembly.GetExecutingAssembly().GetCustomAttributes<AssemblyMetadataAttribute>())
        {
            if (attribute.Key == key)
            {
                return attribute.Value ?? string.Empty;
            }
        }
        return string.Empty;
    }

    private static RisksFactors ExampleRiskFactors() => new()
    {
        Age = 45,
        Cholesterol = 190,
        CholesterolHdl = 52,
        Sbp = 128,
        Dbp = 82,
        IsSmoker = false,
        HypertensionTreatment = HypertensionTreatment.NO,
        HasDiabetes = false,
        BodyHeight = 172,
        BodyWeight = 74,
        WaistCircumference = 84,
        NeckCircumference = 38,
        HipCircumference = 98,
        Gender = Gender.FEMALE,
        PhysicalActivity = PhysicalActivity.MODERATELY,
        Country = "US",
        Race = Race.WHITE,
        VegetableFruitDiet = true,
        HistoryOfHighGlucose = false,
        HistoryOfHypertension = false,
        Triglyceride = 120,
        FastingGlucose = 92,
        FamilyDiabetes = FamilyHistory.NONE_FIRST_DEGREE,
        ParentalHypertension = ParentalHistory.NONE
    };

    private async Task<bool> EnsureCameraPermissionAsync()
    {
#if IOS
        var status = AVCaptureDevice.GetAuthorizationStatus(AVAuthorizationMediaType.Video);
        if (status == AVAuthorizationStatus.NotDetermined)
        {
            var tcs = new TaskCompletionSource<bool>();
            AVCaptureDevice.RequestAccessForMediaType(AVAuthorizationMediaType.Video, granted => tcs.TrySetResult(granted));
            return await tcs.Task.ConfigureAwait(true);
        }
        if (status == AVAuthorizationStatus.Authorized)
        {
            return true;
        }
        var open = await DisplayAlert("Camera Permission", "Camera access is required.", "Open Settings", "Cancel");
        if (open)
        {
            var url = new NSUrl(UIApplication.OpenSettingsUrlString);
            if (UIApplication.SharedApplication.CanOpenUrl(url))
            {
                UIApplication.SharedApplication.OpenUrl(url);
            }
        }
        return false;
#else
        var status = await Permissions.CheckStatusAsync<Permissions.Camera>();
        if (status != PermissionStatus.Granted)
        {
            status = await Permissions.RequestAsync<Permissions.Camera>();
        }
        if (status == PermissionStatus.Granted)
        {
            return true;
        }
        var open = await DisplayAlert("Camera Permission", "Camera access is required.", "Open Settings", "Cancel");
        if (open)
        {
            AppInfo.ShowSettingsUI();
        }
        return false;
#endif
    }
}
