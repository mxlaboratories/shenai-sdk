import UIKit
import ShenaiSDK

private func normalizedApiKey(_ value: String?) -> String? {
    guard let value else { return nil }
    let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty, trimmed != "$(SHENAI_API_KEY)" else { return nil }
    return trimmed
}

private var shenApiKey: String {
    if let value = normalizedApiKey(Bundle.main.object(forInfoDictionaryKey: "SHENAI_API_KEY") as? String) {
        return value
    }
    return normalizedApiKey(ProcessInfo.processInfo.environment["SHENAI_API_KEY"]) ?? ""
}

private enum ShenaiEnumValues {
    static let uiVersionV2 = UiVersion(rawValue: 1)!
    static let activityModerately = PhysicalActivity(rawValue: 2)!
}

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let result = ShenaiSDK.initialize(shenApiKey, userID: "", settings: minimalExampleSettings())
        window = UIWindow(frame: UIScreen.main.bounds)
        if #available(iOS 13.0, *) {
            window?.overrideUserInterfaceStyle = .light
        }
        window?.rootViewController = UINavigationController(
            rootViewController: MinimalViewController(initializationResult: result)
        )
        window?.makeKeyAndVisible()
        return true
    }
}

private final class MinimalViewController: UIViewController {
    private let contentView = UIView()
    private let statusLabel = UILabel()
    private var shenaiController: ShenaiView?
    private var initializationResult: InitializationResult
    private var isSdkInitialized: Bool
    private var appResumed = true

    init(initializationResult: InitializationResult) {
        self.initializationResult = initializationResult
        self.isSdkInitialized = initializationResult == .success
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Shen.AI Minimal"
        view.backgroundColor = .white
        buildLayout()
        updateInitializationButton()
        syncSdkViewVisibility()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(appWillEnterForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        if isSdkInitialized {
            ShenaiSDK.setCameraMode(.off)
        }
    }

    private func buildLayout() {
        contentView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(contentView)

        statusLabel.textAlignment = .center
        statusLabel.numberOfLines = 0
        statusLabel.textColor = .black
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(statusLabel)

        NSLayoutConstraint.activate([
            contentView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            contentView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            contentView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            statusLabel.centerXAnchor.constraint(equalTo: contentView.centerXAnchor),
            statusLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            statusLabel.leadingAnchor.constraint(greaterThanOrEqualTo: contentView.leadingAnchor, constant: 24),
            statusLabel.trailingAnchor.constraint(lessThanOrEqualTo: contentView.trailingAnchor, constant: -24),
        ])
    }

    private func syncSdkViewVisibility() {
        let shouldShowSdkView = isSdkInitialized && appResumed
        if shouldShowSdkView {
            statusLabel.isHidden = true
            addSdkViewIfNeeded()
            ShenaiSDK.setCameraMode(.facingUser)
        } else {
            removeSdkViewIfNeeded()
            statusLabel.isHidden = false
            statusLabel.text = statusText()
            if isSdkInitialized {
                ShenaiSDK.setCameraMode(.off)
            }
        }
    }

    private func addSdkViewIfNeeded() {
        guard shenaiController == nil else { return }
        let controller = ShenaiView()
        addChild(controller)
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(controller.view)
        NSLayoutConstraint.activate([
            controller.view.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            controller.view.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            controller.view.topAnchor.constraint(equalTo: contentView.topAnchor),
            controller.view.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
        ])
        controller.didMove(toParent: self)
        shenaiController = controller
    }

    private func removeSdkViewIfNeeded() {
        guard let controller = shenaiController else { return }
        controller.willMove(toParent: nil)
        controller.view.removeFromSuperview()
        controller.removeFromParent()
        shenaiController = nil
    }

    private func statusText() -> String {
        if isSdkInitialized {
            return "SDK view paused"
        }
        if initializationResult == .success {
            return "SDK deinitialized"
        }
        return "Initialization failed: \(initializationResult)"
    }

    private func updateInitializationButton() {
        let imageName = isSdkInitialized ? "power" : "power.circle"
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            image: UIImage(systemName: imageName),
            style: .plain,
            target: self,
            action: #selector(toggleSdkInitialization)
        )
        navigationItem.leftBarButtonItem?.tintColor = .black
        navigationItem.leftBarButtonItem?.accessibilityLabel = isSdkInitialized
            ? "Deinitialize SDK"
            : "Initialize SDK"
    }

    @objc private func toggleSdkInitialization() {
        if isSdkInitialized {
            ShenaiSDK.setCameraMode(.off)
            removeSdkViewIfNeeded()
            ShenaiSDK.deinitialize()
            isSdkInitialized = false
            syncSdkViewVisibility()
            updateInitializationButton()
            return
        }

        initializationResult = ShenaiSDK.initialize(
            shenApiKey,
            userID: "",
            settings: minimalExampleSettings()
        )
        isSdkInitialized = initializationResult == .success
        syncSdkViewVisibility()
        updateInitializationButton()
    }

    @objc private func appDidEnterBackground() {
        appResumed = false
        syncSdkViewVisibility()
    }

    @objc private func appWillEnterForeground() {
        appResumed = true
        syncSdkViewVisibility()
    }
}

private func minimalExampleSettings() -> InitializationSettings {
    let settings = InitializationSettings()
    settings.precisionMode = .relaxed
    settings.operatingMode = .measure
    settings.measurementPreset = .thirtySecondsAllMetrics
    settings.cameraMode = .facingUser
    settings.onboardingMode = .showOnce
    settings.showUserInterface = true
    settings.showFacePositioningOverlay = true
    settings.showVisualWarnings = true
    settings.enableCameraSwap = true
    settings.showFaceMask = true
    settings.showBloodFlow = true
    settings.enableStartAfterSuccess = false
    settings.enableSummaryScreen = true
    settings.showResultsFinishButton = true
    settings.enableHealthRisks = true
    settings.showHealthIndicesFinishButton = true
    settings.saveHealthRisksFactors = true
    settings.showOutOfRangeResultIndicators = true
    settings.applyPrecisionModeToBloodPressure = false
    settings.showSignalQualityIndicator = true
    settings.showSignalTile = true
    settings.showStartStopButton = true
    settings.showInfoButton = true
    settings.showDisclaimer = true
    settings.uiVersion = ShenaiEnumValues.uiVersionV2
    settings.risksFactors = exampleRiskFactors()
    return settings
}

private func exampleRiskFactors() -> RisksFactors {
    let factors = RisksFactors()
    factors.age = NSNumber(value: 45)
    factors.cholesterol = NSNumber(value: 190)
    factors.cholesterolHDL = NSNumber(value: 52)
    factors.sbp = NSNumber(value: 128)
    factors.dbp = NSNumber(value: 82)
    factors.isSmoker = NSNumber(value: false)
    factors.hypertensionTreatment = .no
    factors.hasDiabetes = NSNumber(value: false)
    factors.bodyHeight = NSNumber(value: 172)
    factors.bodyWeight = NSNumber(value: 74)
    factors.waistCircumference = NSNumber(value: 84)
    factors.neckCircumference = NSNumber(value: 38)
    factors.hipCircumference = NSNumber(value: 98)
    factors.gender = .female
    factors.physicalActivity = ShenaiEnumValues.activityModerately
    factors.country = "US"
    factors.race = .white
    factors.vegetableFruitDiet = NSNumber(value: true)
    factors.historyOfHighGlucose = NSNumber(value: false)
    factors.historyOfHypertension = NSNumber(value: false)
    factors.triglyceride = NSNumber(value: 120)
    factors.fastingGlucose = NSNumber(value: 92)
    factors.familyDiabetes = .noneFirstDegree
    factors.parentalHypertension = .none
    return factors
}
