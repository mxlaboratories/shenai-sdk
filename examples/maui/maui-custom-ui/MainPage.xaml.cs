using System.Reflection;
using Shenai.Maui;
using Microsoft.Maui.Controls.Shapes;
#if IOS
using AVFoundation;
using Foundation;
using UIKit;
#endif

namespace Shenai.Maui.CustomUi;

public partial class MainPage : ContentPage
{
    private const string MissingApiKeyMessage = "Missing SHENAI_API_KEY. Build with -p:ShenaiApiKey=<your-api-key>.";
    private const double CameraDiameter = 260;
    private const double PortraitCameraAspectRatio = 9d / 16d;
    private readonly Profile _profile = Profile.Default();
    private readonly Dictionary<string, Entry> _entries = new();
    private readonly Dictionary<string, Switch> _switches = new();
    private readonly Dictionary<string, Picker> _pickers = new();
    private readonly IDispatcherTimer _pollTimer;
    private Grid? _cameraCircle;
    private Grid? _cameraContent;
    private Label? _sdkStatusLabel;
    private Label? _measurementStatusLabel;
    private Label? _progressLabel;
    private Grid? _progressTrack;
    private BoxView? _progressFill;
    private VerticalStackLayout? _qualityRows;
    private Grid? _headlineGrid;
    private Button? _startButton;
    private Button? _stopButton;
    private Button? _seeResultsButton;
    private AppScreen _currentScreen = AppScreen.Measurement;
    private AppScreen _profileReturnScreen = AppScreen.Measurement;
    private bool _initialized;
    private bool _polling;
    private bool _resettingMeasurement;
    private bool _hasReachedFinalizing;
    private bool _hasFinishedMeasurement;
    private double _progress;
    private MeasurementState? _measurementState;
    private MeasurementEnvironmentCondition? _violatedCondition;
    private MeasurementResults? _realtimeMetrics;
    private MeasurementResults? _results;
    private HealthRisks? _risks;
    private int _measurementResetGeneration;

    public MainPage()
    {
        InitializeComponent();
        _pollTimer = Dispatcher.CreateTimer();
        _pollTimer.Interval = TimeSpan.FromMilliseconds(200);
        _pollTimer.Tick += async (_, _) => await RefreshSdkStateAsync();
        ShowMeasurementScreen();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (!HasApiKey)
        {
            ShowMissingApiKey();
            return;
        }
        if (!_initialized && await EnsureCameraPermissionAsync())
        {
            await InitializeSdkAsync();
        }
        else if (_initialized && _currentScreen == AppScreen.Measurement)
        {
            await ShowCameraAsync(true);
        }
    }

    protected override async void OnDisappearing()
    {
        base.OnDisappearing();
        await ShowCameraAsync(false);
    }

    private void ShowMeasurementScreen()
    {
        _currentScreen = AppScreen.Measurement;
        _sdkStatusLabel = Label(_initialized ? "SDK initialized" : "SDK not initialized", 14);
        if (!HasApiKey)
        {
            _sdkStatusLabel.Text = MissingApiKeyMessage;
        }
        _measurementStatusLabel = Label("Ready", 14);
        _progressLabel = Label("0%", 14);
        _headlineGrid = new Grid { ColumnSpacing = 8, RowSpacing = 8 };
        _qualityRows = new VerticalStackLayout { Spacing = 8 };
        _startButton = OutlineButton("Start");
        _stopButton = OutlineButton("Stop");
        _seeResultsButton = FilledButton("SEE RESULTS");
        _startButton.Clicked += async (_, _) => await StartMeasurementAsync();
        _stopButton.Clicked += async (_, _) => await StopMeasurementAsync();
        _seeResultsButton.Clicked += async (_, _) => await ShowResultsScreenAsync();
        _stopButton.IsEnabled = false;
        _seeResultsButton.IsVisible = false;

        var header = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Auto)
            }
        };
        header.Add(Label("Custom UI", 22, false, true), 0, 0);
        header.Add(TextButton("Health form", async () => await ShowProfileScreenAsync(AppScreen.Measurement)), 1, 0);

        _cameraContent = new Grid
        {
            BackgroundColor = Color.FromArgb("#EDEDED"),
            WidthRequest = CameraDiameter,
            HeightRequest = CameraDiameter,
            Clip = new EllipseGeometry
            {
                Center = new Point(CameraDiameter / 2, CameraDiameter / 2),
                RadiusX = CameraDiameter / 2,
                RadiusY = CameraDiameter / 2
            }
        };
        SetCameraPlaceholder("Camera paused");

        _cameraCircle = new Grid
        {
            WidthRequest = CameraDiameter,
            HeightRequest = CameraDiameter,
            HorizontalOptions = LayoutOptions.Center,
            Children =
            {
                _cameraContent,
                new Border
                {
                    Stroke = Colors.Black,
                    StrokeThickness = 2,
                    StrokeShape = new RoundRectangle { CornerRadius = CameraDiameter / 2 },
                    InputTransparent = true
                }
            }
        };

        var progress = BuildTrack(out _progressTrack, out _progressFill);
        var actions = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Star)
            },
            ColumnSpacing = 10
        };
        actions.Add(_startButton, 0, 0);
        actions.Add(_stopButton, 1, 0);

        Root.Children.Clear();
        Root.Children.Add(new ScrollView
        {
            Content = new VerticalStackLayout
            {
                Padding = 20,
                Spacing = 18,
                Children =
                {
                    header,
                    _sdkStatusLabel,
                    _cameraCircle,
                    progress,
                    _measurementStatusLabel,
                    _qualityRows,
                    actions,
                    _seeResultsButton,
                    _headlineGrid
                }
            }
        });
        RenderGrid(_headlineGrid, HeadlineValues(_results ?? _realtimeMetrics));
        RenderQualityRows(_qualityRows, "Live quality", _results ?? _realtimeMetrics);
        UpdateMeasurementLine(_measurementState);
        UpdateMeasurementButtons();
    }

    private void SetCameraPlaceholder(string text)
    {
        if (_cameraContent == null)
        {
            return;
        }
        _cameraContent.Children.Clear();
        _cameraContent.Children.Add(Label(text, 14, true));
    }

    private void SetCameraPreview()
    {
        if (_cameraContent == null)
        {
            return;
        }
        _cameraContent.Children.Clear();
        _cameraContent.Children.Add(new ShenaiSdkView
        {
            WidthRequest = CameraDiameter,
            HeightRequest = CameraDiameter / PortraitCameraAspectRatio,
            VerticalOptions = LayoutOptions.Center,
            HorizontalOptions = LayoutOptions.Center
        });
    }

    private async Task ShowProfileScreenAsync(AppScreen returnScreen)
    {
        _currentScreen = AppScreen.Profile;
        _profileReturnScreen = returnScreen;
        await ShowCameraAsync(false);

        var header = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Auto),
                new ColumnDefinition(GridLength.Star)
            }
        };
        header.Add(TextButton("Back", async () => await ReturnFromProfileAsync()), 0, 0);
        header.Add(Label("Health form", 22, true, true), 1, 0);

        Root.Children.Clear();
        Root.Children.Add(new ScrollView
        {
            Content = new VerticalStackLayout
            {
                Padding = 20,
                Spacing = 18,
                Children =
                {
                    header,
                    BuildProfileForm(async () => await ReturnFromProfileAsync())
                }
            }
        });
    }

    private async Task ReturnFromProfileAsync()
    {
        if (_profileReturnScreen == AppScreen.Results)
        {
            await ShowResultsScreenAsync();
            return;
        }
        ShowMeasurementScreen();
        await ShowCameraAsync(true);
        await RefreshSdkStateAsync();
    }

    private async Task ShowResultsScreenAsync()
    {
        if (_results == null)
        {
            return;
        }
        _currentScreen = AppScreen.Results;
        await ShowCameraAsync(false);
        var metricsGrid = new Grid { ColumnSpacing = 8, RowSpacing = 8 };
        var risksGrid = new Grid { ColumnSpacing = 8, RowSpacing = 8 };
        RenderGrid(metricsGrid, MeasurementValues(_results));
        RenderGrid(risksGrid, RiskValues(_risks));
        var header = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Auto),
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Auto)
            }
        };
        header.Add(TextButton("Back", async () =>
        {
            ShowMeasurementScreen();
            await ShowCameraAsync(true);
            await RefreshSdkStateAsync();
        }), 0, 0);
        header.Add(Label("Results", 22, true, true), 1, 0);
        header.Add(TextButton("Health form", async () => await ShowProfileScreenAsync(AppScreen.Results)), 2, 0);

        Root.Children.Clear();
        Root.Children.Add(new ScrollView
        {
            Content = new VerticalStackLayout
            {
                Padding = 20,
                Spacing = 18,
                Children =
                {
                    header,
                    BuildQualityRows("Measurement quality", _results),
                    metricsGrid,
                    Label("Health indices", 18, false, true),
                    risksGrid
                }
            }
        });
    }

    private View BuildProfileForm(Func<Task> onSaved)
    {
        var stack = new VerticalStackLayout { Spacing = 12 };
        var fields = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Star)
            },
            ColumnSpacing = 10,
            RowSpacing = 10
        };

        AddEntry(fields, "Age", nameof(Profile.Age), _profile.Age.ToString(), 0);
        AddEntry(fields, "Height cm", nameof(Profile.BodyHeight), _profile.BodyHeight.ToString(), 1);
        AddEntry(fields, "Weight kg", nameof(Profile.BodyWeight), _profile.BodyWeight.ToString(), 2);
        AddEntry(fields, "Waist cm", nameof(Profile.WaistCircumference), _profile.WaistCircumference.ToString(), 3);
        AddEntry(fields, "Neck cm", nameof(Profile.NeckCircumference), _profile.NeckCircumference.ToString(), 4);
        AddEntry(fields, "Hip cm", nameof(Profile.HipCircumference), _profile.HipCircumference.ToString(), 5);
        AddEntry(fields, "Cholesterol", nameof(Profile.Cholesterol), _profile.Cholesterol.ToString(), 6);
        AddEntry(fields, "HDL", nameof(Profile.CholesterolHdl), _profile.CholesterolHdl.ToString(), 7);
        AddEntry(fields, "Triglyceride", nameof(Profile.Triglyceride), _profile.Triglyceride.ToString(), 8);
        AddEntry(fields, "Fasting glucose", nameof(Profile.FastingGlucose), _profile.FastingGlucose.ToString(), 9);
        AddEntry(fields, "SBP", nameof(Profile.Sbp), _profile.Sbp.ToString(), 10);
        AddEntry(fields, "DBP", nameof(Profile.Dbp), _profile.Dbp.ToString(), 11);
        stack.Children.Add(fields);

        AddEntry(stack, "Country", nameof(Profile.Country), _profile.Country);
        AddPicker(stack, "Gender", nameof(Profile.Gender), Enum.GetNames<Gender>(), _profile.Gender.ToString());
        AddPicker(stack, "Activity", nameof(Profile.PhysicalActivity), Enum.GetNames<PhysicalActivity>(), _profile.PhysicalActivity.ToString());
        AddPicker(stack, "Race", nameof(Profile.Race), Enum.GetNames<Race>(), _profile.Race.ToString());
        AddPicker(stack, "Treatment", nameof(Profile.HypertensionTreatment), Enum.GetNames<HypertensionTreatment>(), _profile.HypertensionTreatment.ToString());
        AddPicker(stack, "Family diabetes", nameof(Profile.FamilyDiabetes), Enum.GetNames<FamilyHistory>(), _profile.FamilyDiabetes.ToString());
        AddPicker(stack, "Parental hypertension", nameof(Profile.ParentalHypertension), Enum.GetNames<ParentalHistory>(), _profile.ParentalHypertension.ToString());
        AddSwitch(stack, "Smoker", nameof(Profile.IsSmoker), _profile.IsSmoker);
        AddSwitch(stack, "Diabetes", nameof(Profile.HasDiabetes), _profile.HasDiabetes);
        AddSwitch(stack, "Fruit and vegetables", nameof(Profile.VegetableFruitDiet), _profile.VegetableFruitDiet);
        AddSwitch(stack, "High glucose history", nameof(Profile.HistoryOfHighGlucose), _profile.HistoryOfHighGlucose);
        AddSwitch(stack, "Hypertension history", nameof(Profile.HistoryOfHypertension), _profile.HistoryOfHypertension);

        var save = FilledButton("Save profile");
        save.Clicked += async (_, _) =>
        {
            ReadProfile();
            await ComputeRisksAsync();
            await onSaved();
        };
        stack.Children.Add(save);
        return stack;
    }

    private async Task InitializeSdkAsync()
    {
        if (!HasApiKey)
        {
            ShowMissingApiKey();
            return;
        }
        if (_sdkStatusLabel != null)
        {
            _sdkStatusLabel.Text = "Initializing SDK...";
        }
        var result = await ShenaiSdk.InitializeAsync(ApiKey, "", CustomUiSettings());
        _initialized = result == InitializationResult.OK;
        if (_sdkStatusLabel != null)
        {
            _sdkStatusLabel.Text = _initialized ? "SDK initialized" : $"Initialization failed: {result}";
        }
        if (_initialized)
        {
            await ShowCameraAsync(true);
            _pollTimer.Start();
        }
    }

    private static string ApiKey => GetAssemblyMetadata("SHENAI_API_KEY");

    private bool HasApiKey => !string.IsNullOrWhiteSpace(ApiKey);

    private void ShowMissingApiKey()
    {
        _initialized = false;
        if (_sdkStatusLabel != null)
        {
            _sdkStatusLabel.Text = MissingApiKeyMessage;
        }
        UpdateMeasurementButtons();
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

    private async Task StartMeasurementAsync()
    {
        if (!_initialized)
        {
            return;
        }
        ReadProfile();
        _resettingMeasurement = true;
        try
        {
            ResetMeasurementUiState();
            await ShenaiSdk.ResetMeasurementSessionAsync();
            await ShenaiSdk.SetOperatingModeAsync(OperatingMode.MEASURE);
            await ShowCameraAsync(true);
            await ShenaiSdk.StartMeasurementAsync();
            _measurementState = MeasurementState.WAITING_FOR_FACE;
            if (_measurementStatusLabel != null) _measurementStatusLabel.Text = "Waiting for face - 0%";
            UpdateMeasurementButtons();
        }
        finally
        {
            _resettingMeasurement = false;
        }
        await RefreshSdkStateAsync();
    }

    private async Task StopMeasurementAsync()
    {
        if (!_initialized)
        {
            return;
        }
        _resettingMeasurement = true;
        try
        {
            await ShenaiSdk.ResetMeasurementSessionAsync();
            await ShowCameraAsync(true);
            ResetMeasurementUiState();
        }
        finally
        {
            _resettingMeasurement = false;
        }
    }

    private async Task RefreshSdkStateAsync()
    {
        if (_polling || _resettingMeasurement || !_initialized)
        {
            return;
        }
        var resetGeneration = _measurementResetGeneration;
        _polling = true;
        try
        {
            var state = await ShenaiSdk.GetMeasurementStateAsync();
            var progress = await ShenaiSdk.GetMeasurementProgressPercentageAsync();
            var violatedCondition = await ShenaiSdk.GetCurrentViolatedMeasurementEnvironmentConditionAsync();
            var realtime = await ShenaiSdk.GetRealtimeMetricsAsync(10);
            if (_resettingMeasurement || resetGeneration != _measurementResetGeneration)
            {
                return;
            }
            _measurementState = state;
            if (state == MeasurementState.FINALIZING)
            {
                _hasReachedFinalizing = true;
            }
            var liveMeasurementState = IsRunningMeasurementState(state);
            _progress = progress;
            _violatedCondition = violatedCondition;
            _realtimeMetrics = liveMeasurementState ? realtime ?? _realtimeMetrics : null;
            UpdateProgress(progress);
            RenderQualityRows(_qualityRows, "Live quality", _results ?? _realtimeMetrics);
            UpdateMeasurementLine(state);
            RenderGrid(_headlineGrid, HeadlineValues(_results ?? _realtimeMetrics));

            if (state == MeasurementState.FINISHED && !_hasFinishedMeasurement)
            {
                await CompleteMeasurementAsync();
            }
        }
        finally
        {
            _polling = false;
        }
    }

    private void ResetMeasurementUiState()
    {
        _measurementResetGeneration++;
        _measurementState = null;
        _violatedCondition = null;
        _realtimeMetrics = null;
        _results = null;
        _risks = null;
        _progress = 0;
        _hasReachedFinalizing = false;
        _hasFinishedMeasurement = false;
        if (_seeResultsButton != null) _seeResultsButton.IsVisible = false;
        if (_measurementStatusLabel != null) _measurementStatusLabel.Text = "Ready - 0%";
        UpdateMeasurementButtons();
        UpdateProgress(0);
        RenderQualityRows(_qualityRows, "Live quality", null);
        RenderGrid(_headlineGrid, HeadlineValues(null));
    }

    private async Task CompleteMeasurementAsync()
    {
        _results = await ShenaiSdk.GetMeasurementResultsAsync();
        await ComputeRisksAsync();
        _hasFinishedMeasurement = true;
        if (_measurementStatusLabel != null) _measurementStatusLabel.Text = "Measurement finished";
        UpdateMeasurementButtons();
        if (_seeResultsButton != null) _seeResultsButton.IsVisible = true;
        RenderQualityRows(_qualityRows, "Live quality", _results);
        RenderGrid(_headlineGrid, HeadlineValues(_results));
    }

    private async Task ComputeRisksAsync()
    {
        if (_results != null)
        {
            _risks = await ShenaiSdk.ComputeHealthRisksAsync(ToRisksFactors(_results));
        }
    }

    private async Task ShowCameraAsync(bool show)
    {
        if (!_initialized || _cameraContent == null)
        {
            return;
        }
        if (show)
        {
            SetCameraPreview();
            await ShenaiSdk.SetCameraModeAsync(CameraMode.FACING_USER);
        }
        else
        {
            await ShenaiSdk.SetCameraModeAsync(CameraMode.OFF);
            SetCameraPlaceholder(_hasFinishedMeasurement ? "Measurement finished" : "Camera paused");
        }
    }

    private string MeasurementStatusText(MeasurementState? state, MeasurementEnvironmentCondition? condition)
    {
        if (_hasFinishedMeasurement || state == MeasurementState.FINISHED)
        {
            return "Measurement finished";
        }
        if (_hasReachedFinalizing || state == MeasurementState.FINALIZING)
        {
            return "Finalizing";
        }
        if (condition.HasValue)
        {
            return ConditionInstruction(condition.Value);
        }
        return state switch
        {
            MeasurementState.WAITING_FOR_FACE => "Waiting for face",
            MeasurementState.RUNNING_SIGNAL_SHORT
                or MeasurementState.RUNNING_SIGNAL_GOOD
                or MeasurementState.RUNNING_SIGNAL_BAD
                or MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE => "Measurement conditions are good",
            MeasurementState.FAILED => "Measurement failed",
            _ => "Ready"
        };
    }

    private static string ConditionInstruction(MeasurementEnvironmentCondition condition) => condition switch
    {
        MeasurementEnvironmentCondition.FACE_POSITION => "Uncover your forehead",
        MeasurementEnvironmentCondition.FOREHEAD_VISIBLE => "Uncover your forehead",
        MeasurementEnvironmentCondition.GLASSES_NOT_DETECTED => "Remove your glasses",
        MeasurementEnvironmentCondition.SUFFICIENT_LIGHT_LEVEL => "Move to brighter light",
        MeasurementEnvironmentCondition.EVEN_LIGHTING => "Use even lighting",
        MeasurementEnvironmentCondition.NO_BACKLIGHT => "Avoid backlight",
        MeasurementEnvironmentCondition.FACE_STABLE => "Keep your face still",
        MeasurementEnvironmentCondition.DEVICE_STABLE => "Keep the phone still",
        _ => "Measurement conditions need attention"
    };

    private static bool IsRunningMeasurementState(MeasurementState? state) =>
        state is MeasurementState.WAITING_FOR_FACE
            or MeasurementState.RUNNING_SIGNAL_SHORT
            or MeasurementState.RUNNING_SIGNAL_GOOD
            or MeasurementState.RUNNING_SIGNAL_BAD
            or MeasurementState.RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE
            or MeasurementState.FINALIZING;

    private InitializationSettings CustomUiSettings() => new()
    {
        PrecisionMode = PrecisionMode.RELAXED,
        OperatingMode = OperatingMode.MEASURE,
        MeasurementPreset = MeasurementPreset.THIRTY_SECONDS_ALL_METRICS,
        CameraMode = CameraMode.FACING_USER,
        OnboardingMode = OnboardingMode.HIDDEN,
        ShowUserInterface = false,
        ShowFacePositioningOverlay = false,
        ShowVisualWarnings = false,
        EnableCameraSwap = false,
        ShowFaceMask = true,
        ShowBloodFlow = false,
        EnableStartAfterSuccess = false,
        EnableSummaryScreen = false,
        ShowResultsFinishButton = false,
        EnableHealthRisks = true,
        ShowHealthIndicesFinishButton = false,
        SaveHealthRisksFactors = true,
        ShowOutOfRangeResultIndicators = false,
        ApplyPrecisionModeToBloodPressure = false,
        ShowSignalQualityIndicator = false,
        ShowSignalTile = false,
        ShowStartStopButton = false,
        ShowInfoButton = false,
        ShowDisclaimer = false,
        UiVersion = UiVersion.V2,
        RisksFactors = ToRisksFactors(null)
    };

    private RisksFactors ToRisksFactors(MeasurementResults? results) => new()
    {
        Age = _profile.Age,
        Cholesterol = _profile.Cholesterol,
        CholesterolHdl = _profile.CholesterolHdl,
        Sbp = results?.SystolicBloodPressureMmhg ?? _profile.Sbp,
        Dbp = results?.DiastolicBloodPressureMmhg ?? _profile.Dbp,
        IsSmoker = _profile.IsSmoker,
        HypertensionTreatment = _profile.HypertensionTreatment,
        HasDiabetes = _profile.HasDiabetes,
        BodyHeight = _profile.BodyHeight,
        BodyWeight = _profile.BodyWeight,
        WaistCircumference = _profile.WaistCircumference,
        NeckCircumference = _profile.NeckCircumference,
        HipCircumference = _profile.HipCircumference,
        Gender = _profile.Gender,
        PhysicalActivity = _profile.PhysicalActivity,
        Country = _profile.Country,
        Race = _profile.Race,
        VegetableFruitDiet = _profile.VegetableFruitDiet,
        HistoryOfHighGlucose = _profile.HistoryOfHighGlucose,
        HistoryOfHypertension = _profile.HistoryOfHypertension,
        Triglyceride = _profile.Triglyceride,
        FastingGlucose = _profile.FastingGlucose,
        FamilyDiabetes = _profile.FamilyDiabetes,
        ParentalHypertension = _profile.ParentalHypertension
    };

    private void ReadProfile()
    {
        _profile.Age = ReadInt(nameof(Profile.Age), _profile.Age);
        _profile.BodyHeight = ReadDouble(nameof(Profile.BodyHeight), _profile.BodyHeight);
        _profile.BodyWeight = ReadDouble(nameof(Profile.BodyWeight), _profile.BodyWeight);
        _profile.WaistCircumference = ReadDouble(nameof(Profile.WaistCircumference), _profile.WaistCircumference);
        _profile.NeckCircumference = ReadDouble(nameof(Profile.NeckCircumference), _profile.NeckCircumference);
        _profile.HipCircumference = ReadDouble(nameof(Profile.HipCircumference), _profile.HipCircumference);
        _profile.Cholesterol = ReadDouble(nameof(Profile.Cholesterol), _profile.Cholesterol);
        _profile.CholesterolHdl = ReadDouble(nameof(Profile.CholesterolHdl), _profile.CholesterolHdl);
        _profile.Triglyceride = ReadDouble(nameof(Profile.Triglyceride), _profile.Triglyceride);
        _profile.FastingGlucose = ReadDouble(nameof(Profile.FastingGlucose), _profile.FastingGlucose);
        _profile.Sbp = ReadDouble(nameof(Profile.Sbp), _profile.Sbp);
        _profile.Dbp = ReadDouble(nameof(Profile.Dbp), _profile.Dbp);
        _profile.Country = _entries[nameof(Profile.Country)].Text ?? "US";
        _profile.Gender = ReadEnum(nameof(Profile.Gender), _profile.Gender);
        _profile.PhysicalActivity = ReadEnum(nameof(Profile.PhysicalActivity), _profile.PhysicalActivity);
        _profile.Race = ReadEnum(nameof(Profile.Race), _profile.Race);
        _profile.HypertensionTreatment = ReadEnum(nameof(Profile.HypertensionTreatment), _profile.HypertensionTreatment);
        _profile.FamilyDiabetes = ReadEnum(nameof(Profile.FamilyDiabetes), _profile.FamilyDiabetes);
        _profile.ParentalHypertension = ReadEnum(nameof(Profile.ParentalHypertension), _profile.ParentalHypertension);
        _profile.IsSmoker = _switches[nameof(Profile.IsSmoker)].IsToggled;
        _profile.HasDiabetes = _switches[nameof(Profile.HasDiabetes)].IsToggled;
        _profile.VegetableFruitDiet = _switches[nameof(Profile.VegetableFruitDiet)].IsToggled;
        _profile.HistoryOfHighGlucose = _switches[nameof(Profile.HistoryOfHighGlucose)].IsToggled;
        _profile.HistoryOfHypertension = _switches[nameof(Profile.HistoryOfHypertension)].IsToggled;
    }

    private int ReadInt(string key, int fallback) =>
        int.TryParse(_entries[key].Text, out var value) ? value : fallback;

    private double ReadDouble(string key, double fallback) =>
        double.TryParse(_entries[key].Text, out var value) ? value : fallback;

    private T ReadEnum<T>(string key, T fallback) where T : struct =>
        Enum.TryParse<T>((string?)_pickers[key].SelectedItem, out var value) ? value : fallback;

    private void UpdateProgress(double value)
    {
        if (_progressLabel != null) _progressLabel.Text = $"{Math.Round(value)}%";
        SetFill(_progressTrack, _progressFill, value / 100.0);
    }

    private void UpdateMeasurementLine(MeasurementState? state)
    {
        if (_measurementStatusLabel != null)
        {
            _measurementStatusLabel.Text = $"{MeasurementStatusText(state, _violatedCondition)} - {Math.Round(_progress)}%";
        }
    }

    private void UpdateMeasurementButtons()
    {
        var running = IsRunningMeasurementState(_measurementState);
        if (_startButton != null) _startButton.IsEnabled = _initialized && !running;
        if (_stopButton != null) _stopButton.IsEnabled = _initialized && running;
        if (_seeResultsButton != null)
        {
            _seeResultsButton.IsVisible = _hasFinishedMeasurement || _measurementState == MeasurementState.FINISHED;
            _seeResultsButton.IsEnabled = _results != null;
        }
    }

    private static void SetFill(Grid? track, BoxView? fill, double ratio)
    {
        if (track == null || fill == null)
        {
            return;
        }
        fill.WidthRequest = Math.Max(0, Math.Min(1, ratio)) * Math.Max(0, track.Width);
    }

    private static View BuildTrack(out Grid track, out BoxView fill)
    {
        fill = new BoxView
        {
            BackgroundColor = Colors.Black,
            HorizontalOptions = LayoutOptions.Start
        };
        track = new Grid
        {
            HeightRequest = 12,
            BackgroundColor = Colors.Transparent,
            Children = { fill }
        };
        var border = new Border
        {
            Stroke = Colors.Black,
            StrokeThickness = 1,
            StrokeShape = new RoundRectangle { CornerRadius = 99 },
            Content = track
        };
        return border;
    }

    private static Button TextButton(string text, Func<Task> onClicked)
    {
        var button = new Button
        {
            Text = text,
            BackgroundColor = Colors.Transparent,
            TextColor = Colors.Black,
            BorderWidth = 0,
            HeightRequest = 44,
            Padding = new Thickness(0)
        };
        button.Clicked += async (_, _) => await onClicked();
        return button;
    }

    private static Grid Row(View left, View right)
    {
        var row = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(GridLength.Auto)
            }
        };
        row.Add(left, 0, 0);
        row.Add(right, 1, 0);
        return row;
    }

    private void AddEntry(Grid grid, string label, string key, string value, int index)
    {
        var stack = EntryField(label, key, value);
        var row = index / 2;
        if (index % 2 == 0)
        {
            grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
        }
        grid.Add(stack, index % 2, row);
    }

    private void AddEntry(Layout layout, string label, string key, string value)
    {
        layout.Add(EntryField(label, key, value));
    }

    private VerticalStackLayout EntryField(string label, string key, string value)
    {
        var entry = new Entry
        {
            Text = value,
            Keyboard = key == nameof(Profile.Country) ? Keyboard.Text : Keyboard.Numeric,
            TextColor = Colors.Black,
            BackgroundColor = Colors.White
        };
        _entries[key] = entry;
        return new VerticalStackLayout
        {
            Spacing = 4,
            Children = { Label(label, 12), entry }
        };
    }

    private void AddPicker(Layout layout, string label, string key, string[] values, string selected)
    {
        var picker = new Picker { TextColor = Colors.Black, BackgroundColor = Colors.White };
        foreach (var value in values)
        {
            picker.Items.Add(value);
        }
        picker.SelectedIndex = Math.Max(0, Array.IndexOf(values, selected));
        _pickers[key] = picker;
        layout.Add(new VerticalStackLayout { Spacing = 4, Children = { Label(label, 12), picker } });
    }

    private void AddSwitch(Layout layout, string label, string key, bool value)
    {
        var toggle = new Switch { IsToggled = value };
        _switches[key] = toggle;
        layout.Add(Row(Label(label, 14), toggle));
    }

    private static Label Label(string text, double size, bool center = false, bool bold = false) => new()
    {
        Text = text,
        FontSize = size,
        FontAttributes = bold ? FontAttributes.Bold : FontAttributes.None,
        TextColor = Colors.Black,
        HorizontalTextAlignment = center ? TextAlignment.Center : TextAlignment.Start,
        VerticalTextAlignment = TextAlignment.Center
    };

    private static Button OutlineButton(string text) => new()
    {
        Text = text,
        HeightRequest = 48,
        BackgroundColor = Colors.White,
        BorderColor = Colors.Black,
        BorderWidth = 1,
        TextColor = Colors.Black,
        CornerRadius = 8
    };

    private static Button FilledButton(string text)
    {
        var button = OutlineButton(text);
        button.BackgroundColor = Colors.Black;
        button.TextColor = Colors.White;
        return button;
    }

    private static View BuildQualityRows(string title, MeasurementResults? results)
    {
        var stack = new VerticalStackLayout { Spacing = 8 };
        RenderQualityRows(stack, title, results);
        return stack;
    }

    private static void RenderQualityRows(VerticalStackLayout? stack, string title, MeasurementResults? results)
    {
        if (stack == null)
        {
            return;
        }
        stack.Children.Clear();
        stack.Children.Add(Label(title, 14, false, true));
        var rows = QualityRows(results);
        if (rows.Count == 0)
        {
            stack.Children.Add(Label("Quality will appear during the measurement.", 14));
            return;
        }
        foreach (var row in rows)
        {
            stack.Children.Add(QualityRow(row));
        }
    }

    private static IReadOnlyList<(string Label, string Value, double? Progress)> QualityRows(MeasurementResults? results)
    {
        if (results == null)
        {
            return Array.Empty<(string, string, double?)>();
        }
        var rows = new List<(string, string, double?)>
        {
            ("Signal", Format(results.AverageSignalQuality, 1), QualityRatio(results.AverageSignalQuality))
        };
        if (results.QualityMetrics?.PpgQualityIndex is { } ppg)
        {
            rows.Add(("PPG", Format(ppg, 1), QualityRatio(ppg)));
        }
        if (results.QualityMetrics?.BcgQualityIndex is { } bcg)
        {
            rows.Add(("BCG", Format(bcg, 1), QualityRatio(bcg)));
        }
        if (results.QualityMetrics?.BloodPressureQualityIndex is { } bp)
        {
            rows.Add(("BP", Format(bp, 1), QualityRatio(bp)));
        }
        return rows;
    }

    private static View QualityRow((string Label, string Value, double? Progress) row)
    {
        var track = new Grid();
        var fill = new BoxView
        {
            BackgroundColor = Colors.Black,
            HorizontalOptions = LayoutOptions.Start
        };
        track.Children.Add(fill);
        track.SizeChanged += (_, _) => fill.WidthRequest = Math.Max(0, Math.Min(1, row.Progress ?? 0)) * track.Width;
        var border = new Border
        {
            Stroke = Colors.Black,
            StrokeThickness = 1,
            HeightRequest = 12,
            Content = track
        };
        var qualityRow = new Grid
        {
            ColumnDefinitions =
            {
                new ColumnDefinition(new GridLength(72)),
                new ColumnDefinition(GridLength.Star),
                new ColumnDefinition(new GridLength(52))
            },
            ColumnSpacing = 10
        };
        qualityRow.Add(Label(row.Label, 14), 0, 0);
        qualityRow.Add(border, 1, 0);
        qualityRow.Add(Label(row.Value, 14), 2, 0);
        return qualityRow;
    }

    private static void RenderGrid(Grid? grid, IReadOnlyList<(string Label, string Value, string Unit)> values)
    {
        if (grid == null)
        {
            return;
        }
        grid.Children.Clear();
        grid.RowDefinitions.Clear();
        grid.ColumnDefinitions.Clear();
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        grid.ColumnDefinitions.Add(new ColumnDefinition(GridLength.Star));
        for (var i = 0; i < values.Count; i++)
        {
            if (i % 2 == 0)
            {
                grid.RowDefinitions.Add(new RowDefinition(GridLength.Auto));
            }
            grid.Add(Tile(values[i].Label, values[i].Value, values[i].Unit), i % 2, i / 2);
        }
    }

    private static View Tile(string label, string value, string unit) => new Border
    {
        Stroke = Colors.Black,
        StrokeThickness = 1,
        StrokeShape = new RoundRectangle { CornerRadius = 0 },
        Padding = 10,
        MinimumHeightRequest = 112,
        Content = new VerticalStackLayout
        {
            Spacing = 8,
            Children =
            {
                Label(label, 12),
                new Label
                {
                    Text = value,
                    FontSize = 18,
                    FontAttributes = FontAttributes.Bold,
                    TextColor = Colors.Black,
                    LineBreakMode = LineBreakMode.WordWrap,
                    MaxLines = 1
                },
                Label(unit, 12)
            }
        }
    };

    private static IReadOnlyList<(string, string, string)> HeadlineValues(MeasurementResults? results) => new[]
    {
        ("HR", Format(results?.HeartRateBpm), "bpm"),
        ("SBP", Format(results?.SystolicBloodPressureMmhg), "mmHg"),
        ("DBP", Format(results?.DiastolicBloodPressureMmhg), "mmHg"),
        ("BR", Format(results?.BreathingRateBpm, 1), "brpm")
    };

    private static IReadOnlyList<(string, string, string)> MeasurementValues(MeasurementResults? results) => new[]
    {
        ("Heart rate", Format(results?.HeartRateBpm), "bpm"),
        ("HRV SDNN", Format(results?.HrvSdnnMs, 1), "ms"),
        ("HRV lnRMSSD", Format(results?.HrvLnrmssdMs, 2), "ms"),
        ("Cardiac stress", Format(results?.StressIndex, 1), ""),
        ("PNS activity", Format(results?.ParasympatheticActivity, 1), ""),
        ("Breathing", Format(results?.BreathingRateBpm, 1), "brpm"),
        ("Systolic", Format(results?.SystolicBloodPressureMmhg), "mmHg"),
        ("Diastolic", Format(results?.DiastolicBloodPressureMmhg), "mmHg"),
        ("Workload", Format(results?.CardiacWorkloadMmhgPerSec, 1), "mmHg/s"),
        ("Age", Format(results?.AgeYears), "years"),
        ("BMI", Format(results?.BmiKgPerM2, 1), "kg/m2"),
        ("BMI category", FormatEnum(results?.BmiCategory), ""),
        ("Weight", Format(results?.WeightKg, 1), "kg"),
        ("Height", Format(results?.HeightCm, 1), "cm"),
        ("BP scale", FormatBpScale(results), ""),
        ("Signal", Format(results?.AverageSignalQuality, 1), "dB"),
        ("PPG quality", Format(results?.QualityMetrics?.PpgQualityIndex, 1), ""),
        ("BCG quality", Format(results?.QualityMetrics?.BcgQualityIndex, 1), ""),
        ("BP quality", Format(results?.QualityMetrics?.BloodPressureQualityIndex, 1), ""),
        ("SBP median error", Format(results?.QualityMetrics?.ExpectedSbpMedianAbsErrorMmhg, 1), "mmHg"),
        ("SBP p80 error", Format(results?.QualityMetrics?.ExpectedSbpP80AbsErrorMmhg, 1), "mmHg"),
        ("SBP mean error", Format(results?.QualityMetrics?.ExpectedSbpMeanAbsErrorMmhg, 1), "mmHg"),
        ("SBP balanced MAE", Format(results?.QualityMetrics?.ExpectedSbpBalancedMaeMmhg, 1), "mmHg"),
        ("DBP median error", Format(results?.QualityMetrics?.ExpectedDbpMedianAbsErrorMmhg, 1), "mmHg"),
        ("DBP p80 error", Format(results?.QualityMetrics?.ExpectedDbpP80AbsErrorMmhg, 1), "mmHg"),
        ("DBP mean error", Format(results?.QualityMetrics?.ExpectedDbpMeanAbsErrorMmhg, 1), "mmHg"),
        ("DBP balanced MAE", Format(results?.QualityMetrics?.ExpectedDbpBalancedMaeMmhg, 1), "mmHg"),
        ("Heartbeats", results?.Heartbeats?.Count.ToString() ?? "-", "")
    };

    private static IReadOnlyList<(string, string, string)> RiskValues(HealthRisks? risks) => new[]
    {
        ("Wellness", Format(risks?.WellnessScore, 1), ""),
        ("Vascular age", Format(risks?.VascularAge), "years"),
        ("CVD risk", Format(risks?.CvDiseases?.OverallRisk, 1), "%"),
        ("Coronary disease", Format(risks?.CvDiseases?.CoronaryHeartDiseaseRisk, 1), "%"),
        ("Stroke risk", Format(risks?.CvDiseases?.StrokeRisk, 1), "%"),
        ("Heart failure", Format(risks?.CvDiseases?.HeartFailureRisk, 1), "%"),
        ("Peripheral vascular", Format(risks?.CvDiseases?.PeripheralVascularDiseaseRisk, 1), "%"),
        ("Hard CV", Format(risks?.HardAndFatalEvents?.HardCVEventRisk, 1), "%"),
        ("Coronary death", Format(risks?.HardAndFatalEvents?.CoronaryDeathEventRisk, 1), "%"),
        ("Fatal stroke", Format(risks?.HardAndFatalEvents?.FatalStrokeEventRisk, 1), "%"),
        ("CV mortality", Format(risks?.HardAndFatalEvents?.TotalCVMortalityRisk, 1), "%"),
        ("Risk score", Format(risks?.Scores?.TotalScore), ""),
        ("Age score", Format(risks?.Scores?.AgeScore), ""),
        ("SBP score", Format(risks?.Scores?.SbpScore), ""),
        ("Smoking score", Format(risks?.Scores?.SmokingScore), ""),
        ("Diabetes score", Format(risks?.Scores?.DiabetesScore), ""),
        ("BMI score", Format(risks?.Scores?.BmiScore), ""),
        ("Cholesterol score", Format(risks?.Scores?.CholesterolScore), ""),
        ("HDL score", Format(risks?.Scores?.CholesterolHdlScore), ""),
        ("Hypertension", Format(risks?.HypertensionRisk, 1), "%"),
        ("Diabetes", Format(risks?.DiabetesRisk, 1), "%"),
        ("Waist-height", Format(risks?.WaistToHeightRatio, 2), ""),
        ("Body fat", Format(risks?.BodyFatPercentage, 1), "%"),
        ("Body roundness", Format(risks?.BodyRoundnessIndex, 2), ""),
        ("A body shape", Format(risks?.ABodyShapeIndex, 3), ""),
        ("Conicity", Format(risks?.ConicityIndex, 2), ""),
        ("BMR", Format(risks?.BasalMetabolicRate), "kcal"),
        ("TDEE", Format(risks?.TotalDailyEnergyExpenditure), "kcal"),
        ("NAFLD", FormatEnum(risks?.NonAlcoholicFattyLiverDiseaseRisk), "")
    };

    private static string Format(double? value, int decimals = 0) =>
        value.HasValue && double.IsFinite(value.Value) ? value.Value.ToString($"F{decimals}") : "-";

    private static string FormatEnum<T>(T? value) where T : struct, Enum
    {
        if (!value.HasValue)
        {
            return "-";
        }
        return string.Join(
            " ",
            value.Value.ToString().Split('_').Select(word => word.Length == 0 ? word : char.ToUpperInvariant(word[0]) + word[1..].ToLowerInvariant()));
    }

    private static string FormatBpScale(MeasurementResults? results) =>
        results?.SystolicBloodPressureMmhg != null && results.DiastolicBloodPressureMmhg != null ? "Included" : "-";

    private enum AppScreen
    {
        Measurement,
        Profile,
        Results
    }

    private static double QualityRatio(double? value)
    {
        if (!value.HasValue || double.IsNaN(value.Value))
        {
            return 0;
        }
        return Math.Clamp(value.Value <= 1 ? value.Value : value.Value / 100.0, 0, 1);
    }

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

    private sealed class Profile
    {
        public int Age { get; set; }
        public double BodyHeight { get; set; }
        public double BodyWeight { get; set; }
        public double WaistCircumference { get; set; }
        public double NeckCircumference { get; set; }
        public double HipCircumference { get; set; }
        public double Cholesterol { get; set; }
        public double CholesterolHdl { get; set; }
        public double Triglyceride { get; set; }
        public double FastingGlucose { get; set; }
        public double Sbp { get; set; }
        public double Dbp { get; set; }
        public string Country { get; set; } = "US";
        public bool IsSmoker { get; set; }
        public bool HasDiabetes { get; set; }
        public bool VegetableFruitDiet { get; set; }
        public bool HistoryOfHighGlucose { get; set; }
        public bool HistoryOfHypertension { get; set; }
        public Gender Gender { get; set; }
        public PhysicalActivity PhysicalActivity { get; set; }
        public Race Race { get; set; }
        public HypertensionTreatment HypertensionTreatment { get; set; }
        public FamilyHistory FamilyDiabetes { get; set; }
        public ParentalHistory ParentalHypertension { get; set; }

        public static Profile Default() => new()
        {
            Age = 45,
            BodyHeight = 172,
            BodyWeight = 74,
            WaistCircumference = 84,
            NeckCircumference = 38,
            HipCircumference = 98,
            Cholesterol = 190,
            CholesterolHdl = 52,
            Triglyceride = 120,
            FastingGlucose = 92,
            Sbp = 128,
            Dbp = 82,
            IsSmoker = false,
            HasDiabetes = false,
            VegetableFruitDiet = true,
            HistoryOfHighGlucose = false,
            HistoryOfHypertension = false,
            Gender = Gender.FEMALE,
            PhysicalActivity = PhysicalActivity.MODERATELY,
            Race = Race.WHITE,
            HypertensionTreatment = HypertensionTreatment.NO,
            FamilyDiabetes = FamilyHistory.NONE_FIRST_DEGREE,
            ParentalHypertension = ParentalHistory.NONE
        };
    }
}
