using System.Reflection;
using Shenai.Maui;
#if IOS
using AVFoundation;
using Foundation;
using UIKit;
#endif

namespace Shenai.Maui.Flow;

public partial class MainPage : ContentPage
{
    private const string MissingApiKeyMessage = "Missing SHENAI_API_KEY. Build with -p:ShenaiApiKey=<your-api-key>.";
    private IDisposable? _eventsSubscription;
    private FlowConfig? _activeFlow;
    private Label? _statusLabel;
    private Label? _pdfStatusLabel;
    private bool _opening;

    public MainPage()
    {
        InitializeComponent();
        ShowHome();
    }

    protected override async void OnDisappearing()
    {
        base.OnDisappearing();
        try
        {
            await ShenaiSdk.SetCameraModeAsync(CameraMode.OFF);
        }
        catch
        {
            // The example can disappear before the SDK has been initialized.
        }
    }

    private void ShowHome(string status = "")
    {
        _activeFlow = null;
        _eventsSubscription?.Dispose();
        _eventsSubscription = null;
        _statusLabel = new Label
        {
            Text = string.IsNullOrWhiteSpace(status) && !HasApiKey ? MissingApiKeyMessage : status,
            TextColor = Colors.Black,
            HorizontalTextAlignment = TextAlignment.Center
        };

        Root.Children.Clear();
        Root.Children.Add(new VerticalStackLayout
        {
            Padding = 24,
            Spacing = 12,
            VerticalOptions = LayoutOptions.Center,
            HorizontalOptions = LayoutOptions.Fill,
            MaximumWidthRequest = 360,
            Children =
            {
                new Label
                {
                    Text = "Shen.AI Flow",
                    FontSize = 24,
                    FontAttributes = FontAttributes.Bold,
                    TextColor = Colors.Black,
                    HorizontalTextAlignment = TextAlignment.Center,
                    Margin = new Thickness(0, 0, 0, 20)
                },
                _statusLabel,
                HomeButton("Dashboard", async () => await OpenFlowAsync(DashboardFlow)),
                HomeButton("Measurement", async () => await OpenFlowAsync(MeasurementFlow))
            }
        });
    }

    private static Button HomeButton(string text, Func<Task> onClick)
    {
        var button = new Button
        {
            Text = text,
            HeightRequest = 54,
            BackgroundColor = Colors.White,
            BorderColor = Colors.Black,
            BorderWidth = 1,
            TextColor = Colors.Black,
            CornerRadius = 8
        };
        button.Clicked += async (_, _) => await onClick();
        return button;
    }

    private async Task OpenFlowAsync(FlowConfig flow)
    {
        if (_opening)
        {
            return;
        }
        if (!HasApiKey)
        {
            SetStatus(MissingApiKeyMessage);
            return;
        }
        _opening = true;
        if (_statusLabel != null)
        {
            _statusLabel.Text = "Initializing SDK...";
        }

        try
        {
            if (!await EnsureCameraPermissionAsync())
            {
                return;
            }
            if (await ShenaiSdk.IsInitializedAsync())
            {
                await ShenaiSdk.DeinitializeAsync();
            }
            var result = await ShenaiSdk.InitializeAsync(ApiKey, "", UiFlowSettings(flow));
            if (result != InitializationResult.OK)
            {
                if (_statusLabel != null)
                {
                    _statusLabel.Text = $"Initialization failed: {result}";
                }
                return;
            }
            if (flow.ResetMeasurement)
            {
                await ShenaiSdk.ResetMeasurementSessionAsync();
                await ShenaiSdk.SetEnableMeasurementsDashboardAsync(false);
            }
            if (flow.InitialScreen.HasValue)
            {
                await ShenaiSdk.SetScreenAsync(flow.InitialScreen.Value);
            }
            _activeFlow = flow;
            _eventsSubscription = ShenaiSdk.Events.Subscribe(e =>
            {
                if (e.Name == EventName.USER_FLOW_FINISHED)
                {
                    MainThread.BeginInvokeOnMainThread(async () => await OnUserFlowFinishedAsync());
                }
            });
            ShowSdkView();
        }
        finally
        {
            _opening = false;
        }
    }

    private static string ApiKey => GetAssemblyMetadata("SHENAI_API_KEY");

    private bool HasApiKey => !string.IsNullOrWhiteSpace(ApiKey);

    private void SetStatus(string value)
    {
        if (_statusLabel != null)
        {
            _statusLabel.Text = value;
        }
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

    private void ShowSdkView()
    {
        Root.Children.Clear();
        Root.Children.Add(new ShenaiSdkView
        {
            VerticalOptions = LayoutOptions.Fill,
            HorizontalOptions = LayoutOptions.Fill
        });
    }

    private async Task OnUserFlowFinishedAsync()
    {
        if (_activeFlow?.ShowPdfActionsAfterFinish == true &&
            await ShenaiSdk.GetMeasurementResultsAsync() != null)
        {
            await ShenaiSdk.SetCameraModeAsync(CameraMode.OFF);
            ShowPdfActions();
            return;
        }
        await FinishFlowAsync();
    }

    private void ShowPdfActions()
    {
        _pdfStatusLabel = new Label
        {
            Text = "Measurement finished. Open the PDF report.",
            TextColor = Colors.Black,
            HorizontalTextAlignment = TextAlignment.Center
        };

        Root.Children.Clear();
        Root.Children.Add(new ScrollView
        {
            Content = new VerticalStackLayout
            {
                Padding = 24,
                Spacing = 12,
                VerticalOptions = LayoutOptions.Center,
                HorizontalOptions = LayoutOptions.Fill,
                MaximumWidthRequest = 360,
                Children =
                {
                    new Label
                    {
                        Text = "Measurement PDF",
                        FontSize = 24,
                        FontAttributes = FontAttributes.Bold,
                        TextColor = Colors.Black,
                        HorizontalTextAlignment = TextAlignment.Center,
                        Margin = new Thickness(0, 0, 0, 20)
                    },
                    _pdfStatusLabel,
                    HomeButton("Open PDF", async () =>
                    {
                        await ShenaiSdk.OpenMeasurementResultsPdfInBrowserAsync();
                        SetPdfStatus("PDF open request sent.");
                    }),
                    FilledButton("Finish", FinishFlowAsync)
                }
            }
        });
    }

    private void SetPdfStatus(string value)
    {
        if (_pdfStatusLabel != null)
        {
            _pdfStatusLabel.Text = value;
        }
    }

    private static Button FilledButton(string text, Func<Task> onClick)
    {
        var button = HomeButton(text, onClick);
        button.BackgroundColor = Colors.Black;
        button.TextColor = Colors.White;
        return button;
    }

    private async Task FinishFlowAsync()
    {
        _eventsSubscription?.Dispose();
        _eventsSubscription = null;
        await ShenaiSdk.DeinitializeAsync();
        ShowHome();
    }

    private static InitializationSettings UiFlowSettings(FlowConfig flow) => new()
    {
        PrecisionMode = PrecisionMode.RELAXED,
        OperatingMode = OperatingMode.MEASURE,
        MeasurementPreset = MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
        CameraMode = CameraMode.FACING_USER,
        OnboardingMode = OnboardingMode.HIDDEN,
        ShowUserInterface = true,
        ShowFacePositioningOverlay = true,
        ShowVisualWarnings = true,
        EnableCameraSwap = true,
        ShowFaceMask = true,
        ShowBloodFlow = true,
        EnableStartAfterSuccess = false,
        EnableSummaryScreen = !flow.DashboardOnly,
        ShowResultsFinishButton = !flow.DashboardOnly,
        EnableHealthRisks = true,
        ShowHealthIndicesFinishButton = !flow.DashboardOnly,
        SaveHealthRisksFactors = true,
        ShowOutOfRangeResultIndicators = true,
        ApplyPrecisionModeToBloodPressure = false,
        ShowSignalQualityIndicator = true,
        ShowSignalTile = true,
        ShowStartStopButton = !flow.DashboardOnly,
        ShowInfoButton = !flow.DashboardOnly,
        ShowDisclaimer = !flow.DashboardOnly,
        EnableMeasurementsDashboard = false,
        UiVersion = UiVersion.V2,
        UiFlowScreens = flow.Screens,
        RisksFactors = ExampleRiskFactors()
    };

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

    private sealed record FlowConfig(
        Screen? InitialScreen,
        IReadOnlyList<Screen> Screens,
        bool DashboardOnly,
        bool ResetMeasurement,
        bool ShowPdfActionsAfterFinish);

    private static readonly FlowConfig DashboardFlow = new(
        null,
        new[] { Screen.DASHBOARD },
        true,
        false,
        false);

    private static readonly FlowConfig MeasurementFlow = new(
        Screen.MEASUREMENT,
        new[] { Screen.MEASUREMENT, Screen.RESULTS, Screen.HEALTH_RISKS },
        false,
        true,
        true);
}
