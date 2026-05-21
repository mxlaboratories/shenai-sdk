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

@class FlowSdkViewController;

@interface FlowConfig : NSObject
@property(nonatomic) BOOL hasInitialScreen;
@property(nonatomic) Screen initialScreen;
@property(nonatomic, copy) NSArray<NSNumber *> *screens;
@property(nonatomic) BOOL dashboardOnly;
@property(nonatomic) BOOL resetMeasurement;
@property(nonatomic) BOOL showPdfActionsAfterFinish;
@property(nonatomic) BOOL disableMeasurementsDashboard;
+ (instancetype)configWithInitialScreen:(Screen)initialScreen
                       hasInitialScreen:(BOOL)hasInitialScreen
                                screens:(NSArray<NSNumber *> *)screens
                          dashboardOnly:(BOOL)dashboardOnly
                       resetMeasurement:(BOOL)resetMeasurement
              showPdfActionsAfterFinish:(BOOL)showPdfActionsAfterFinish
            disableMeasurementsDashboard:(BOOL)disableMeasurementsDashboard;
@end

@implementation FlowConfig

+ (instancetype)configWithInitialScreen:(Screen)initialScreen
                       hasInitialScreen:(BOOL)hasInitialScreen
                                screens:(NSArray<NSNumber *> *)screens
                          dashboardOnly:(BOOL)dashboardOnly
                       resetMeasurement:(BOOL)resetMeasurement
              showPdfActionsAfterFinish:(BOOL)showPdfActionsAfterFinish
            disableMeasurementsDashboard:(BOOL)disableMeasurementsDashboard {
  FlowConfig *config = [[FlowConfig alloc] init];
  config.initialScreen = initialScreen;
  config.hasInitialScreen = hasInitialScreen;
  config.screens = screens;
  config.dashboardOnly = dashboardOnly;
  config.resetMeasurement = resetMeasurement;
  config.showPdfActionsAfterFinish = showPdfActionsAfterFinish;
  config.disableMeasurementsDashboard = disableMeasurementsDashboard;
  return config;
}

@end

static FlowConfig *DashboardFlow(void) {
  return [FlowConfig configWithInitialScreen:ScreenDashboard
                            hasInitialScreen:NO
                                     screens:@[ @(ScreenDashboard) ]
                               dashboardOnly:YES
                            resetMeasurement:NO
                   showPdfActionsAfterFinish:NO
                 disableMeasurementsDashboard:NO];
}

static FlowConfig *MeasurementFlow(void) {
  return [FlowConfig configWithInitialScreen:ScreenMeasurement
                            hasInitialScreen:YES
                                     screens:@[ @(ScreenMeasurement), @(ScreenResults), @(ScreenHealthRisks) ]
                               dashboardOnly:NO
                            resetMeasurement:YES
                   showPdfActionsAfterFinish:YES
                 disableMeasurementsDashboard:YES];
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

static InitializationSettings *UiFlowSettings(NSArray<NSNumber *> *screens, BOOL dashboardOnly) {
  InitializationSettings *settings = [[InitializationSettings alloc] init];
  settings.precisionMode = PrecisionModeRelaxed;
  settings.operatingMode = OperatingModeMeasure;
  settings.measurementPreset = MeasurementPresetThirtySecondsAllMetrics;
  settings.cameraMode = CameraModeFacingUser;
  settings.onboardingMode = OnboardingModeHidden;
  settings.showUserInterface = YES;
  settings.showFacePositioningOverlay = YES;
  settings.showVisualWarnings = YES;
  settings.enableCameraSwap = YES;
  settings.showFaceMask = YES;
  settings.showBloodFlow = YES;
  settings.enableStartAfterSuccess = NO;
  settings.enableSummaryScreen = !dashboardOnly;
  settings.showResultsFinishButton = !dashboardOnly;
  settings.enableHealthRisks = YES;
  settings.showHealthIndicesFinishButton = !dashboardOnly;
  settings.saveHealthRisksFactors = YES;
  settings.showOutOfRangeResultIndicators = YES;
  settings.applyPrecisionModeToBloodPressure = NO;
  settings.showSignalQualityIndicator = YES;
  settings.showSignalTile = YES;
  settings.showStartStopButton = !dashboardOnly;
  settings.showInfoButton = !dashboardOnly;
  settings.showDisclaimer = !dashboardOnly;
  settings.uiVersion = UiVersionV2;
  settings.risksFactors = ExampleRiskFactors();
  settings.uiFlowScreens = screens;
  return settings;
}

static UIButton *MakeActionButton(NSString *title) {
  UIButton *button = [UIButton buttonWithType:UIButtonTypeSystem];
  [button setTitle:title forState:UIControlStateNormal];
  button.tintColor = UIColor.blackColor;
  button.layer.borderColor = UIColor.blackColor.CGColor;
  button.layer.borderWidth = 1;
  button.layer.cornerRadius = 8;
  return button;
}

@interface FlowHomeViewController : UIViewController
@property(nonatomic, strong) UILabel *statusLabel;
@property(nonatomic) BOOL openingFlow;
@property(nonatomic, weak) FlowSdkViewController *activeSdkController;
@end

@interface FlowSdkViewController : UIViewController
@property(nonatomic, strong) FlowConfig *flow;
@property(nonatomic, copy) void (^onFlowFinished)(void);
- (instancetype)initWithFlow:(FlowConfig *)flow;
- (void)handleSdkEvent:(Event)event;
@end

@implementation FlowHomeViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  self.view.backgroundColor = UIColor.whiteColor;

  UILabel *titleLabel = [[UILabel alloc] init];
  titleLabel.text = @"Shen.AI Flow";
  titleLabel.font = [UIFont preferredFontForTextStyle:UIFontTextStyleTitle2];
  titleLabel.textColor = UIColor.blackColor;
  titleLabel.textAlignment = NSTextAlignmentCenter;

  self.statusLabel = [[UILabel alloc] init];
  self.statusLabel.textAlignment = NSTextAlignmentCenter;
  self.statusLabel.numberOfLines = 0;
  self.statusLabel.textColor = UIColor.blackColor;
  self.statusLabel.hidden = YES;

  UIButton *dashboardButton = MakeActionButton(@"Dashboard");
  [dashboardButton addTarget:self action:@selector(openDashboardFlow) forControlEvents:UIControlEventTouchUpInside];

  UIButton *measurementButton = MakeActionButton(@"Measurement");
  [measurementButton addTarget:self action:@selector(openMeasurementFlow) forControlEvents:UIControlEventTouchUpInside];

  UIStackView *stack = [[UIStackView alloc] initWithArrangedSubviews:@[
    titleLabel,
    self.statusLabel,
    dashboardButton,
    measurementButton,
  ]];
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 12;
  stack.translatesAutoresizingMaskIntoConstraints = NO;
  [self.view addSubview:stack];

  [NSLayoutConstraint activateConstraints:@[
    [stack.centerXAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.centerXAnchor],
    [stack.centerYAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.centerYAnchor],
    [stack.leadingAnchor constraintGreaterThanOrEqualToAnchor:self.view.leadingAnchor constant:24],
    [stack.trailingAnchor constraintLessThanOrEqualToAnchor:self.view.trailingAnchor constant:-24],
    [stack.widthAnchor constraintLessThanOrEqualToConstant:360],
    [dashboardButton.heightAnchor constraintEqualToConstant:54],
    [measurementButton.heightAnchor constraintEqualToConstant:54],
  ]];
}

- (void)openDashboardFlow {
  [self openFlow:DashboardFlow()];
}

- (void)openMeasurementFlow {
  [self openFlow:MeasurementFlow()];
}

- (void)openFlow:(FlowConfig *)flow {
  if (self.openingFlow) {
    return;
  }
  self.openingFlow = YES;
  self.statusLabel.hidden = YES;

  if ([ShenaiSDK isInitialized]) {
    [ShenaiSDK deinitialize];
  }

  InitializationSettings *settings = UiFlowSettings(flow.screens, flow.dashboardOnly);
  __weak typeof(self) weakSelf = self;
  settings.eventCallback = ^(Event event) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [weakSelf.activeSdkController handleSdkEvent:event];
    });
  };

  InitializationResult result = [ShenaiSDK initialize:ShenApiKey() userID:@"" settings:settings];
  self.openingFlow = NO;
  if (result != InitializationResultSuccess) {
    self.statusLabel.text = [NSString stringWithFormat:@"Initialization failed: %ld", (long)result];
    self.statusLabel.hidden = NO;
    return;
  }

  if (flow.disableMeasurementsDashboard) {
    [ShenaiSDK setEnableMeasurementsDashboard:NO];
  }

  FlowSdkViewController *sdkController = [[FlowSdkViewController alloc] initWithFlow:flow];
  sdkController.onFlowFinished = ^{
    weakSelf.activeSdkController = nil;
  };
  self.activeSdkController = sdkController;
  [self.navigationController pushViewController:sdkController animated:YES];
}

@end

@interface FlowSdkViewController ()
@property(nonatomic, strong) ShenaiView *shenaiController;
@property(nonatomic) BOOL showPdfActions;
@property(nonatomic, strong) UILabel *pdfStatusLabel;
@property(nonatomic, copy) NSArray<UIButton *> *pdfButtons;
@property(nonatomic) BOOL pdfBusy;
@property(nonatomic) BOOL finished;
@end

@implementation FlowSdkViewController

- (instancetype)initWithFlow:(FlowConfig *)flow {
  self = [super initWithNibName:nil bundle:nil];
  if (self) {
    _flow = flow;
    _pdfStatusLabel = [[UILabel alloc] init];
    _pdfButtons = @[];
  }
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  self.view.backgroundColor = UIColor.whiteColor;
  [self addSdkView];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appDidEnterBackground)
                                               name:UIApplicationDidEnterBackgroundNotification
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appWillEnterForeground)
                                               name:UIApplicationWillEnterForegroundNotification
                                             object:nil];

  if (self.flow.resetMeasurement) {
    [ShenaiSDK resetMeasurementSession];
  }
  if (self.flow.hasInitialScreen) {
    [ShenaiSDK setScreen:self.flow.initialScreen];
  }
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)handleSdkEvent:(Event)event {
  NSLog(@"Shen.AI event: %ld", (long)event);
  if (event == EventUserFlowFinished) {
    [self handleUserFlowFinished];
  }
}

- (void)handleUserFlowFinished {
  if (self.finished) {
    return;
  }
  if (self.flow.showPdfActionsAfterFinish && [ShenaiSDK getMeasurementResults] != nil) {
    [self showPdfActionsPage];
    return;
  }
  [self finishFlow];
}

- (void)addSdkView {
  ShenaiView *controller = [[ShenaiView alloc] init];
  [self addChildViewController:controller];
  controller.view.translatesAutoresizingMaskIntoConstraints = NO;
  [self.view addSubview:controller.view];
  [NSLayoutConstraint activateConstraints:@[
    [controller.view.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
    [controller.view.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
    [controller.view.topAnchor constraintEqualToAnchor:self.view.topAnchor],
    [controller.view.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],
  ]];
  [controller didMoveToParentViewController:self];
  self.shenaiController = controller;
}

- (void)removeSdkView {
  if (self.shenaiController == nil) {
    return;
  }
  [self.shenaiController willMoveToParentViewController:nil];
  [self.shenaiController.view removeFromSuperview];
  [self.shenaiController removeFromParentViewController];
  self.shenaiController = nil;
}

- (void)showPdfActionsPage {
  if (self.showPdfActions) {
    return;
  }
  self.showPdfActions = YES;
  [self removeSdkView];
  [ShenaiSDK setCameraMode:CameraModeOff];

  UILabel *titleLabel = [[UILabel alloc] init];
  titleLabel.text = @"Measurement PDF";
  titleLabel.font = [UIFont preferredFontForTextStyle:UIFontTextStyleTitle2];
  titleLabel.textColor = UIColor.blackColor;
  titleLabel.textAlignment = NSTextAlignmentCenter;

  self.pdfStatusLabel.text = @"Measurement finished. Open the PDF report.";
  self.pdfStatusLabel.textAlignment = NSTextAlignmentCenter;
  self.pdfStatusLabel.textColor = UIColor.blackColor;
  self.pdfStatusLabel.numberOfLines = 0;

  UIButton *openButton = MakeActionButton(@"Open PDF");
  [openButton addTarget:self action:@selector(openPdf) forControlEvents:UIControlEventTouchUpInside];

  UIButton *finishButton = [UIButton buttonWithType:UIButtonTypeSystem];
  [finishButton setTitle:@"Finish" forState:UIControlStateNormal];
  finishButton.backgroundColor = UIColor.blackColor;
  finishButton.tintColor = UIColor.whiteColor;
  finishButton.layer.cornerRadius = 8;
  [finishButton addTarget:self action:@selector(finishFlow) forControlEvents:UIControlEventTouchUpInside];
  self.pdfButtons = @[ openButton, finishButton ];

  UIStackView *stack = [[UIStackView alloc] initWithArrangedSubviews:@[
    titleLabel,
    self.pdfStatusLabel,
    openButton,
    finishButton,
  ]];
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 12;
  stack.translatesAutoresizingMaskIntoConstraints = NO;
  [self.view addSubview:stack];

  [NSLayoutConstraint activateConstraints:@[
    [stack.centerXAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.centerXAnchor],
    [stack.centerYAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.centerYAnchor],
    [stack.leadingAnchor constraintGreaterThanOrEqualToAnchor:self.view.leadingAnchor constant:24],
    [stack.trailingAnchor constraintLessThanOrEqualToAnchor:self.view.trailingAnchor constant:-24],
    [stack.widthAnchor constraintLessThanOrEqualToConstant:420],
    [openButton.heightAnchor constraintEqualToConstant:54],
    [finishButton.heightAnchor constraintEqualToConstant:44],
  ]];
}

- (void)openPdf {
  [self runPdfAction:^{
    [ShenaiSDK openMeasurementResultsPdfInBrowser];
    [self setPdfStatus:@"PDF open request sent."];
  }];
}

- (void)runPdfAction:(void (^)(void))action {
  if (self.pdfBusy) {
    return;
  }
  self.pdfBusy = YES;
  [self setPdfButtonsEnabled:NO];
  [self setPdfStatus:@"Working on PDF..."];
  action();
  self.pdfBusy = NO;
  [self setPdfButtonsEnabled:YES];
}

- (void)setPdfStatus:(NSString *)status {
  self.pdfStatusLabel.text = status;
}

- (void)setPdfButtonsEnabled:(BOOL)enabled {
  for (UIButton *button in self.pdfButtons) {
    button.enabled = enabled;
  }
}

- (void)finishFlow {
  if (self.finished) {
    return;
  }
  self.finished = YES;
  [self removeSdkView];
  [ShenaiSDK deinitialize];
  if (self.onFlowFinished) {
    self.onFlowFinished();
  }
  [self.navigationController popToRootViewControllerAnimated:YES];
}

- (void)appDidEnterBackground {
  if (!self.finished && !self.showPdfActions) {
    [ShenaiSDK setCameraMode:CameraModeOff];
  }
}

- (void)appWillEnterForeground {
  if (!self.finished && !self.showPdfActions) {
    [ShenaiSDK setCameraMode:CameraModeFacingUser];
  }
}

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
  if (@available(iOS 13.0, *)) {
    self.window.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }
  UINavigationController *navigationController =
      [[UINavigationController alloc] initWithRootViewController:[[FlowHomeViewController alloc] init]];
  [navigationController setNavigationBarHidden:YES animated:NO];
  self.window.rootViewController = navigationController;
  [self.window makeKeyAndVisible];
  return YES;
}

@end
