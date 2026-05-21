#import "AppDelegate.h"

#import <ShenaiSDK/ShenaiHealthRisks.h>
#import <ShenaiSDK/ShenaiSDK.h>
#import <ShenaiSDK/ShenaiView.h>
#import <math.h>

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
static NSString *const MeasurementFinishedNotification = @"ShenaiMeasurementFinished";

@class RiskProfile;
@class HealthFormViewController;

static NSString *FormatNumber(NSNumber *value, NSInteger decimals) {
  if (value == nil) {
    return @"-";
  }
  NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
  formatter.minimumFractionDigits = decimals;
  formatter.maximumFractionDigits = decimals;
  return [formatter stringFromNumber:value] ?: @"-";
}

static NSNumber *NumberFromDouble(double value) {
  return @(value);
}

static BOOL IsRunningMeasurementState(MeasurementState state, BOOL hasState) {
  if (!hasState) {
    return NO;
  }
  return state == MeasurementStateWaitingForFace || state == MeasurementStateRunningSignalShort ||
         state == MeasurementStateRunningSignalGood || state == MeasurementStateRunningSignalBad ||
         state == MeasurementStateRunningSignalBadDeviceUnstable || state == MeasurementStateFinalizing;
}

static NSString *ConditionInstruction(MeasurementEnvironmentCondition condition) {
  switch (condition) {
  case MeasurementEnvironmentConditionFacePosition:
  case MeasurementEnvironmentConditionForeheadVisible:
    return @"Uncover your forehead";
  case MeasurementEnvironmentConditionGlassesNotDetected:
    return @"Remove your glasses";
  case MeasurementEnvironmentConditionSufficientLightLevel:
    return @"Move to brighter light";
  case MeasurementEnvironmentConditionEvenLighting:
    return @"Use even lighting";
  case MeasurementEnvironmentConditionNoBacklight:
    return @"Avoid backlight";
  case MeasurementEnvironmentConditionFaceStable:
    return @"Keep your face still";
  case MeasurementEnvironmentConditionDeviceStable:
    return @"Keep the phone still";
  }
  return @"Ready";
}

static NSString *MeasurementStatusText(MeasurementState state,
                                       BOOL hasState,
                                       MeasurementEnvironmentCondition condition,
                                       BOOL hasCondition,
                                       BOOL hasReachedFinalizing,
                                       BOOL hasFinishedMeasurement) {
  if (hasFinishedMeasurement || (hasState && state == MeasurementStateFinished)) {
    return @"Measurement finished";
  }
  if (hasReachedFinalizing || (hasState && state == MeasurementStateFinalizing)) {
    return @"Finalizing";
  }
  if (hasCondition) {
    return ConditionInstruction(condition);
  }
  if (!hasState) {
    return @"Ready";
  }
  switch (state) {
  case MeasurementStateWaitingForFace:
    return @"Waiting for face";
  case MeasurementStateRunningSignalShort:
  case MeasurementStateRunningSignalGood:
  case MeasurementStateRunningSignalBad:
  case MeasurementStateRunningSignalBadDeviceUnstable:
    return @"Measurement conditions are good";
  case MeasurementStateFinalizing:
    return @"Finalizing";
  case MeasurementStateFinished:
    return @"Finished";
  case MeasurementStateFailed:
    return @"Measurement failed";
  case MeasurementStateNotStarted:
    return @"Ready";
  }
  return @"Ready";
}

static UILabel *SectionTitle(NSString *text) {
  UILabel *label = [[UILabel alloc] init];
  label.text = text;
  label.font = [UIFont preferredFontForTextStyle:UIFontTextStyleHeadline];
  label.textColor = UIColor.blackColor;
  return label;
}

static UILabel *BodyLabel(NSString *text) {
  UILabel *label = [[UILabel alloc] init];
  label.text = text;
  label.textColor = UIColor.blackColor;
  label.numberOfLines = 0;
  return label;
}

static void StyleFilledButton(UIButton *button, NSString *title) {
  [button setTitle:title forState:UIControlStateNormal];
  button.backgroundColor = UIColor.blackColor;
  button.tintColor = UIColor.whiteColor;
  button.layer.cornerRadius = 8;
}

static void StyleOutlinedButton(UIButton *button, NSString *title) {
  [button setTitle:title forState:UIControlStateNormal];
  button.backgroundColor = UIColor.whiteColor;
  button.tintColor = UIColor.blackColor;
  button.layer.borderColor = UIColor.blackColor.CGColor;
  button.layer.borderWidth = 1;
  button.layer.cornerRadius = 8;
}

static void SetFilledButtonEnabled(UIButton *button, BOOL enabled) {
  button.enabled = enabled;
  button.backgroundColor = enabled ? UIColor.blackColor : [UIColor colorWithWhite:0.82 alpha:1.0];
  button.tintColor = UIColor.whiteColor;
}

static void SetOutlinedButtonEnabled(UIButton *button, BOOL enabled) {
  button.enabled = enabled;
  button.tintColor = enabled ? UIColor.blackColor : UIColor.grayColor;
  button.layer.borderColor = (enabled ? UIColor.blackColor : UIColor.grayColor).CGColor;
}

@interface DisplayValue : NSObject
@property(nonatomic, copy) NSString *title;
@property(nonatomic, copy) NSString *value;
@property(nonatomic, copy) NSString *unit;
+ (instancetype)valueWithTitle:(NSString *)title value:(NSString *)value unit:(NSString *)unit;
@end

@implementation DisplayValue
+ (instancetype)valueWithTitle:(NSString *)title value:(NSString *)value unit:(NSString *)unit {
  DisplayValue *displayValue = [[DisplayValue alloc] init];
  displayValue.title = title;
  displayValue.value = value;
  displayValue.unit = unit;
  return displayValue;
}
@end

@interface RiskProfile : NSObject <NSCopying>
@property(nonatomic) NSInteger age;
@property(nonatomic) double heightCm;
@property(nonatomic) double weightKg;
@property(nonatomic) double waistCm;
@property(nonatomic) double cholesterol;
@property(nonatomic) double hdl;
@property(nonatomic) double sbp;
@property(nonatomic) double dbp;
@property(nonatomic) BOOL smoker;
@property(nonatomic) HypertensionTreatment hypertensionTreatment;
@property(nonatomic) BOOL diabetes;
@property(nonatomic) Gender gender;
@property(nonatomic) double neckCm;
@property(nonatomic) double hipCm;
@property(nonatomic) PhysicalActivity physicalActivity;
@property(nonatomic, copy) NSString *country;
@property(nonatomic) Race race;
@property(nonatomic) BOOL vegetableFruitDiet;
@property(nonatomic) BOOL historyOfHighGlucose;
@property(nonatomic) BOOL historyOfHypertension;
@property(nonatomic) double triglyceride;
@property(nonatomic) double fastingGlucose;
@property(nonatomic) FamilyHistory familyDiabetes;
@property(nonatomic) ParentalHistory parentalHypertension;
+ (instancetype)defaults;
- (RisksFactors *)toRisksFactorsWithResults:(MeasurementResults *)results;
@end

@implementation RiskProfile

+ (instancetype)defaults {
  RiskProfile *profile = [[RiskProfile alloc] init];
  profile.age = 45;
  profile.heightCm = 172;
  profile.weightKg = 74;
  profile.waistCm = 84;
  profile.cholesterol = 190;
  profile.hdl = 52;
  profile.sbp = 128;
  profile.dbp = 82;
  profile.smoker = NO;
  profile.hypertensionTreatment = HypertensionTreatmentNo;
  profile.diabetes = NO;
  profile.gender = GenderFemale;
  profile.neckCm = 38;
  profile.hipCm = 98;
  profile.physicalActivity = Moderately;
  profile.country = @"US";
  profile.race = RaceWhite;
  profile.vegetableFruitDiet = YES;
  profile.historyOfHighGlucose = NO;
  profile.historyOfHypertension = NO;
  profile.triglyceride = 120;
  profile.fastingGlucose = 92;
  profile.familyDiabetes = FamilyHistoryNoneFirstDegree;
  profile.parentalHypertension = ParentalHistoryNone;
  return profile;
}

- (id)copyWithZone:(NSZone *)zone {
  RiskProfile *profile = [[[self class] allocWithZone:zone] init];
  profile.age = self.age;
  profile.heightCm = self.heightCm;
  profile.weightKg = self.weightKg;
  profile.waistCm = self.waistCm;
  profile.cholesterol = self.cholesterol;
  profile.hdl = self.hdl;
  profile.sbp = self.sbp;
  profile.dbp = self.dbp;
  profile.smoker = self.smoker;
  profile.hypertensionTreatment = self.hypertensionTreatment;
  profile.diabetes = self.diabetes;
  profile.gender = self.gender;
  profile.neckCm = self.neckCm;
  profile.hipCm = self.hipCm;
  profile.physicalActivity = self.physicalActivity;
  profile.country = self.country;
  profile.race = self.race;
  profile.vegetableFruitDiet = self.vegetableFruitDiet;
  profile.historyOfHighGlucose = self.historyOfHighGlucose;
  profile.historyOfHypertension = self.historyOfHypertension;
  profile.triglyceride = self.triglyceride;
  profile.fastingGlucose = self.fastingGlucose;
  profile.familyDiabetes = self.familyDiabetes;
  profile.parentalHypertension = self.parentalHypertension;
  return profile;
}

- (RisksFactors *)toRisksFactorsWithResults:(MeasurementResults *)results {
  RisksFactors *factors = [[RisksFactors alloc] init];
  factors.age = @(self.age);
  factors.cholesterol = @(self.cholesterol);
  factors.cholesterolHDL = @(self.hdl);
  factors.sbp = results.systolicBloodPressureMmhg ?: @(self.sbp);
  factors.dbp = results.diastolicBloodPressureMmhg ?: @(self.dbp);
  factors.isSmoker = @(self.smoker);
  factors.hypertensionTreatment = self.hypertensionTreatment;
  factors.hasDiabetes = @(self.diabetes);
  factors.bodyHeight = @(self.heightCm);
  factors.bodyWeight = @(self.weightKg);
  factors.waistCircumference = @(self.waistCm);
  factors.neckCircumference = @(self.neckCm);
  factors.hipCircumference = @(self.hipCm);
  factors.gender = self.gender;
  factors.physicalActivity = self.physicalActivity;
  factors.country = self.country;
  factors.race = self.race;
  factors.vegetableFruitDiet = @(self.vegetableFruitDiet);
  factors.historyOfHighGlucose = @(self.historyOfHighGlucose);
  factors.historyOfHypertension = @(self.historyOfHypertension);
  factors.triglyceride = @(self.triglyceride);
  factors.fastingGlucose = @(self.fastingGlucose);
  factors.familyDiabetes = self.familyDiabetes;
  factors.parentalHypertension = self.parentalHypertension;
  return factors;
}

@end

static InitializationSettings *CustomUiSettings(RiskProfile *profile) {
  InitializationSettings *settings = [[InitializationSettings alloc] init];
  settings.precisionMode = PrecisionModeRelaxed;
  settings.operatingMode = OperatingModeMeasure;
  settings.measurementPreset = MeasurementPresetThirtySecondsAllMetrics;
  settings.cameraMode = CameraModeFacingUser;
  settings.onboardingMode = OnboardingModeHidden;
  settings.showUserInterface = NO;
  settings.showFacePositioningOverlay = NO;
  settings.showVisualWarnings = NO;
  settings.enableCameraSwap = NO;
  settings.showFaceMask = YES;
  settings.showBloodFlow = NO;
  settings.enableStartAfterSuccess = NO;
  settings.enableSummaryScreen = NO;
  settings.showResultsFinishButton = NO;
  settings.enableHealthRisks = YES;
  settings.showHealthIndicesFinishButton = NO;
  settings.saveHealthRisksFactors = YES;
  settings.showOutOfRangeResultIndicators = NO;
  settings.applyPrecisionModeToBloodPressure = NO;
  settings.showSignalQualityIndicator = NO;
  settings.showSignalTile = NO;
  settings.showStartStopButton = NO;
  settings.showInfoButton = NO;
  settings.showDisclaimer = NO;
  settings.uiVersion = UiVersionV2;
  settings.risksFactors = [profile toRisksFactorsWithResults:nil];
  return settings;
}

static UIView *Tile(DisplayValue *displayValue) {
  UILabel *title = [[UILabel alloc] init];
  title.text = displayValue.title;
  title.font = [UIFont preferredFontForTextStyle:UIFontTextStyleCaption1];
  title.textColor = UIColor.darkGrayColor;
  title.numberOfLines = 2;

  UILabel *metric = [[UILabel alloc] init];
  metric.text = displayValue.unit.length == 0 ? displayValue.value : [NSString stringWithFormat:@"%@ %@", displayValue.value, displayValue.unit];
  metric.font = [UIFont preferredFontForTextStyle:UIFontTextStyleHeadline];
  metric.textColor = UIColor.blackColor;
  metric.adjustsFontSizeToFitWidth = YES;
  metric.minimumScaleFactor = 0.7;

  UIStackView *stack = [[UIStackView alloc] initWithArrangedSubviews:@[ title, metric ]];
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 4;
  stack.translatesAutoresizingMaskIntoConstraints = NO;

  UIView *container = [[UIView alloc] init];
  container.backgroundColor = UIColor.whiteColor;
  container.layer.borderColor = UIColor.blackColor.CGColor;
  container.layer.borderWidth = 1;
  [container addSubview:stack];
  [NSLayoutConstraint activateConstraints:@[
    [stack.leadingAnchor constraintEqualToAnchor:container.leadingAnchor constant:12],
    [stack.trailingAnchor constraintEqualToAnchor:container.trailingAnchor constant:-12],
    [stack.topAnchor constraintEqualToAnchor:container.topAnchor constant:10],
    [stack.bottomAnchor constraintEqualToAnchor:container.bottomAnchor constant:-10],
    [container.heightAnchor constraintGreaterThanOrEqualToConstant:112],
  ]];
  return container;
}

static UIStackView *Grid(NSArray<DisplayValue *> *values) {
  UIStackView *stack = [[UIStackView alloc] init];
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 10;
  for (NSInteger index = 0; index < values.count; index += 2) {
    UIStackView *row = [[UIStackView alloc] init];
    row.axis = UILayoutConstraintAxisHorizontal;
    row.spacing = 10;
    row.distribution = UIStackViewDistributionFillEqually;
    [row addArrangedSubview:Tile(values[index])];
    if (index + 1 < values.count) {
      [row addArrangedSubview:Tile(values[index + 1])];
    } else {
      [row addArrangedSubview:[[UIView alloc] init]];
    }
    [stack addArrangedSubview:row];
  }
  return stack;
}

static float QualityProgress(double value) {
  double normalized = value <= 1 ? value : value / 100.0;
  return (float)MIN(1.0, MAX(0.0, normalized));
}

static UIView *QualityRow(NSString *labelText, NSString *valueText, NSNumber *progress) {
  UILabel *label = [[UILabel alloc] init];
  label.text = labelText;
  label.textColor = UIColor.blackColor;
  [label.widthAnchor constraintEqualToConstant:72].active = YES;

  UILabel *value = [[UILabel alloc] init];
  value.text = valueText;
  value.textColor = UIColor.blackColor;
  value.textAlignment = NSTextAlignmentRight;
  [value.widthAnchor constraintEqualToConstant:52].active = YES;

  UIView *meter;
  if (progress != nil) {
    UIProgressView *progressView = [[UIProgressView alloc] initWithProgressViewStyle:UIProgressViewStyleDefault];
    progressView.progressTintColor = UIColor.blackColor;
    progressView.trackTintColor = [UIColor colorWithWhite:0.86 alpha:1.0];
    progressView.progress = progress.floatValue;
    meter = progressView;
  } else {
    UIView *line = [[UIView alloc] init];
    line.backgroundColor = UIColor.blackColor;
    [line.heightAnchor constraintEqualToConstant:1].active = YES;
    meter = line;
  }

  UIStackView *stack = [[UIStackView alloc] initWithArrangedSubviews:@[ label, meter, value ]];
  stack.axis = UILayoutConstraintAxisHorizontal;
  stack.alignment = UIStackViewAlignmentCenter;
  stack.spacing = 10;
  return stack;
}

static NSArray<UIView *> *QualityRows(MeasurementResults *results) {
  if (results == nil) {
    return @[];
  }
  NSMutableArray<UIView *> *rows = [NSMutableArray array];
  [rows addObject:QualityRow(@"Signal",
                             FormatNumber(@(results.averageSignalQuality), 1),
                             @(QualityProgress(results.averageSignalQuality)))];
  MeasurementQualityMetrics *quality = results.qualityMetrics;
  if (quality.ppgQualityIndex != nil) {
    [rows addObject:QualityRow(@"PPG", FormatNumber(quality.ppgQualityIndex, 1), @(QualityProgress(quality.ppgQualityIndex.doubleValue)))];
  }
  if (quality.bcgQualityIndex != nil) {
    [rows addObject:QualityRow(@"BCG", FormatNumber(quality.bcgQualityIndex, 1), @(QualityProgress(quality.bcgQualityIndex.doubleValue)))];
  }
  if (quality.bloodPressureQualityIndex != nil) {
    [rows addObject:QualityRow(@"BP",
                               FormatNumber(quality.bloodPressureQualityIndex, 1),
                               @(QualityProgress(quality.bloodPressureQualityIndex.doubleValue)))];
  }
  return rows;
}

static UIStackView *QualityIndicator(NSString *title, MeasurementResults *results) {
  UIStackView *stack = [[UIStackView alloc] init];
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 8;
  [stack addArrangedSubview:SectionTitle(title)];
  NSArray<UIView *> *rows = QualityRows(results);
  if (rows.count == 0) {
    [stack addArrangedSubview:BodyLabel(@"Quality will appear during the measurement.")];
  } else {
    for (UIView *row in rows) {
      [stack addArrangedSubview:row];
    }
  }
  return stack;
}

static NSArray<DisplayValue *> *HeadlineValues(MeasurementResults *results) {
  return @[
    [DisplayValue valueWithTitle:@"HR" value:FormatNumber(results ? NumberFromDouble(results.heartRateBpm) : nil, 0) unit:@"bpm"],
    [DisplayValue valueWithTitle:@"SBP" value:FormatNumber(results.systolicBloodPressureMmhg, 0) unit:@"mmHg"],
    [DisplayValue valueWithTitle:@"DBP" value:FormatNumber(results.diastolicBloodPressureMmhg, 0) unit:@"mmHg"],
    [DisplayValue valueWithTitle:@"BR" value:FormatNumber(results.breathingRateBpm, 1) unit:@"brpm"],
  ];
}

static NSArray<DisplayValue *> *MeasurementMetricValues(MeasurementResults *results) {
  MeasurementQualityMetrics *quality = results.qualityMetrics;
  return @[
    [DisplayValue valueWithTitle:@"Heart rate" value:FormatNumber(results ? NumberFromDouble(results.heartRateBpm) : nil, 0) unit:@"bpm"],
    [DisplayValue valueWithTitle:@"HRV SDNN" value:FormatNumber(results.hrvSdnnMs, 1) unit:@"ms"],
    [DisplayValue valueWithTitle:@"HRV lnRMSSD" value:FormatNumber(results.hrvLnrmssdMs, 2) unit:@"ms"],
    [DisplayValue valueWithTitle:@"Cardiac stress" value:FormatNumber(results.stressIndex, 1) unit:@""],
    [DisplayValue valueWithTitle:@"PNS activity" value:FormatNumber(results.parasympatheticActivity, 1) unit:@""],
    [DisplayValue valueWithTitle:@"Breathing" value:FormatNumber(results.breathingRateBpm, 1) unit:@"brpm"],
    [DisplayValue valueWithTitle:@"Systolic" value:FormatNumber(results.systolicBloodPressureMmhg, 0) unit:@"mmHg"],
    [DisplayValue valueWithTitle:@"Diastolic" value:FormatNumber(results.diastolicBloodPressureMmhg, 0) unit:@"mmHg"],
    [DisplayValue valueWithTitle:@"Workload" value:FormatNumber(results.cardiacWorkloadMmhgPerSec, 1) unit:@"mmHg/s"],
    [DisplayValue valueWithTitle:@"Age" value:FormatNumber(results.ageYears, 0) unit:@"years"],
    [DisplayValue valueWithTitle:@"BMI" value:FormatNumber(results.bmiKgPerM2, 1) unit:@"kg/m2"],
    [DisplayValue valueWithTitle:@"Signal" value:FormatNumber(results ? @(results.averageSignalQuality) : nil, 1) unit:@"dB"],
    [DisplayValue valueWithTitle:@"PPG quality" value:FormatNumber(quality.ppgQualityIndex, 1) unit:@""],
    [DisplayValue valueWithTitle:@"BCG quality" value:FormatNumber(quality.bcgQualityIndex, 1) unit:@""],
    [DisplayValue valueWithTitle:@"BP quality" value:FormatNumber(quality.bloodPressureQualityIndex, 1) unit:@""],
    [DisplayValue valueWithTitle:@"Heartbeats" value:[NSString stringWithFormat:@"%lu", (unsigned long)results.heartbeats.count] unit:@""],
  ];
}

static NSArray<DisplayValue *> *HealthRiskValues(HealthRisks *risks) {
  return @[
    [DisplayValue valueWithTitle:@"Wellness" value:FormatNumber(risks.wellnessScore, 1) unit:@""],
    [DisplayValue valueWithTitle:@"Vascular age" value:FormatNumber(risks.vascularAge, 0) unit:@"years"],
    [DisplayValue valueWithTitle:@"CVD risk" value:FormatNumber(risks.cvDiseases.overallRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Coronary disease" value:FormatNumber(risks.cvDiseases.coronaryHeartDiseaseRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Stroke risk" value:FormatNumber(risks.cvDiseases.strokeRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Heart failure" value:FormatNumber(risks.cvDiseases.heartFailureRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Hard CV" value:FormatNumber(risks.hardAndFatalEvents.hardCvEventRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Coronary death" value:FormatNumber(risks.hardAndFatalEvents.coronaryDeathEventRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Risk score" value:FormatNumber(risks.scores.totalScore, 0) unit:@""],
    [DisplayValue valueWithTitle:@"Age score" value:FormatNumber(risks.scores.ageScore, 0) unit:@""],
    [DisplayValue valueWithTitle:@"Hypertension" value:FormatNumber(risks.hypertensionRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Diabetes" value:FormatNumber(risks.diabetesRisk, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"Waist-height" value:FormatNumber(risks.waistToHeightRatio, 2) unit:@""],
    [DisplayValue valueWithTitle:@"Body fat" value:FormatNumber(risks.bodyFatPercentage, 1) unit:@"%"],
    [DisplayValue valueWithTitle:@"BMR" value:FormatNumber(risks.basalMetabolicRate, 0) unit:@"kcal"],
    [DisplayValue valueWithTitle:@"TDEE" value:FormatNumber(risks.totalDailyEnergyExpenditure, 0) unit:@"kcal"],
  ];
}

@interface HealthFormViewController : UIViewController
@property(nonatomic, copy) void (^onSaved)(RiskProfile *profile);
@property(nonatomic, strong) RiskProfile *profile;
@property(nonatomic, strong) NSMutableDictionary<NSString *, UITextField *> *fields;
@property(nonatomic, strong) UITextField *countryField;
@property(nonatomic, strong) UISwitch *smokerSwitch;
@property(nonatomic, strong) UISwitch *diabetesSwitch;
@property(nonatomic, strong) UISwitch *fruitSwitch;
@property(nonatomic, strong) UISwitch *highGlucoseSwitch;
@property(nonatomic, strong) UISwitch *hypertensionSwitch;
@property(nonatomic, strong) UISegmentedControl *genderControl;
@property(nonatomic, strong) UISegmentedControl *activityControl;
@property(nonatomic, strong) UISegmentedControl *raceControl;
@property(nonatomic, strong) UISegmentedControl *treatmentControl;
@property(nonatomic, strong) UISegmentedControl *familyControl;
@property(nonatomic, strong) UISegmentedControl *parentalControl;
- (instancetype)initWithProfile:(RiskProfile *)profile;
@end

@interface ResultViewController : UIViewController
@property(nonatomic, strong) MeasurementResults *results;
@property(nonatomic, strong) HealthRisks *risks;
@property(nonatomic, strong) RiskProfile *profile;
@property(nonatomic, copy) void (^onProfileSaved)(RiskProfile *profile);
@property(nonatomic, copy) void (^onRisksChanged)(HealthRisks *risks);
@property(nonatomic, strong) UIStackView *stack;
- (instancetype)initWithResults:(MeasurementResults *)results risks:(HealthRisks *)risks profile:(RiskProfile *)profile;
@end

@interface CustomMeasureViewController : UIViewController
@property(nonatomic) InitializationResult initializationResult;
@property(nonatomic, strong) RiskProfile *profile;
@property(nonatomic, strong) UIScrollView *scrollView;
@property(nonatomic, strong) UIStackView *contentStack;
@property(nonatomic, strong) UIView *cameraContainer;
@property(nonatomic, strong) UILabel *cameraPlaceholderLabel;
@property(nonatomic, strong) ShenaiView *shenaiController;
@property(nonatomic, strong) UIProgressView *progressView;
@property(nonatomic, strong) UILabel *statusLabel;
@property(nonatomic, strong) UIStackView *qualityStack;
@property(nonatomic, strong) UIStackView *headlineGrid;
@property(nonatomic, strong) UIButton *startButton;
@property(nonatomic, strong) UIButton *stopButton;
@property(nonatomic, strong) UIButton *resultsButton;
@property(nonatomic, strong) NSTimer *pollTimer;
@property(nonatomic) MeasurementState measurementState;
@property(nonatomic) BOOL hasMeasurementState;
@property(nonatomic, strong) MeasurementResults *realtimeMetrics;
@property(nonatomic, strong) MeasurementResults *results;
@property(nonatomic, strong) HealthRisks *healthRisks;
@property(nonatomic) MeasurementEnvironmentCondition violatedCondition;
@property(nonatomic) BOOL hasViolatedCondition;
@property(nonatomic) BOOL hasReachedFinalizing;
@property(nonatomic) BOOL hasFinishedMeasurement;
@property(nonatomic) float progress;
@property(nonatomic) BOOL polling;
@property(nonatomic) BOOL resettingMeasurement;
- (instancetype)initWithInitializationResult:(InitializationResult)initializationResult profile:(RiskProfile *)profile;
@end

@implementation CustomMeasureViewController

- (instancetype)initWithInitializationResult:(InitializationResult)initializationResult profile:(RiskProfile *)profile {
  self = [super initWithNibName:nil bundle:nil];
  if (self) {
    _initializationResult = initializationResult;
    _profile = profile;
  }
  return self;
}

- (BOOL)isInitialized {
  return self.initializationResult == InitializationResultSuccess;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  self.title = @"Custom UI";
  self.view.backgroundColor = UIColor.whiteColor;
  if (@available(iOS 13.0, *)) {
    self.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }
  self.navigationItem.rightBarButtonItem =
      [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"list.clipboard"]
                                       style:UIBarButtonItemStylePlain
                                      target:self
                                      action:@selector(openRiskForm)];

  [self buildLayout];
  [self configureCameraView];
  [self refreshSdkStateLoadingHealthRisks:NO];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleMeasurementFinished)
                                               name:MeasurementFinishedNotification
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appDidEnterBackground)
                                               name:UIApplicationDidEnterBackgroundNotification
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appWillEnterForeground)
                                               name:UIApplicationWillEnterForegroundNotification
                                             object:nil];

  self.pollTimer = [NSTimer scheduledTimerWithTimeInterval:0.2
                                                    target:self
                                                  selector:@selector(refreshTimerFired)
                                                  userInfo:nil
                                                   repeats:YES];
  if (self.isInitialized) {
    [ShenaiSDK setCameraMode:CameraModeFacingUser];
  }
}

- (void)dealloc {
  [self.pollTimer invalidate];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
  if (self.isInitialized) {
    [ShenaiSDK setCameraMode:CameraModeOff];
  }
}

- (void)viewWillAppear:(BOOL)animated {
  [super viewWillAppear:animated];
  if (self.isInitialized) {
    [ShenaiSDK setCameraMode:CameraModeFacingUser];
  }
}

- (void)viewWillDisappear:(BOOL)animated {
  [super viewWillDisappear:animated];
  if (self.isInitialized) {
    [ShenaiSDK setCameraMode:CameraModeOff];
  }
}

- (void)buildLayout {
  self.scrollView = [[UIScrollView alloc] init];
  self.scrollView.translatesAutoresizingMaskIntoConstraints = NO;
  self.contentStack = [[UIStackView alloc] init];
  self.contentStack.axis = UILayoutConstraintAxisVertical;
  self.contentStack.spacing = 18;
  self.contentStack.translatesAutoresizingMaskIntoConstraints = NO;
  [self.view addSubview:self.scrollView];
  [self.scrollView addSubview:self.contentStack];

  self.cameraContainer = [[UIView alloc] init];
  self.cameraContainer.translatesAutoresizingMaskIntoConstraints = NO;
  self.cameraContainer.backgroundColor = [UIColor colorWithWhite:0.93 alpha:1.0];
  self.cameraContainer.layer.borderColor = UIColor.blackColor.CGColor;
  self.cameraContainer.layer.borderWidth = 2;
  self.cameraContainer.clipsToBounds = YES;

  self.cameraPlaceholderLabel = BodyLabel(self.isInitialized ? @"" : [NSString stringWithFormat:@"Initialization failed: %ld", (long)self.initializationResult]);
  self.cameraPlaceholderLabel.textAlignment = NSTextAlignmentCenter;
  self.cameraPlaceholderLabel.translatesAutoresizingMaskIntoConstraints = NO;
  [self.cameraContainer addSubview:self.cameraPlaceholderLabel];

  self.progressView = [[UIProgressView alloc] initWithProgressViewStyle:UIProgressViewStyleDefault];
  self.progressView.progressTintColor = UIColor.blackColor;
  self.progressView.trackTintColor = [UIColor colorWithWhite:0.86 alpha:1.0];

  self.statusLabel = [[UILabel alloc] init];
  self.statusLabel.textAlignment = NSTextAlignmentCenter;
  self.statusLabel.numberOfLines = 0;
  self.statusLabel.textColor = UIColor.blackColor;

  self.qualityStack = [[UIStackView alloc] init];
  self.qualityStack.axis = UILayoutConstraintAxisVertical;
  self.qualityStack.spacing = 8;

  self.startButton = [UIButton buttonWithType:UIButtonTypeSystem];
  self.stopButton = [UIButton buttonWithType:UIButtonTypeSystem];
  StyleFilledButton(self.startButton, @"Start");
  StyleOutlinedButton(self.stopButton, @"Stop");
  [self.startButton addTarget:self action:@selector(startMeasurement) forControlEvents:UIControlEventTouchUpInside];
  [self.stopButton addTarget:self action:@selector(stopMeasurement) forControlEvents:UIControlEventTouchUpInside];

  UIStackView *buttonsRow = [[UIStackView alloc] initWithArrangedSubviews:@[ self.startButton, self.stopButton ]];
  buttonsRow.axis = UILayoutConstraintAxisHorizontal;
  buttonsRow.spacing = 12;
  buttonsRow.distribution = UIStackViewDistributionFillEqually;

  self.resultsButton = [UIButton buttonWithType:UIButtonTypeSystem];
  StyleFilledButton(self.resultsButton, @"SEE RESULTS");
  self.resultsButton.hidden = YES;
  [self.resultsButton addTarget:self action:@selector(openResults) forControlEvents:UIControlEventTouchUpInside];

  self.headlineGrid = [[UIStackView alloc] init];
  self.headlineGrid.axis = UILayoutConstraintAxisVertical;
  self.headlineGrid.spacing = 10;

  UIView *cameraWrapper = [[UIView alloc] init];
  [cameraWrapper addSubview:self.cameraContainer];
  [self.contentStack addArrangedSubview:cameraWrapper];
  [self.contentStack addArrangedSubview:self.progressView];
  [self.contentStack addArrangedSubview:self.statusLabel];
  [self.contentStack addArrangedSubview:self.qualityStack];
  [self.contentStack addArrangedSubview:buttonsRow];
  [self.contentStack addArrangedSubview:self.resultsButton];
  [self.contentStack addArrangedSubview:self.headlineGrid];

  [NSLayoutConstraint activateConstraints:@[
    [self.scrollView.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
    [self.scrollView.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
    [self.scrollView.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor],
    [self.scrollView.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],
    [self.contentStack.leadingAnchor constraintEqualToAnchor:self.scrollView.contentLayoutGuide.leadingAnchor constant:20],
    [self.contentStack.trailingAnchor constraintEqualToAnchor:self.scrollView.contentLayoutGuide.trailingAnchor constant:-20],
    [self.contentStack.topAnchor constraintEqualToAnchor:self.scrollView.contentLayoutGuide.topAnchor constant:12],
    [self.contentStack.bottomAnchor constraintEqualToAnchor:self.scrollView.contentLayoutGuide.bottomAnchor constant:-28],
    [self.contentStack.widthAnchor constraintEqualToAnchor:self.scrollView.frameLayoutGuide.widthAnchor constant:-40],
    [self.cameraContainer.centerXAnchor constraintEqualToAnchor:cameraWrapper.centerXAnchor],
    [self.cameraContainer.topAnchor constraintEqualToAnchor:cameraWrapper.topAnchor],
    [self.cameraContainer.bottomAnchor constraintEqualToAnchor:cameraWrapper.bottomAnchor],
    [self.cameraContainer.widthAnchor constraintEqualToConstant:260],
    [self.cameraContainer.heightAnchor constraintEqualToAnchor:self.cameraContainer.widthAnchor],
    [self.cameraPlaceholderLabel.leadingAnchor constraintEqualToAnchor:self.cameraContainer.leadingAnchor constant:16],
    [self.cameraPlaceholderLabel.trailingAnchor constraintEqualToAnchor:self.cameraContainer.trailingAnchor constant:-16],
    [self.cameraPlaceholderLabel.centerYAnchor constraintEqualToAnchor:self.cameraContainer.centerYAnchor],
    [self.startButton.heightAnchor constraintEqualToConstant:44],
    [self.stopButton.heightAnchor constraintEqualToConstant:44],
    [self.resultsButton.heightAnchor constraintEqualToConstant:44],
  ]];
}

- (void)viewDidLayoutSubviews {
  [super viewDidLayoutSubviews];
  self.cameraContainer.layer.cornerRadius = self.cameraContainer.bounds.size.width / 2.0;
}

- (void)configureCameraView {
  if (!self.isInitialized) {
    return;
  }
  self.cameraPlaceholderLabel.hidden = YES;
  ShenaiView *controller = [[ShenaiView alloc] init];
  [self addChildViewController:controller];
  controller.view.translatesAutoresizingMaskIntoConstraints = NO;
  [self.cameraContainer addSubview:controller.view];
  [NSLayoutConstraint activateConstraints:@[
    [controller.view.centerXAnchor constraintEqualToAnchor:self.cameraContainer.centerXAnchor],
    [controller.view.centerYAnchor constraintEqualToAnchor:self.cameraContainer.centerYAnchor],
    [controller.view.widthAnchor constraintEqualToAnchor:self.cameraContainer.widthAnchor],
    [controller.view.heightAnchor constraintEqualToAnchor:self.cameraContainer.widthAnchor multiplier:16.0 / 9.0],
  ]];
  [controller didMoveToParentViewController:self];
  self.shenaiController = controller;
}

- (void)refreshTimerFired {
  [self refreshSdkStateLoadingHealthRisks:NO];
}

- (void)startMeasurement {
  if (!self.isInitialized) {
    return;
  }
  self.resettingMeasurement = YES;
  [self resetMeasurementUiState];
  [ShenaiSDK setCameraMode:CameraModeFacingUser];
  [ShenaiSDK resetMeasurementSession];
  [ShenaiSDK setOperatingMode:OperatingModeMeasure];
  [ShenaiSDK startMeasurement];
  self.resettingMeasurement = NO;
  [self refreshSdkStateLoadingHealthRisks:NO];
}

- (void)stopMeasurement {
  if (!self.isInitialized) {
    return;
  }
  self.resettingMeasurement = YES;
  [ShenaiSDK resetMeasurementSession];
  [ShenaiSDK setCameraMode:CameraModeFacingUser];
  [self resetMeasurementUiState];
  self.resettingMeasurement = NO;
}

- (void)refreshSdkStateLoadingHealthRisks:(BOOL)loadHealthRisks {
  if (self.polling || self.resettingMeasurement || !self.isInitialized) {
    [self updateUi];
    return;
  }
  self.polling = YES;
  self.measurementState = [ShenaiSDK getMeasurementState];
  self.hasMeasurementState = YES;
  self.progress = [ShenaiSDK getMeasurementProgressPercentage];
  NSNumber *rawCondition = [ShenaiSDK getCurrentViolatedMeasurementEnvironmentCondition];
  self.hasViolatedCondition = rawCondition != nil;
  if (rawCondition != nil) {
    self.violatedCondition = rawCondition.integerValue;
  }

  if (IsRunningMeasurementState(self.measurementState, self.hasMeasurementState)) {
    self.realtimeMetrics = [ShenaiSDK getRealtimeMetrics:10.0] ?: self.realtimeMetrics;
  } else {
    self.realtimeMetrics = nil;
  }

  if (self.hasFinishedMeasurement || self.measurementState == MeasurementStateFinished) {
    self.results = [ShenaiSDK getMeasurementResults] ?: self.results;
  }
  if (self.measurementState == MeasurementStateFinalizing) {
    self.hasReachedFinalizing = YES;
  }
  if (self.measurementState == MeasurementStateFinished) {
    self.hasFinishedMeasurement = YES;
  }
  if (loadHealthRisks || (self.measurementState == MeasurementStateFinished && self.healthRisks == nil)) {
    self.healthRisks = [ShenaiHealthRisks computeHealthRisks:[self.profile toRisksFactorsWithResults:self.results]];
  }
  self.polling = NO;
  [self updateUi];
}

- (void)resetMeasurementUiState {
  self.hasMeasurementState = NO;
  self.realtimeMetrics = nil;
  self.results = nil;
  self.healthRisks = nil;
  self.hasViolatedCondition = NO;
  self.hasReachedFinalizing = NO;
  self.hasFinishedMeasurement = NO;
  self.progress = 0;
  [self updateUi];
}

- (void)updateUi {
  BOOL running = IsRunningMeasurementState(self.measurementState, self.hasMeasurementState);
  BOOL measurementFinished = self.hasFinishedMeasurement || (self.hasMeasurementState && self.measurementState == MeasurementStateFinished);
  MeasurementResults *displayResults = self.results ?: self.realtimeMetrics;

  self.progressView.progress = self.progress / 100.0f;
  self.statusLabel.text = [NSString stringWithFormat:@"%@ - %@%%",
                                                     MeasurementStatusText(self.measurementState,
                                                                           self.hasMeasurementState,
                                                                           self.violatedCondition,
                                                                           self.hasViolatedCondition,
                                                                           self.hasReachedFinalizing,
                                                                           self.hasFinishedMeasurement),
                                                     FormatNumber(@(self.progress), 0)];
  SetFilledButtonEnabled(self.startButton, self.isInitialized && !running);
  SetOutlinedButtonEnabled(self.stopButton, self.isInitialized && running);
  self.resultsButton.hidden = !measurementFinished;
  SetFilledButtonEnabled(self.resultsButton, measurementFinished && self.results != nil);
  [self setQualityRowsWithResults:displayResults];
  [self setHeadlineRowsWithResults:displayResults];
}

- (void)setQualityRowsWithResults:(MeasurementResults *)results {
  for (UIView *view in self.qualityStack.arrangedSubviews.copy) {
    [self.qualityStack removeArrangedSubview:view];
    [view removeFromSuperview];
  }
  [self.qualityStack addArrangedSubview:SectionTitle(@"Live quality")];
  NSArray<UIView *> *rows = QualityRows(results);
  if (rows.count == 0) {
    [self.qualityStack addArrangedSubview:BodyLabel(@"Quality will appear during the measurement.")];
    return;
  }
  for (UIView *row in rows) {
    [self.qualityStack addArrangedSubview:row];
  }
}

- (void)setHeadlineRowsWithResults:(MeasurementResults *)results {
  for (UIView *view in self.headlineGrid.arrangedSubviews.copy) {
    [self.headlineGrid removeArrangedSubview:view];
    [view removeFromSuperview];
  }
  [self.headlineGrid addArrangedSubview:Grid(HeadlineValues(results))];
}

- (void)openRiskForm {
  HealthFormViewController *form = [[HealthFormViewController alloc] initWithProfile:self.profile];
  __weak typeof(self) weakSelf = self;
  form.onSaved = ^(RiskProfile *profile) {
    weakSelf.profile = profile;
    [weakSelf computeHealthRisksWithProfile:profile];
  };
  [self.navigationController pushViewController:form animated:YES];
}

- (void)openResults {
  if (!(self.hasFinishedMeasurement || self.measurementState == MeasurementStateFinished) || self.results == nil) {
    return;
  }
  ResultViewController *controller = [[ResultViewController alloc] initWithResults:self.results risks:self.healthRisks profile:self.profile];
  __weak typeof(self) weakSelf = self;
  controller.onProfileSaved = ^(RiskProfile *profile) {
    weakSelf.profile = profile;
    [weakSelf computeHealthRisksWithProfile:profile];
  };
  controller.onRisksChanged = ^(HealthRisks *risks) {
    weakSelf.healthRisks = risks;
  };
  [self.navigationController pushViewController:controller animated:YES];
}

- (void)computeHealthRisksWithProfile:(RiskProfile *)profile {
  if (!self.isInitialized || self.results == nil) {
    return;
  }
  self.healthRisks = [ShenaiHealthRisks computeHealthRisks:[profile toRisksFactorsWithResults:self.results]];
  [self updateUi];
}

- (void)handleMeasurementFinished {
  if (self.resettingMeasurement ||
      !(IsRunningMeasurementState(self.measurementState, self.hasMeasurementState) || self.hasReachedFinalizing ||
        self.measurementState == MeasurementStateFinished)) {
    return;
  }
  self.hasFinishedMeasurement = YES;
  [self refreshSdkStateLoadingHealthRisks:YES];
}

- (void)appDidEnterBackground {
  if (self.isInitialized) {
    [ShenaiSDK setCameraMode:CameraModeOff];
  }
}

- (void)appWillEnterForeground {
  if (self.isInitialized && self.navigationController.topViewController == self) {
    [ShenaiSDK setCameraMode:CameraModeFacingUser];
  }
}

@end

@implementation ResultViewController

- (instancetype)initWithResults:(MeasurementResults *)results risks:(HealthRisks *)risks profile:(RiskProfile *)profile {
  self = [super initWithNibName:nil bundle:nil];
  if (self) {
    _results = results;
    _risks = risks;
    _profile = profile;
  }
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  self.title = @"Results";
  self.view.backgroundColor = UIColor.whiteColor;
  if (@available(iOS 13.0, *)) {
    self.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }
  self.navigationItem.rightBarButtonItem =
      [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"list.clipboard"]
                                       style:UIBarButtonItemStylePlain
                                      target:self
                                      action:@selector(openRiskForm)];

  UIScrollView *scroll = [[UIScrollView alloc] init];
  scroll.translatesAutoresizingMaskIntoConstraints = NO;
  self.stack = [[UIStackView alloc] init];
  self.stack.axis = UILayoutConstraintAxisVertical;
  self.stack.spacing = 20;
  self.stack.translatesAutoresizingMaskIntoConstraints = NO;
  [self.view addSubview:scroll];
  [scroll addSubview:self.stack];

  [NSLayoutConstraint activateConstraints:@[
    [scroll.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
    [scroll.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
    [scroll.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor],
    [scroll.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],
    [self.stack.leadingAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.leadingAnchor constant:20],
    [self.stack.trailingAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.trailingAnchor constant:-20],
    [self.stack.topAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.topAnchor constant:20],
    [self.stack.bottomAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.bottomAnchor constant:-28],
    [self.stack.widthAnchor constraintEqualToAnchor:scroll.frameLayoutGuide.widthAnchor constant:-40],
  ]];
  [self render];
}

- (void)render {
  for (UIView *view in self.stack.arrangedSubviews.copy) {
    [self.stack removeArrangedSubview:view];
    [view removeFromSuperview];
  }
  [self.stack addArrangedSubview:QualityIndicator(@"Measurement quality", self.results)];
  [self.stack addArrangedSubview:Grid(MeasurementMetricValues(self.results))];
  [self.stack addArrangedSubview:SectionTitle(@"Health indices")];
  [self.stack addArrangedSubview:Grid(HealthRiskValues(self.risks))];
}

- (void)openRiskForm {
  HealthFormViewController *form = [[HealthFormViewController alloc] initWithProfile:self.profile];
  __weak typeof(self) weakSelf = self;
  form.onSaved = ^(RiskProfile *profile) {
    weakSelf.profile = profile;
    if (weakSelf.onProfileSaved) {
      weakSelf.onProfileSaved(profile);
    }
    if (weakSelf.results != nil) {
      weakSelf.risks = [ShenaiHealthRisks computeHealthRisks:[profile toRisksFactorsWithResults:weakSelf.results]];
      if (weakSelf.onRisksChanged) {
        weakSelf.onRisksChanged(weakSelf.risks);
      }
      [weakSelf render];
    }
  };
  [self.navigationController pushViewController:form animated:YES];
}

@end

static UITextField *NumberField(NSString *title, double value) {
  UITextField *field = [[UITextField alloc] init];
  field.borderStyle = UITextBorderStyleRoundedRect;
  field.placeholder = title;
  field.text = FormatNumber(@(value), fmod(value, 1.0) == 0 ? 0 : 1);
  field.keyboardType = UIKeyboardTypeDecimalPad;
  field.textColor = UIColor.blackColor;
  field.backgroundColor = UIColor.whiteColor;
  [field.heightAnchor constraintEqualToConstant:44].active = YES;
  return field;
}

static UIStackView *FormField(NSString *title, UITextField *field) {
  UILabel *label = [[UILabel alloc] init];
  label.text = title;
  label.font = [UIFont preferredFontForTextStyle:UIFontTextStyleSubheadline];
  label.textColor = UIColor.blackColor;
  UIStackView *stack = [[UIStackView alloc] initWithArrangedSubviews:@[ label, field ]];
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 6;
  return stack;
}

static UIView *SwitchRow(NSString *title, UISwitch *control) {
  UILabel *label = BodyLabel(title);
  UIStackView *row = [[UIStackView alloc] initWithArrangedSubviews:@[ label, control ]];
  row.axis = UILayoutConstraintAxisHorizontal;
  row.alignment = UIStackViewAlignmentCenter;
  row.distribution = UIStackViewDistributionEqualSpacing;
  return row;
}

static UIView *SegmentedRow(NSString *title, UISegmentedControl *control) {
  UILabel *label = BodyLabel(title);
  UIStackView *stack = [[UIStackView alloc] initWithArrangedSubviews:@[ label, control ]];
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 6;
  return stack;
}

static NSInteger SelectedIndex(NSInteger value, NSArray<NSNumber *> *values) {
  for (NSInteger index = 0; index < values.count; index++) {
    if (values[index].integerValue == value) {
      return index;
    }
  }
  return 0;
}

static NSInteger SelectedValue(UISegmentedControl *control, NSArray<NSNumber *> *values, NSInteger fallback) {
  if (control.selectedSegmentIndex < 0 || control.selectedSegmentIndex >= values.count) {
    return fallback;
  }
  return values[control.selectedSegmentIndex].integerValue;
}

@implementation HealthFormViewController

- (instancetype)initWithProfile:(RiskProfile *)profile {
  self = [super initWithNibName:nil bundle:nil];
  if (self) {
    _profile = [profile copy];
    _fields = [NSMutableDictionary dictionary];
    _countryField = [[UITextField alloc] init];
    _smokerSwitch = [[UISwitch alloc] init];
    _diabetesSwitch = [[UISwitch alloc] init];
    _fruitSwitch = [[UISwitch alloc] init];
    _highGlucoseSwitch = [[UISwitch alloc] init];
    _hypertensionSwitch = [[UISwitch alloc] init];
    _genderControl = [[UISegmentedControl alloc] initWithItems:@[ @"Female", @"Male", @"Other" ]];
    _activityControl = [[UISegmentedControl alloc] initWithItems:@[ @"Sedentary", @"Light", @"Moderate", @"Very", @"Extra" ]];
    _raceControl = [[UISegmentedControl alloc] initWithItems:@[ @"White", @"African-American", @"Other" ]];
    _treatmentControl = [[UISegmentedControl alloc] initWithItems:@[ @"Not needed", @"No", @"Yes" ]];
    _familyControl = [[UISegmentedControl alloc] initWithItems:@[ @"None", @"No first-degree", @"First-degree" ]];
    _parentalControl = [[UISegmentedControl alloc] initWithItems:@[ @"None", @"One", @"Both" ]];
  }
  return self;
}

- (void)viewDidLoad {
  [super viewDidLoad];
  self.title = @"Health form";
  self.view.backgroundColor = UIColor.whiteColor;
  if (@available(iOS 13.0, *)) {
    self.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }
  self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"Save"
                                                                            style:UIBarButtonItemStyleDone
                                                                           target:self
                                                                           action:@selector(save)];

  UIScrollView *scroll = [[UIScrollView alloc] init];
  UIStackView *stack = [[UIStackView alloc] init];
  scroll.translatesAutoresizingMaskIntoConstraints = NO;
  stack.translatesAutoresizingMaskIntoConstraints = NO;
  stack.axis = UILayoutConstraintAxisVertical;
  stack.spacing = 12;
  [self.view addSubview:scroll];
  [scroll addSubview:stack];

  NSArray<NSArray *> *items = @[
    @[ @"age", @"Age", @(self.profile.age) ],
    @[ @"heightCm", @"Height (cm)", @(self.profile.heightCm) ],
    @[ @"weightKg", @"Weight (kg)", @(self.profile.weightKg) ],
    @[ @"waistCm", @"Waist (cm)", @(self.profile.waistCm) ],
    @[ @"neckCm", @"Neck (cm)", @(self.profile.neckCm) ],
    @[ @"hipCm", @"Hip (cm)", @(self.profile.hipCm) ],
    @[ @"cholesterol", @"Cholesterol", @(self.profile.cholesterol) ],
    @[ @"hdl", @"HDL", @(self.profile.hdl) ],
    @[ @"sbp", @"SBP", @(self.profile.sbp) ],
    @[ @"dbp", @"DBP", @(self.profile.dbp) ],
    @[ @"triglyceride", @"Triglyceride", @(self.profile.triglyceride) ],
    @[ @"fastingGlucose", @"Fasting glucose", @(self.profile.fastingGlucose) ],
  ];
  for (NSArray *item in items) {
    UITextField *field = NumberField(item[1], [item[2] doubleValue]);
    self.fields[item[0]] = field;
    [stack addArrangedSubview:FormField(item[1], field)];
  }

  self.countryField.borderStyle = UITextBorderStyleRoundedRect;
  self.countryField.placeholder = @"Country";
  self.countryField.text = self.profile.country;
  self.countryField.textColor = UIColor.blackColor;
  self.countryField.backgroundColor = UIColor.whiteColor;
  self.countryField.autocapitalizationType = UITextAutocapitalizationTypeAllCharacters;
  [self.countryField.heightAnchor constraintEqualToConstant:44].active = YES;
  [stack addArrangedSubview:FormField(@"Country", self.countryField)];

  self.smokerSwitch.on = self.profile.smoker;
  self.diabetesSwitch.on = self.profile.diabetes;
  self.fruitSwitch.on = self.profile.vegetableFruitDiet;
  self.highGlucoseSwitch.on = self.profile.historyOfHighGlucose;
  self.hypertensionSwitch.on = self.profile.historyOfHypertension;
  self.genderControl.selectedSegmentIndex = SelectedIndex(self.profile.gender, @[ @(GenderFemale), @(GenderMale), @(GenderOther) ]);
  self.activityControl.selectedSegmentIndex =
      SelectedIndex(self.profile.physicalActivity, @[ @(Sedentary), @(LightlyActive), @(Moderately), @(VeryActive), @(ExtraActive) ]);
  self.raceControl.selectedSegmentIndex = SelectedIndex(self.profile.race, @[ @(RaceWhite), @(RaceAfricanAmerican), @(RaceOther) ]);
  self.treatmentControl.selectedSegmentIndex =
      SelectedIndex(self.profile.hypertensionTreatment, @[ @(HypertensionTreatmentNotNeeded), @(HypertensionTreatmentNo), @(HypertensionTreatmentYes) ]);
  self.familyControl.selectedSegmentIndex =
      SelectedIndex(self.profile.familyDiabetes, @[ @(FamilyHistoryNone), @(FamilyHistoryNoneFirstDegree), @(FamilyHistoryFirstDegree) ]);
  self.parentalControl.selectedSegmentIndex =
      SelectedIndex(self.profile.parentalHypertension, @[ @(ParentalHistoryNone), @(ParentalHistoryOne), @(ParentalHistoryBoth) ]);

  [stack addArrangedSubview:SegmentedRow(@"Gender", self.genderControl)];
  [stack addArrangedSubview:SegmentedRow(@"Physical activity", self.activityControl)];
  [stack addArrangedSubview:SegmentedRow(@"Race", self.raceControl)];
  [stack addArrangedSubview:SegmentedRow(@"Hypertension treatment", self.treatmentControl)];
  [stack addArrangedSubview:SegmentedRow(@"Family diabetes", self.familyControl)];
  [stack addArrangedSubview:SegmentedRow(@"Parental hypertension", self.parentalControl)];
  [stack addArrangedSubview:SwitchRow(@"Smoker", self.smokerSwitch)];
  [stack addArrangedSubview:SwitchRow(@"Diabetes", self.diabetesSwitch)];
  [stack addArrangedSubview:SwitchRow(@"Fruit / vegetable diet", self.fruitSwitch)];
  [stack addArrangedSubview:SwitchRow(@"High glucose history", self.highGlucoseSwitch)];
  [stack addArrangedSubview:SwitchRow(@"Hypertension history", self.hypertensionSwitch)];

  [NSLayoutConstraint activateConstraints:@[
    [scroll.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
    [scroll.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
    [scroll.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor],
    [scroll.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor],
    [stack.leadingAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.leadingAnchor constant:20],
    [stack.trailingAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.trailingAnchor constant:-20],
    [stack.topAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.topAnchor constant:20],
    [stack.bottomAnchor constraintEqualToAnchor:scroll.contentLayoutGuide.bottomAnchor constant:-28],
    [stack.widthAnchor constraintEqualToAnchor:scroll.frameLayoutGuide.widthAnchor constant:-40],
  ]];
}

- (double)readDouble:(NSString *)key fallback:(double)fallback {
  double value = self.fields[key].text.doubleValue;
  return value == 0 && self.fields[key].text.length == 0 ? fallback : value;
}

- (void)save {
  self.profile.age = (NSInteger)[self readDouble:@"age" fallback:self.profile.age];
  self.profile.heightCm = [self readDouble:@"heightCm" fallback:self.profile.heightCm];
  self.profile.weightKg = [self readDouble:@"weightKg" fallback:self.profile.weightKg];
  self.profile.waistCm = [self readDouble:@"waistCm" fallback:self.profile.waistCm];
  self.profile.neckCm = [self readDouble:@"neckCm" fallback:self.profile.neckCm];
  self.profile.hipCm = [self readDouble:@"hipCm" fallback:self.profile.hipCm];
  self.profile.cholesterol = [self readDouble:@"cholesterol" fallback:self.profile.cholesterol];
  self.profile.hdl = [self readDouble:@"hdl" fallback:self.profile.hdl];
  self.profile.sbp = [self readDouble:@"sbp" fallback:self.profile.sbp];
  self.profile.dbp = [self readDouble:@"dbp" fallback:self.profile.dbp];
  self.profile.triglyceride = [self readDouble:@"triglyceride" fallback:self.profile.triglyceride];
  self.profile.fastingGlucose = [self readDouble:@"fastingGlucose" fallback:self.profile.fastingGlucose];
  self.profile.smoker = self.smokerSwitch.on;
  self.profile.diabetes = self.diabetesSwitch.on;
  self.profile.vegetableFruitDiet = self.fruitSwitch.on;
  self.profile.historyOfHighGlucose = self.highGlucoseSwitch.on;
  self.profile.historyOfHypertension = self.hypertensionSwitch.on;
  NSString *country = [self.countryField.text stringByTrimmingCharactersInSet:NSCharacterSet.whitespaceAndNewlineCharacterSet];
  self.profile.country = country.length > 0 ? country : @"US";
  self.profile.gender = (Gender)SelectedValue(self.genderControl, @[ @(GenderFemale), @(GenderMale), @(GenderOther) ], self.profile.gender);
  self.profile.physicalActivity =
      (PhysicalActivity)SelectedValue(self.activityControl, @[ @(Sedentary), @(LightlyActive), @(Moderately), @(VeryActive), @(ExtraActive) ],
                                      self.profile.physicalActivity);
  self.profile.race = (Race)SelectedValue(self.raceControl, @[ @(RaceWhite), @(RaceAfricanAmerican), @(RaceOther) ], self.profile.race);
  self.profile.hypertensionTreatment =
      (HypertensionTreatment)SelectedValue(self.treatmentControl,
                                           @[ @(HypertensionTreatmentNotNeeded), @(HypertensionTreatmentNo), @(HypertensionTreatmentYes) ],
                                           self.profile.hypertensionTreatment);
  self.profile.familyDiabetes = (FamilyHistory)SelectedValue(
      self.familyControl, @[ @(FamilyHistoryNone), @(FamilyHistoryNoneFirstDegree), @(FamilyHistoryFirstDegree) ], self.profile.familyDiabetes);
  self.profile.parentalHypertension =
      (ParentalHistory)SelectedValue(self.parentalControl, @[ @(ParentalHistoryNone), @(ParentalHistoryOne), @(ParentalHistoryBoth) ],
                                     self.profile.parentalHypertension);
  if (self.onSaved) {
    self.onSaved(self.profile);
  }
  [self.navigationController popViewControllerAnimated:YES];
}

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  RiskProfile *profile = [RiskProfile defaults];
  InitializationSettings *settings = CustomUiSettings(profile);
  settings.eventCallback = ^(Event event) {
    NSLog(@"Shen.AI event: %ld", (long)event);
    if (event == EventMeasurementFinished) {
      dispatch_async(dispatch_get_main_queue(), ^{
        [[NSNotificationCenter defaultCenter] postNotificationName:MeasurementFinishedNotification object:nil];
      });
    }
  };

  InitializationResult result = [ShenaiSDK initialize:ShenApiKey() userID:@"" settings:settings];
  self.window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
  if (@available(iOS 13.0, *)) {
    self.window.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
  }
  self.window.rootViewController =
      [[UINavigationController alloc] initWithRootViewController:[[CustomMeasureViewController alloc] initWithInitializationResult:result profile:profile]];
  [self.window makeKeyAndVisible];
  return YES;
}

@end
