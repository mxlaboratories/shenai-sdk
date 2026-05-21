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
    // Some Obj-C enum cases from the SDK are not imported as Swift dot-syntax cases.
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
        window = UIWindow(frame: UIScreen.main.bounds)
        if #available(iOS 13.0, *) {
            window?.overrideUserInterfaceStyle = .light
        }
        let navigationController = UINavigationController(rootViewController: FlowHomeViewController())
        navigationController.setNavigationBarHidden(true, animated: false)
        window?.rootViewController = navigationController
        window?.makeKeyAndVisible()
        return true
    }
}

private struct FlowConfig {
    let initialScreen: Screen?
    let screens: [Screen]
    let dashboardOnly: Bool
    let resetMeasurement: Bool
    let showPdfActionsAfterFinish: Bool
    let disableMeasurementsDashboard: Bool
}

private let dashboardFlow = FlowConfig(
    initialScreen: nil,
    screens: [.dashboard],
    dashboardOnly: true,
    resetMeasurement: false,
    showPdfActionsAfterFinish: false,
    disableMeasurementsDashboard: false
)

private let measurementFlow = FlowConfig(
    initialScreen: .measurement,
    screens: [.measurement, .results, .healthRisks],
    dashboardOnly: false,
    resetMeasurement: true,
    showPdfActionsAfterFinish: true,
    disableMeasurementsDashboard: true
)

private final class FlowHomeViewController: UIViewController {
    private let statusLabel = UILabel()
    private var openingFlow = false
    private weak var activeSdkController: FlowSdkViewController?

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white

        let titleLabel = UILabel()
        titleLabel.text = "Shen.AI Flow"
        titleLabel.font = .preferredFont(forTextStyle: .title2)
        titleLabel.textColor = .black
        titleLabel.textAlignment = .center

        statusLabel.textAlignment = .center
        statusLabel.numberOfLines = 0
        statusLabel.textColor = .black
        statusLabel.isHidden = true

        let dashboardButton = makeActionButton(title: "Dashboard")
        dashboardButton.addAction(UIAction { [weak self] _ in
            self?.openFlow(dashboardFlow)
        }, for: .touchUpInside)

        let measurementButton = makeActionButton(title: "Measurement")
        measurementButton.addAction(UIAction { [weak self] _ in
            self?.openFlow(measurementFlow)
        }, for: .touchUpInside)

        let stack = UIStackView(arrangedSubviews: [
            titleLabel,
            statusLabel,
            dashboardButton,
            measurementButton,
        ])
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.centerYAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerYAnchor),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            stack.widthAnchor.constraint(lessThanOrEqualToConstant: 360),
            dashboardButton.heightAnchor.constraint(equalToConstant: 54),
            measurementButton.heightAnchor.constraint(equalToConstant: 54),
        ])
    }

    private func openFlow(_ flow: FlowConfig) {
        guard !openingFlow else { return }
        openingFlow = true
        statusLabel.isHidden = true

        if ShenaiSDK.isInitialized() {
            ShenaiSDK.deinitialize()
        }

        let settings = uiFlowSettings(screens: flow.screens, dashboardOnly: flow.dashboardOnly)
        settings.eventCallback = { [weak self] event in
            DispatchQueue.main.async {
                self?.activeSdkController?.handleSdkEvent(event)
            }
        }

        let result = ShenaiSDK.initialize(shenApiKey, userID: "", settings: settings)
        openingFlow = false

        guard result == .success else {
            statusLabel.text = "Initialization failed: \(result)"
            statusLabel.isHidden = false
            return
        }

        if flow.disableMeasurementsDashboard {
            ShenaiSDK.setEnableMeasurementsDashboard(false)
        }

        let sdkController = FlowSdkViewController(flow: flow)
        sdkController.onFlowFinished = { [weak self] in
            self?.activeSdkController = nil
        }
        activeSdkController = sdkController
        navigationController?.pushViewController(sdkController, animated: true)
    }
}

private final class FlowSdkViewController: UIViewController {
    let flow: FlowConfig
    var onFlowFinished: (() -> Void)?

    private var shenaiController: ShenaiView?
    private var showPdfActions = false
    private var pdfStatusLabel = UILabel()
    private var pdfButtons: [UIButton] = []
    private var pdfBusy = false
    private var finished = false

    init(flow: FlowConfig) {
        self.flow = flow
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        addSdkView()

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

        if flow.resetMeasurement {
            ShenaiSDK.resetMeasurementSession()
        }
        if let initialScreen = flow.initialScreen {
            ShenaiSDK.setScreen(initialScreen)
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    func handleSdkEvent(_ event: Event) {
        print("Shen.AI event: \(event)")
        if event == .userFlowFinished {
            handleUserFlowFinished()
        }
    }

    private func handleUserFlowFinished() {
        guard !finished else { return }
        if flow.showPdfActionsAfterFinish, ShenaiSDK.getMeasurementResults() != nil {
            showPdfActionsPage()
            return
        }
        finishFlow()
    }

    private func addSdkView() {
        let controller = ShenaiView()
        addChild(controller)
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(controller.view)
        NSLayoutConstraint.activate([
            controller.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            controller.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            controller.view.topAnchor.constraint(equalTo: view.topAnchor),
            controller.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        controller.didMove(toParent: self)
        shenaiController = controller
    }

    private func removeSdkView() {
        guard let controller = shenaiController else { return }
        controller.willMove(toParent: nil)
        controller.view.removeFromSuperview()
        controller.removeFromParent()
        shenaiController = nil
    }

    private func showPdfActionsPage() {
        guard !showPdfActions else { return }
        showPdfActions = true
        removeSdkView()
        ShenaiSDK.setCameraMode(.off)

        let titleLabel = UILabel()
        titleLabel.text = "Measurement PDF"
        titleLabel.font = .preferredFont(forTextStyle: .title2)
        titleLabel.textColor = .black
        titleLabel.textAlignment = .center

        pdfStatusLabel.text = "Measurement finished. Open the PDF report."
        pdfStatusLabel.textAlignment = .center
        pdfStatusLabel.textColor = .black
        pdfStatusLabel.numberOfLines = 0

        let openButton = makeActionButton(title: "Open PDF")
        openButton.addAction(UIAction { [weak self] _ in
            self?.runPdfAction {
                ShenaiSDK.openMeasurementResultsPdfInBrowser()
                self?.setPdfStatus("PDF open request sent.")
            }
        }, for: .touchUpInside)

        let finishButton = UIButton(type: .system)
        finishButton.setTitle("Finish", for: .normal)
        finishButton.backgroundColor = .black
        finishButton.tintColor = .white
        finishButton.layer.cornerRadius = 8
        finishButton.addAction(UIAction { [weak self] _ in
            self?.finishFlow()
        }, for: .touchUpInside)

        pdfButtons = [openButton, finishButton]

        let stack = UIStackView(arrangedSubviews: [
            titleLabel,
            pdfStatusLabel,
            openButton,
            finishButton,
        ])
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.centerYAnchor.constraint(equalTo: view.safeAreaLayoutGuide.centerYAnchor),
            stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
            stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            stack.widthAnchor.constraint(lessThanOrEqualToConstant: 420),
            openButton.heightAnchor.constraint(equalToConstant: 54),
            finishButton.heightAnchor.constraint(equalToConstant: 44),
        ])
    }

    private func runPdfAction(_ action: @escaping () -> Void) {
        guard !pdfBusy else { return }
        pdfBusy = true
        setPdfButtonsEnabled(false)
        setPdfStatus("Working on PDF...")
        action()
        pdfBusy = false
        setPdfButtonsEnabled(true)
    }

    private func setPdfStatus(_ status: String) {
        pdfStatusLabel.text = status
    }

    private func setPdfButtonsEnabled(_ enabled: Bool) {
        pdfButtons.forEach { $0.isEnabled = enabled }
    }

    private func finishFlow() {
        guard !finished else { return }
        finished = true
        ShenaiSDK.deinitialize()
        onFlowFinished?()
        navigationController?.popToRootViewController(animated: true)
    }

    @objc private func appDidEnterBackground() {
        if !finished && !showPdfActions {
            ShenaiSDK.setCameraMode(.off)
        }
    }

    @objc private func appWillEnterForeground() {
        if !finished && !showPdfActions {
            ShenaiSDK.setCameraMode(.facingUser)
        }
    }
}

private func uiFlowSettings(screens: [Screen], dashboardOnly: Bool) -> InitializationSettings {
    let settings = InitializationSettings()
    settings.precisionMode = .relaxed
    settings.operatingMode = .measure
    settings.measurementPreset = .thirtySecondsAllMetrics
    settings.cameraMode = .facingUser
    settings.onboardingMode = .hidden
    settings.showUserInterface = true
    settings.showFacePositioningOverlay = true
    settings.showVisualWarnings = true
    settings.enableCameraSwap = true
    settings.showFaceMask = true
    settings.showBloodFlow = true
    settings.enableStartAfterSuccess = false
    settings.enableSummaryScreen = !dashboardOnly
    settings.showResultsFinishButton = !dashboardOnly
    settings.enableHealthRisks = true
    settings.showHealthIndicesFinishButton = !dashboardOnly
    settings.saveHealthRisksFactors = true
    settings.showOutOfRangeResultIndicators = true
    settings.applyPrecisionModeToBloodPressure = false
    settings.showSignalQualityIndicator = true
    settings.showSignalTile = true
    settings.showStartStopButton = !dashboardOnly
    settings.showInfoButton = !dashboardOnly
    settings.showDisclaimer = !dashboardOnly
    settings.uiVersion = ShenaiEnumValues.uiVersionV2
    settings.risksFactors = exampleRiskFactors()
    settings.uiFlowScreens = screens.map { NSNumber(value: $0.rawValue) }
    return settings
}

private func exampleRiskFactors() -> RisksFactors {
    let factors = RisksFactors()
    factors.age = 45
    factors.cholesterol = 190
    factors.cholesterolHDL = 52
    factors.sbp = 128
    factors.dbp = 82
    factors.isSmoker = false
    factors.hypertensionTreatment = .no
    factors.hasDiabetes = false
    factors.bodyHeight = 172
    factors.bodyWeight = 74
    factors.waistCircumference = 84
    factors.neckCircumference = 38
    factors.hipCircumference = 98
    factors.gender = .female
    factors.physicalActivity = ShenaiEnumValues.activityModerately
    factors.country = "US"
    factors.race = .white
    factors.vegetableFruitDiet = true
    factors.historyOfHighGlucose = false
    factors.historyOfHypertension = false
    factors.triglyceride = 120
    factors.fastingGlucose = 92
    factors.familyDiabetes = .noneFirstDegree
    factors.parentalHypertension = .none
    return factors
}

private func makeActionButton(title: String) -> UIButton {
    let button = UIButton(type: .system)
    button.setTitle(title, for: .normal)
    button.tintColor = .black
    button.layer.borderColor = UIColor.black.cgColor
    button.layer.borderWidth = 1
    button.layer.cornerRadius = 8
    return button
}
