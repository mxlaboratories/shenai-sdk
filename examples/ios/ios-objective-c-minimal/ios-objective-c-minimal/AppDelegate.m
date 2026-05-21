#import "AppDelegate.h"

#import <ShenaiSDK/ShenaiSDK.h>
#import <ShenaiSDK/ShenaiView.h>

static NSString *NormalizedApiKey(NSString *value) {
  if (![value isKindOfClass:NSString.class]) {
    return nil;
  }

  NSString *trimmed = [value stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
  if (trimmed.length == 0 || [trimmed isEqualToString:@"$(SHENAI_API_KEY)"]) {
    return nil;
  }
  return trimmed;
}

static NSString *ShenApiKey(void) {
  NSString *fromInfoPlist = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"SHENAI_API_KEY"];
  NSString *apiKey = NormalizedApiKey(fromInfoPlist);
  if (apiKey != nil) {
    return apiKey;
  }

  return NormalizedApiKey([NSProcessInfo processInfo].environment[@"SHENAI_API_KEY"]) ?: @"";
}

static RisksFactors *ExampleRiskFactors(void) {
  RisksFactors *factors = [[RisksFactors alloc] init];
  factors.age = @45;
  factors.cholesterol = @190;
  factors.cholesterolHDL = @52;
  factors.sbp = @128;
  factors.dbp = @82;
  factors.isSmoker = @(NO);
  factors.hypertensionTreatment = HypertensionTreatmentNo;
  factors.hasDiabetes = @(NO);
  factors.bodyHeight = @172;
  factors.bodyWeight = @74;
  factors.waistCircumference = @84;
  factors.neckCircumference = @38;
  factors.hipCircumference = @98;
  factors.gender = GenderFemale;
  factors.physicalActivity = Moderately;
  factors.country = @"US";
  factors.race = RaceWhite;
  factors.vegetableFruitDiet = @(YES);
  factors.historyOfHighGlucose = @(NO);
  factors.historyOfHypertension = @(NO);
  factors.triglyceride = @120;
  factors.fastingGlucose = @92;
  factors.familyDiabetes = FamilyHistoryNoneFirstDegree;
  factors.parentalHypertension = ParentalHistoryNone;
  return factors;
}

static InitializationSettings *MinimalExampleSettings(void) {
  InitializationSettings *settings = [[InitializationSettings alloc] init];
  settings.precisionMode = PrecisionModeRelaxed;
  settings.operatingMode = OperatingModeMeasure;
  settings.measurementPreset = MeasurementPresetThirtySecondsAllMetrics;
  settings.cameraMode = CameraModeFacingUser;
  settings.onboardingMode = OnboardingModeShowOnce;
  settings.showUserInterface = YES;
  settings.showFacePositioningOverlay = YES;
  settings.showVisualWarnings = YES;
  settings.enableCameraSwap = YES;
  settings.showFaceMask = YES;
  settings.showBloodFlow = YES;
  settings.enableStartAfterSuccess = NO;
  settings.enableSummaryScreen = YES;
  settings.showResultsFinishButton = YES;
  settings.enableHealthRisks = YES;
  settings.showHealthIndicesFinishButton = YES;
  settings.saveHealthRisksFactors = YES;
  settings.showOutOfRangeResultIndicators = YES;
  settings.applyPrecisionModeToBloodPressure = NO;
  settings.showSignalQualityIndicator = YES;
  settings.showSignalTile = YES;
  settings.showStartStopButton = YES;
  settings.showInfoButton = YES;
  settings.showDisclaimer = YES;
  settings.uiVersion = UiVersionV2;
  settings.risksFactors = ExampleRiskFactors();
  return settings;
}

@interface MinimalViewController : UIViewController
@property(nonatomic) InitializationResult initializationResult;
@property(nonatomic) BOOL sdkInitialized;
@property(nonatomic) BOOL appResumed;
@property(nonatomic, strong) UIView *contentView;
@property(nonatomic, strong) UILabel *statusLabel;
@property(nonatomic, strong) ShenaiView *shenaiController;
- (instancetype)initWithInitializationResult:(InitializationResult)initializationResult;
@end

@implementation MinimalViewController

- (instancetype)initWithInitializationResult:(InitializationResult)initializationResult {
  self = [super initWithNibName:nil bundle:nil];
  if (self) {
    _initializationResult = initializationResult;
    _sdkInitialized = initializationResult == InitializationResultSuccess;
    _appResumed = YES;
  }
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  self.title = @"Shen.AI Minimal";
  self.view.backgroundColor = UIColor.whiteColor;
  [self buildLayout];
  [self updateInitializationButton];
  [self syncSdkViewVisibility];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appDidEnterBackground)
                                               name:UIApplicationDidEnterBackgroundNotification
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appWillEnterForeground)
                                               name:UIApplicationWillEnterForegroundNotification
                                             object:nil];
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
  if (self.sdkInitialized) {
    [ShenaiSDK setCameraMode:CameraModeOff];
  }
}

- (void)buildLayout {
  self.contentView = [[UIView alloc] init];
  self.contentView.translatesAutoresizingMaskIntoConstraints = NO;
  [self.view addSubview:self.contentView];

  self.statusLabel = [[UILabel alloc] init];
  self.statusLabel.translatesAutoresizingMaskIntoConstraints = NO;
  self.statusLabel.textAlignment = NSTextAlignmentCenter;
  self.statusLabel.numberOfLines = 0;
  self.statusLabel.textColor = UIColor.blackColor;
  [self.contentView addSubview:self.statusLabel];

  [NSLayoutConstraint activateConstraints:@[
    [self.contentView.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
    [self.contentView.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
    [self.contentView.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor],
    [self.contentView.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],
    [self.statusLabel.centerXAnchor constraintEqualToAnchor:self.contentView.centerXAnchor],
    [self.statusLabel.centerYAnchor constraintEqualToAnchor:self.contentView.centerYAnchor],
    [self.statusLabel.leadingAnchor constraintGreaterThanOrEqualToAnchor:self.contentView.leadingAnchor constant:24],
    [self.statusLabel.trailingAnchor constraintLessThanOrEqualToAnchor:self.contentView.trailingAnchor constant:-24],
  ]];
}

- (void)syncSdkViewVisibility {
  BOOL shouldShowSdkView = self.sdkInitialized && self.appResumed;
  if (shouldShowSdkView) {
    self.statusLabel.hidden = YES;
    [self addSdkViewIfNeeded];
    [ShenaiSDK setCameraMode:CameraModeFacingUser];
  } else {
    [self removeSdkViewIfNeeded];
    self.statusLabel.hidden = NO;
    self.statusLabel.text = [self statusText];
    if (self.sdkInitialized) {
      [ShenaiSDK setCameraMode:CameraModeOff];
    }
  }
}

- (void)addSdkViewIfNeeded {
  if (self.shenaiController != nil) {
    return;
  }

  ShenaiView *controller = [[ShenaiView alloc] init];
  [self addChildViewController:controller];
  controller.view.translatesAutoresizingMaskIntoConstraints = NO;
  [self.contentView addSubview:controller.view];
  [NSLayoutConstraint activateConstraints:@[
    [controller.view.leadingAnchor constraintEqualToAnchor:self.contentView.leadingAnchor],
    [controller.view.trailingAnchor constraintEqualToAnchor:self.contentView.trailingAnchor],
    [controller.view.topAnchor constraintEqualToAnchor:self.contentView.topAnchor],
    [controller.view.bottomAnchor constraintEqualToAnchor:self.contentView.bottomAnchor],
  ]];
  [controller didMoveToParentViewController:self];
  self.shenaiController = controller;
}

- (void)removeSdkViewIfNeeded {
  if (self.shenaiController == nil) {
    return;
  }

  [self.shenaiController willMoveToParentViewController:nil];
  [self.shenaiController.view removeFromSuperview];
  [self.shenaiController removeFromParentViewController];
  self.shenaiController = nil;
}

- (NSString *)statusText {
  if (self.sdkInitialized) {
    return @"SDK view paused";
  }
  if (self.initializationResult == InitializationResultSuccess) {
    return @"SDK deinitialized";
  }
  return [NSString stringWithFormat:@"Initialization failed: %ld", (long)self.initializationResult];
}

- (void)updateInitializationButton {
  NSString *imageName = self.sdkInitialized ? @"power" : @"power.circle";
  UIBarButtonItem *item = [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:imageName]
                                                           style:UIBarButtonItemStylePlain
                                                          target:self
                                                          action:@selector(toggleSdkInitialization)];
  item.tintColor = UIColor.blackColor;
  item.accessibilityLabel = self.sdkInitialized ? @"Deinitialize SDK" : @"Initialize SDK";
  self.navigationItem.leftBarButtonItem = item;
}

- (void)toggleSdkInitialization {
  if (self.sdkInitialized) {
    [ShenaiSDK setCameraMode:CameraModeOff];
    [self removeSdkViewIfNeeded];
    [ShenaiSDK deinitialize];
    self.sdkInitialized = NO;
    [self syncSdkViewVisibility];
    [self updateInitializationButton];
    return;
  }

  self.initializationResult = [ShenaiSDK initialize:ShenApiKey() userID:@"" settings:MinimalExampleSettings()];
  self.sdkInitialized = self.initializationResult == InitializationResultSuccess;
  [self syncSdkViewVisibility];
  [self updateInitializationButton];
}

- (void)appDidEnterBackground {
  self.appResumed = NO;
  [self syncSdkViewVisibility];
}

- (void)appWillEnterForeground {
  self.appResumed = YES;
  [self syncSdkViewVisibility];
}

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  InitializationResult result = [ShenaiSDK initialize:ShenApiKey() userID:@"" settings:MinimalExampleSettings()];
  self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
  if (@available(iOS 13.0, *)) {
    self.window.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }
  self.window.rootViewController = [[UINavigationController alloc]
      initWithRootViewController:[[MinimalViewController alloc] initWithInitializationResult:result]];
  [self.window makeKeyAndVisible];
  return YES;
}

@end
