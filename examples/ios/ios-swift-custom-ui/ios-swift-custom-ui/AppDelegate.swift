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
private let measurementFinishedNotification = Notification.Name("ShenaiMeasurementFinished")

private enum ShenaiEnumValues {
    // Some Obj-C enum cases from the SDK are not imported as Swift dot-syntax cases.
    static let uiVersionV2 = UiVersion(rawValue: 1)!
    static let activitySedentary = PhysicalActivity(rawValue: 0)!
    static let activityLightlyActive = PhysicalActivity(rawValue: 1)!
    static let activityModerately = PhysicalActivity(rawValue: 2)!
    static let activityVeryActive = PhysicalActivity(rawValue: 3)!
    static let activityExtraActive = PhysicalActivity(rawValue: 4)!

    static let activityOptions = [
        activitySedentary,
        activityLightlyActive,
        activityModerately,
        activityVeryActive,
        activityExtraActive,
    ]
}

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let profile = RiskProfile.defaults
        let settings = customUiSettings(profile: profile)
        settings.eventCallback = { event in
            print("Shen.AI event: \(event)")
            if event == .measurementFinished {
                DispatchQueue.main.async {
                    NotificationCenter.default.post(name: measurementFinishedNotification, object: nil)
                }
            }
        }

        let initializationResult = ShenaiSDK.initialize(shenApiKey, userID: "", settings: settings)
        window = UIWindow(frame: UIScreen.main.bounds)
        if #available(iOS 13.0, *) {
            window?.overrideUserInterfaceStyle = .light
        }
        let measureController = CustomMeasureViewController(
            initializationResult: initializationResult,
            profile: profile
        )
        window?.rootViewController = UINavigationController(rootViewController: measureController)
        window?.makeKeyAndVisible()
        return true
    }
}

private struct RiskProfile {
    var age: Int
    var heightCm: Double
    var weightKg: Double
    var waistCm: Double
    var cholesterol: Double
    var hdl: Double
    var sbp: Double
    var dbp: Double
    var isSmoker: Bool
    var hypertensionTreatment: HypertensionTreatment
    var hasDiabetes: Bool
    var gender: Gender
    var neckCm: Double
    var hipCm: Double
    var physicalActivity: PhysicalActivity
    var country: String
    var race: Race
    var vegetableFruitDiet: Bool
    var historyOfHighGlucose: Bool
    var historyOfHypertension: Bool
    var triglyceride: Double
    var fastingGlucose: Double
    var familyDiabetes: FamilyHistory
    var parentalHypertension: ParentalHistory

    static let defaults = RiskProfile(
        age: 45,
        heightCm: 172,
        weightKg: 74,
        waistCm: 84,
        cholesterol: 190,
        hdl: 52,
        sbp: 128,
        dbp: 82,
        isSmoker: false,
        hypertensionTreatment: .no,
        hasDiabetes: false,
        gender: .female,
        neckCm: 38,
        hipCm: 98,
        physicalActivity: ShenaiEnumValues.activityModerately,
        country: "US",
        race: .white,
        vegetableFruitDiet: true,
        historyOfHighGlucose: false,
        historyOfHypertension: false,
        triglyceride: 120,
        fastingGlucose: 92,
        familyDiabetes: .noneFirstDegree,
        parentalHypertension: .none
    )

    func toRisksFactors(results: MeasurementResults? = nil) -> RisksFactors {
        let factors = RisksFactors()
        factors.age = NSNumber(value: age)
        factors.cholesterol = NSNumber(value: cholesterol)
        factors.cholesterolHDL = NSNumber(value: hdl)
        factors.sbp = results?.systolicBloodPressureMmhg ?? NSNumber(value: sbp)
        factors.dbp = results?.diastolicBloodPressureMmhg ?? NSNumber(value: dbp)
        factors.isSmoker = NSNumber(value: isSmoker)
        factors.hypertensionTreatment = hypertensionTreatment
        factors.hasDiabetes = NSNumber(value: hasDiabetes)
        factors.bodyHeight = NSNumber(value: heightCm)
        factors.bodyWeight = NSNumber(value: weightKg)
        factors.waistCircumference = NSNumber(value: waistCm)
        factors.neckCircumference = NSNumber(value: neckCm)
        factors.hipCircumference = NSNumber(value: hipCm)
        factors.gender = gender
        factors.physicalActivity = physicalActivity
        factors.country = country
        factors.race = race
        factors.vegetableFruitDiet = NSNumber(value: vegetableFruitDiet)
        factors.historyOfHighGlucose = NSNumber(value: historyOfHighGlucose)
        factors.historyOfHypertension = NSNumber(value: historyOfHypertension)
        factors.triglyceride = NSNumber(value: triglyceride)
        factors.fastingGlucose = NSNumber(value: fastingGlucose)
        factors.familyDiabetes = familyDiabetes
        factors.parentalHypertension = parentalHypertension
        return factors
    }
}

private final class CustomMeasureViewController: UIViewController {
    private var profile: RiskProfile
    private let initializationResult: InitializationResult
    private let scrollView = UIScrollView()
    private let contentStack = UIStackView()
    private let cameraContainer = UIView()
    private let cameraPlaceholderLabel = UILabel()
    private var shenaiController: ShenaiView?
    private let progressView = UIProgressView(progressViewStyle: .default)
    private let statusLabel = UILabel()
    private let qualityStack = UIStackView()
    private let headlineGrid = UIStackView()
    private let startButton = UIButton(type: .system)
    private let stopButton = UIButton(type: .system)
    private let resultsButton = UIButton(type: .system)

    private var pollTimer: Timer?
    private var measurementState: MeasurementState?
    private var realtimeMetrics: MeasurementResults?
    private var results: MeasurementResults?
    private var healthRisks: HealthRisks?
    private var violatedCondition: MeasurementEnvironmentCondition?
    private var hasReachedFinalizing = false
    private var hasFinishedMeasurement = false
    private var progress: Float = 0
    private var isPolling = false
    private var isResettingMeasurement = false

    private var isInitialized: Bool { initializationResult == .success }

    init(initializationResult: InitializationResult, profile: RiskProfile) {
        self.initializationResult = initializationResult
        self.profile = profile
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Custom UI"
        view.backgroundColor = .white
        if #available(iOS 13.0, *) {
            overrideUserInterfaceStyle = .light
        }
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            image: UIImage(systemName: "list.clipboard"),
            style: .plain,
            target: self,
            action: #selector(openRiskForm)
        )

        buildLayout()
        configureCameraView()
        refreshSdkState(loadHealthRisks: false)

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMeasurementFinished),
            name: measurementFinishedNotification,
            object: nil
        )
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

        pollTimer = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { [weak self] _ in
            self?.refreshSdkState(loadHealthRisks: false)
        }
        ShenaiSDK.setCameraMode(.facingUser)
    }

    deinit {
        pollTimer?.invalidate()
        NotificationCenter.default.removeObserver(self)
        if isInitialized {
            ShenaiSDK.setCameraMode(.off)
        }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        if isInitialized {
            ShenaiSDK.setCameraMode(.facingUser)
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if isInitialized {
            ShenaiSDK.setCameraMode(.off)
        }
    }

    private func buildLayout() {
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        contentStack.axis = .vertical
        contentStack.spacing = 18
        contentStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)
        scrollView.addSubview(contentStack)

        cameraContainer.translatesAutoresizingMaskIntoConstraints = false
        cameraContainer.backgroundColor = UIColor(white: 0.93, alpha: 1)
        cameraContainer.layer.borderColor = UIColor.black.cgColor
        cameraContainer.layer.borderWidth = 2
        cameraContainer.clipsToBounds = true
        cameraPlaceholderLabel.text = initializationText()
        cameraPlaceholderLabel.textAlignment = .center
        cameraPlaceholderLabel.textColor = .black
        cameraPlaceholderLabel.numberOfLines = 0
        cameraPlaceholderLabel.translatesAutoresizingMaskIntoConstraints = false
        cameraContainer.addSubview(cameraPlaceholderLabel)

        progressView.progressTintColor = .black
        progressView.trackTintColor = UIColor(white: 0.86, alpha: 1)
        statusLabel.textAlignment = .center
        statusLabel.numberOfLines = 0
        statusLabel.textColor = .black

        qualityStack.axis = .vertical
        qualityStack.spacing = 8

        let buttonsRow = UIStackView(arrangedSubviews: [startButton, stopButton])
        buttonsRow.axis = .horizontal
        buttonsRow.spacing = 12
        buttonsRow.distribution = .fillEqually

        styleFilledButton(startButton, title: "Start")
        styleOutlinedButton(stopButton, title: "Stop")
        setOutlinedButtonEnabled(stopButton, isEnabled: false)
        startButton.addAction(UIAction { [weak self] _ in self?.startMeasurement() }, for: .touchUpInside)
        stopButton.addAction(UIAction { [weak self] _ in self?.stopMeasurement() }, for: .touchUpInside)

        styleFilledButton(resultsButton, title: "SEE RESULTS")
        resultsButton.isHidden = true
        resultsButton.addAction(UIAction { [weak self] _ in self?.openResults() }, for: .touchUpInside)

        headlineGrid.axis = .vertical
        headlineGrid.spacing = 10

        contentStack.addArrangedSubview(centered(cameraContainer))
        contentStack.addArrangedSubview(progressView)
        contentStack.addArrangedSubview(statusLabel)
        contentStack.addArrangedSubview(qualityStack)
        contentStack.addArrangedSubview(buttonsRow)
        contentStack.addArrangedSubview(resultsButton)
        contentStack.addArrangedSubview(headlineGrid)

        NSLayoutConstraint.activate([
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            contentStack.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor, constant: 20),
            contentStack.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor, constant: -20),
            contentStack.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor, constant: 12),
            contentStack.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -28),
            contentStack.widthAnchor.constraint(equalTo: scrollView.frameLayoutGuide.widthAnchor, constant: -40),
            cameraContainer.widthAnchor.constraint(equalToConstant: 260),
            cameraContainer.heightAnchor.constraint(equalTo: cameraContainer.widthAnchor),
            cameraPlaceholderLabel.leadingAnchor.constraint(equalTo: cameraContainer.leadingAnchor, constant: 16),
            cameraPlaceholderLabel.trailingAnchor.constraint(equalTo: cameraContainer.trailingAnchor, constant: -16),
            cameraPlaceholderLabel.centerYAnchor.constraint(equalTo: cameraContainer.centerYAnchor),
            startButton.heightAnchor.constraint(equalToConstant: 44),
            stopButton.heightAnchor.constraint(equalToConstant: 44),
            resultsButton.heightAnchor.constraint(equalToConstant: 44),
        ])
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        cameraContainer.layer.cornerRadius = cameraContainer.bounds.width / 2
    }

    private func configureCameraView() {
        guard isInitialized else { return }
        cameraPlaceholderLabel.isHidden = true
        let controller = ShenaiView()
        addChild(controller)
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        cameraContainer.addSubview(controller.view)
        NSLayoutConstraint.activate([
            controller.view.centerXAnchor.constraint(equalTo: cameraContainer.centerXAnchor),
            controller.view.centerYAnchor.constraint(equalTo: cameraContainer.centerYAnchor),
            controller.view.widthAnchor.constraint(equalTo: cameraContainer.widthAnchor),
            controller.view.heightAnchor.constraint(equalTo: cameraContainer.widthAnchor, multiplier: 16.0 / 9.0),
        ])
        controller.didMove(toParent: self)
        shenaiController = controller
    }

    private func initializationText() -> String {
        if initializationResult == .success {
            return ""
        }
        return "Initialization failed: \(initializationResult)"
    }

    private func startMeasurement() {
        guard isInitialized else { return }
        isResettingMeasurement = true
        resetMeasurementUiState()
        ShenaiSDK.setCameraMode(.facingUser)
        ShenaiSDK.resetMeasurementSession()
        ShenaiSDK.setOperatingMode(.measure)
        ShenaiSDK.startMeasurement()
        isResettingMeasurement = false
        refreshSdkState(loadHealthRisks: false)
    }

    private func stopMeasurement() {
        guard isInitialized else { return }
        isResettingMeasurement = true
        ShenaiSDK.resetMeasurementSession()
        ShenaiSDK.setCameraMode(.facingUser)
        resetMeasurementUiState()
        isResettingMeasurement = false
    }

    private func refreshSdkState(loadHealthRisks: Bool) {
        guard !isPolling, !isResettingMeasurement, isInitialized else {
            updateUi()
            return
        }
        isPolling = true
        measurementState = ShenaiSDK.getMeasurementState()
        progress = ShenaiSDK.getMeasurementProgressPercentage()
        if let rawCondition = ShenaiSDK.getCurrentViolatedMeasurementEnvironmentCondition() {
            violatedCondition = MeasurementEnvironmentCondition(rawValue: rawCondition.intValue)
        } else {
            violatedCondition = nil
        }
        if isRunningMeasurementState(measurementState) {
            realtimeMetrics = ShenaiSDK.getRealtimeMetrics(10.0) ?? realtimeMetrics
        } else {
            realtimeMetrics = nil
        }
        if hasFinishedMeasurement || measurementState == .finished {
            results = ShenaiSDK.getMeasurementResults() ?? results
        }

        if measurementState == .finalizing {
            hasReachedFinalizing = true
        }
        if measurementState == .finished {
            hasFinishedMeasurement = true
        }
        if loadHealthRisks || (measurementState == .finished && healthRisks == nil) {
            healthRisks = ShenaiHealthRisks.computeHealthRisks(profile.toRisksFactors(results: results))
        }
        isPolling = false
        updateUi()
    }

    private func resetMeasurementUiState() {
        measurementState = nil
        realtimeMetrics = nil
        results = nil
        healthRisks = nil
        violatedCondition = nil
        hasReachedFinalizing = false
        hasFinishedMeasurement = false
        progress = 0
        updateUi()
    }

    private func updateUi() {
        let running = isRunningMeasurementState(measurementState)
        let measurementFinished = hasFinishedMeasurement || measurementState == .finished
        let displayResults = results ?? realtimeMetrics

        progressView.progress = progress / 100
        statusLabel.text = "\(measurementStatusText(measurementState, violatedCondition, hasReachedFinalizing: hasReachedFinalizing, hasFinishedMeasurement: hasFinishedMeasurement)) - \(formatNumber(NSNumber(value: progress)))%"
        setFilledButtonEnabled(startButton, isEnabled: isInitialized && !running)
        setOutlinedButtonEnabled(stopButton, isEnabled: isInitialized && running)
        resultsButton.isHidden = !measurementFinished
        setFilledButtonEnabled(resultsButton, isEnabled: measurementFinished && results != nil)
        setQualityRows(results: displayResults)
        setHeadlineRows(results: displayResults)
    }

    private func setQualityRows(results: MeasurementResults?) {
        qualityStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        qualityStack.addArrangedSubview(sectionTitle("Live quality"))
        let rows = qualityRows(results)
        if rows.isEmpty {
            qualityStack.addArrangedSubview(bodyLabel("Quality will appear during the measurement."))
            return
        }
        rows.forEach { qualityStack.addArrangedSubview(qualityRow($0)) }
    }

    private func setHeadlineRows(results: MeasurementResults?) {
        headlineGrid.arrangedSubviews.forEach { $0.removeFromSuperview() }
        headlineGrid.addArrangedSubview(grid(values: [
            DisplayValue("HR", formatNumber(number(results?.heartRateBpm)), "bpm"),
            DisplayValue("SBP", formatNumber(results?.systolicBloodPressureMmhg), "mmHg"),
            DisplayValue("DBP", formatNumber(results?.diastolicBloodPressureMmhg), "mmHg"),
            DisplayValue("BR", formatNumber(results?.breathingRateBpm, decimals: 1), "brpm"),
        ]))
    }

    @objc private func openRiskForm() {
        let form = RiskFormViewController(profile: profile)
        form.onSaved = { [weak self] profile in
            self?.profile = profile
            self?.computeHealthRisks(profile: profile)
        }
        navigationController?.pushViewController(form, animated: true)
    }

    private func openResults() {
        guard hasFinishedMeasurement || measurementState == .finished, results != nil else { return }
        let controller = ResultViewController(
            results: results,
            risks: healthRisks,
            profile: profile
        )
        controller.onProfileSaved = { [weak self] profile in
            self?.profile = profile
            self?.computeHealthRisks(profile: profile)
        }
        controller.onRisksChanged = { [weak self] risks in
            self?.healthRisks = risks
        }
        navigationController?.pushViewController(controller, animated: true)
    }

    private func computeHealthRisks(profile: RiskProfile) {
        guard isInitialized, results != nil else { return }
        healthRisks = ShenaiHealthRisks.computeHealthRisks(profile.toRisksFactors(results: results))
        updateUi()
    }

    @objc private func handleMeasurementFinished() {
        guard !isResettingMeasurement,
              isRunningMeasurementState(measurementState) || hasReachedFinalizing || measurementState == .finished
        else {
            return
        }
        hasFinishedMeasurement = true
        refreshSdkState(loadHealthRisks: true)
    }

    @objc private func appDidEnterBackground() {
        if isInitialized {
            ShenaiSDK.setCameraMode(.off)
        }
    }

    @objc private func appWillEnterForeground() {
        if isInitialized, navigationController?.topViewController === self {
            ShenaiSDK.setCameraMode(.facingUser)
        }
    }
}

private final class ResultViewController: UIViewController {
    private let results: MeasurementResults?
    private var risks: HealthRisks?
    private var profile: RiskProfile
    var onProfileSaved: ((RiskProfile) -> Void)?
    var onRisksChanged: ((HealthRisks?) -> Void)?
    private let stack = UIStackView()

    init(results: MeasurementResults?, risks: HealthRisks?, profile: RiskProfile) {
        self.results = results
        self.risks = risks
        self.profile = profile
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Results"
        view.backgroundColor = .white
        if #available(iOS 13.0, *) {
            overrideUserInterfaceStyle = .light
        }
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            image: UIImage(systemName: "list.clipboard"),
            style: .plain,
            target: self,
            action: #selector(openRiskForm)
        )

        let scroll = UIScrollView()
        scroll.translatesAutoresizingMaskIntoConstraints = false
        stack.axis = .vertical
        stack.spacing = 20
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scroll)
        scroll.addSubview(stack)

        NSLayoutConstraint.activate([
            scroll.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scroll.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scroll.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scroll.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            stack.leadingAnchor.constraint(equalTo: scroll.contentLayoutGuide.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: scroll.contentLayoutGuide.trailingAnchor, constant: -20),
            stack.topAnchor.constraint(equalTo: scroll.contentLayoutGuide.topAnchor, constant: 20),
            stack.bottomAnchor.constraint(equalTo: scroll.contentLayoutGuide.bottomAnchor, constant: -28),
            stack.widthAnchor.constraint(equalTo: scroll.frameLayoutGuide.widthAnchor, constant: -40),
        ])

        render()
    }

    private func render() {
        stack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        stack.addArrangedSubview(qualityIndicator(title: "Measurement quality", results: results))
        stack.addArrangedSubview(grid(values: measurementMetricValues(results)))
        stack.addArrangedSubview(sectionTitle("Health indices"))
        stack.addArrangedSubview(grid(values: healthRiskValues(risks)))
    }

    @objc private func openRiskForm() {
        let form = RiskFormViewController(profile: profile)
        form.onSaved = { [weak self] profile in
            guard let self else { return }
            self.profile = profile
            self.onProfileSaved?(profile)
            if let results = self.results {
                self.risks = ShenaiHealthRisks.computeHealthRisks(profile.toRisksFactors(results: results))
                self.onRisksChanged?(self.risks)
                self.render()
            }
        }
        navigationController?.pushViewController(form, animated: true)
    }
}

private final class RiskFormViewController: UIViewController {
    var onSaved: ((RiskProfile) -> Void)?
    private var profile: RiskProfile
    private var fields: [String: UITextField] = [:]
    private let countryField = UITextField()
    private let smokerSwitch = UISwitch()
    private let diabetesSwitch = UISwitch()
    private let fruitSwitch = UISwitch()
    private let highGlucoseSwitch = UISwitch()
    private let hypertensionSwitch = UISwitch()
    private let genderControl = UISegmentedControl(items: ["Female", "Male", "Other"])
    private let activityControl = UISegmentedControl(items: ["Sedentary", "Light", "Moderate", "Very", "Extra"])
    private let raceControl = UISegmentedControl(items: ["White", "African-American", "Other"])
    private let treatmentControl = UISegmentedControl(items: ["Not needed", "No", "Yes"])
    private let familyControl = UISegmentedControl(items: ["None", "No first-degree", "First-degree"])
    private let parentalControl = UISegmentedControl(items: ["None", "One", "Both"])

    init(profile: RiskProfile) {
        self.profile = profile
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Health form"
        view.backgroundColor = .white
        if #available(iOS 13.0, *) {
            overrideUserInterfaceStyle = .light
        }
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "Save",
            style: .done,
            target: self,
            action: #selector(save)
        )

        let scroll = UIScrollView()
        let stack = UIStackView()
        scroll.translatesAutoresizingMaskIntoConstraints = false
        stack.axis = .vertical
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scroll)
        scroll.addSubview(stack)

        [
            ("age", "Age", Double(profile.age)),
            ("heightCm", "Height (cm)", profile.heightCm),
            ("weightKg", "Weight (kg)", profile.weightKg),
            ("waistCm", "Waist (cm)", profile.waistCm),
            ("neckCm", "Neck (cm)", profile.neckCm),
            ("hipCm", "Hip (cm)", profile.hipCm),
            ("cholesterol", "Cholesterol", profile.cholesterol),
            ("hdl", "HDL", profile.hdl),
            ("sbp", "SBP", profile.sbp),
            ("dbp", "DBP", profile.dbp),
            ("triglyceride", "Triglyceride", profile.triglyceride),
            ("fastingGlucose", "Fasting glucose", profile.fastingGlucose),
        ].forEach { key, title, value in
            let field = numberField(title: title, value: value)
            fields[key] = field
            stack.addArrangedSubview(formField(title: title, field: field))
        }

        countryField.borderStyle = .roundedRect
        countryField.placeholder = "Country"
        countryField.text = profile.country
        countryField.textColor = .black
        countryField.backgroundColor = .white
        countryField.autocapitalizationType = .allCharacters
        countryField.heightAnchor.constraint(equalToConstant: 44).isActive = true
        stack.addArrangedSubview(formField(title: "Country", field: countryField))

        smokerSwitch.isOn = profile.isSmoker
        diabetesSwitch.isOn = profile.hasDiabetes
        fruitSwitch.isOn = profile.vegetableFruitDiet
        highGlucoseSwitch.isOn = profile.historyOfHighGlucose
        hypertensionSwitch.isOn = profile.historyOfHypertension
        genderControl.selectedSegmentIndex = selectedIndex(profile.gender, in: [.female, .male, .other])
        activityControl.selectedSegmentIndex = selectedIndex(profile.physicalActivity, in: ShenaiEnumValues.activityOptions)
        raceControl.selectedSegmentIndex = selectedIndex(profile.race, in: [.white, .africanAmerican, .other])
        treatmentControl.selectedSegmentIndex = selectedIndex(profile.hypertensionTreatment, in: [.notNeeded, .no, .yes])
        familyControl.selectedSegmentIndex = selectedIndex(profile.familyDiabetes, in: [.none, .noneFirstDegree, .firstDegree])
        parentalControl.selectedSegmentIndex = selectedIndex(profile.parentalHypertension, in: [.none, .one, .both])

        stack.addArrangedSubview(segmentedRow(title: "Gender", control: genderControl))
        stack.addArrangedSubview(segmentedRow(title: "Physical activity", control: activityControl))
        stack.addArrangedSubview(segmentedRow(title: "Race", control: raceControl))
        stack.addArrangedSubview(segmentedRow(title: "Hypertension treatment", control: treatmentControl))
        stack.addArrangedSubview(segmentedRow(title: "Family diabetes", control: familyControl))
        stack.addArrangedSubview(segmentedRow(title: "Parental hypertension", control: parentalControl))
        stack.addArrangedSubview(switchRow(title: "Smoker", control: smokerSwitch))
        stack.addArrangedSubview(switchRow(title: "Diabetes", control: diabetesSwitch))
        stack.addArrangedSubview(switchRow(title: "Fruit / vegetable diet", control: fruitSwitch))
        stack.addArrangedSubview(switchRow(title: "High glucose history", control: highGlucoseSwitch))
        stack.addArrangedSubview(switchRow(title: "Hypertension history", control: hypertensionSwitch))

        NSLayoutConstraint.activate([
            scroll.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scroll.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scroll.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scroll.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            stack.leadingAnchor.constraint(equalTo: scroll.contentLayoutGuide.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: scroll.contentLayoutGuide.trailingAnchor, constant: -20),
            stack.topAnchor.constraint(equalTo: scroll.contentLayoutGuide.topAnchor, constant: 20),
            stack.bottomAnchor.constraint(equalTo: scroll.contentLayoutGuide.bottomAnchor, constant: -28),
            stack.widthAnchor.constraint(equalTo: scroll.frameLayoutGuide.widthAnchor, constant: -40),
        ])
    }

    @objc private func save() {
        profile.age = Int(readDouble("age", fallback: Double(profile.age)))
        profile.heightCm = readDouble("heightCm", fallback: profile.heightCm)
        profile.weightKg = readDouble("weightKg", fallback: profile.weightKg)
        profile.waistCm = readDouble("waistCm", fallback: profile.waistCm)
        profile.neckCm = readDouble("neckCm", fallback: profile.neckCm)
        profile.hipCm = readDouble("hipCm", fallback: profile.hipCm)
        profile.cholesterol = readDouble("cholesterol", fallback: profile.cholesterol)
        profile.hdl = readDouble("hdl", fallback: profile.hdl)
        profile.sbp = readDouble("sbp", fallback: profile.sbp)
        profile.dbp = readDouble("dbp", fallback: profile.dbp)
        profile.triglyceride = readDouble("triglyceride", fallback: profile.triglyceride)
        profile.fastingGlucose = readDouble("fastingGlucose", fallback: profile.fastingGlucose)
        profile.isSmoker = smokerSwitch.isOn
        profile.hasDiabetes = diabetesSwitch.isOn
        profile.vegetableFruitDiet = fruitSwitch.isOn
        profile.historyOfHighGlucose = highGlucoseSwitch.isOn
        profile.historyOfHypertension = hypertensionSwitch.isOn
        profile.country = countryField.text?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false
            ? countryField.text!.trimmingCharacters(in: .whitespacesAndNewlines)
            : "US"
        profile.gender = selectedValue(genderControl, values: [.female, .male, .other], fallback: profile.gender)
        profile.physicalActivity = selectedValue(activityControl, values: ShenaiEnumValues.activityOptions, fallback: profile.physicalActivity)
        profile.race = selectedValue(raceControl, values: [.white, .africanAmerican, .other], fallback: profile.race)
        profile.hypertensionTreatment = selectedValue(treatmentControl, values: [.notNeeded, .no, .yes], fallback: profile.hypertensionTreatment)
        profile.familyDiabetes = selectedValue(familyControl, values: [.none, .noneFirstDegree, .firstDegree], fallback: profile.familyDiabetes)
        profile.parentalHypertension = selectedValue(parentalControl, values: [.none, .one, .both], fallback: profile.parentalHypertension)
        onSaved?(profile)
        navigationController?.popViewController(animated: true)
    }

    private func readDouble(_ key: String, fallback: Double) -> Double {
        guard let text = fields[key]?.text, let value = Double(text) else {
            return fallback
        }
        return value
    }

    private func selectedIndex<T: Equatable>(_ value: T, in values: [T]) -> Int {
        values.firstIndex(of: value) ?? 0
    }

    private func selectedValue<T>(_ control: UISegmentedControl, values: [T], fallback: T) -> T {
        guard control.selectedSegmentIndex >= 0, control.selectedSegmentIndex < values.count else {
            return fallback
        }
        return values[control.selectedSegmentIndex]
    }
}

private struct DisplayValue {
    let title: String
    let value: String
    let unit: String

    init(_ title: String, _ value: String, _ unit: String) {
        self.title = title
        self.value = value
        self.unit = unit
    }
}

private struct QualityValue {
    let label: String
    let value: String
    let progress: Float?
}

private func customUiSettings(profile: RiskProfile) -> InitializationSettings {
    let settings = InitializationSettings()
    settings.precisionMode = .relaxed
    settings.operatingMode = .measure
    settings.measurementPreset = .thirtySecondsAllMetrics
    settings.cameraMode = .facingUser
    settings.onboardingMode = .hidden
    settings.showUserInterface = false
    settings.showFacePositioningOverlay = false
    settings.showVisualWarnings = false
    settings.enableCameraSwap = false
    settings.showFaceMask = true
    settings.showBloodFlow = false
    settings.enableStartAfterSuccess = false
    settings.enableSummaryScreen = false
    settings.showResultsFinishButton = false
    settings.enableHealthRisks = true
    settings.showHealthIndicesFinishButton = false
    settings.saveHealthRisksFactors = true
    settings.showOutOfRangeResultIndicators = false
    settings.applyPrecisionModeToBloodPressure = false
    settings.showSignalQualityIndicator = false
    settings.showSignalTile = false
    settings.showStartStopButton = false
    settings.showInfoButton = false
    settings.showDisclaimer = false
    settings.uiVersion = ShenaiEnumValues.uiVersionV2
    settings.risksFactors = profile.toRisksFactors()
    return settings
}

private func measurementStatusText(
    _ state: MeasurementState?,
    _ condition: MeasurementEnvironmentCondition?,
    hasReachedFinalizing: Bool,
    hasFinishedMeasurement: Bool
) -> String {
    if hasFinishedMeasurement || state == .finished {
        return "Measurement finished"
    }
    if hasReachedFinalizing || state == .finalizing {
        return "Finalizing"
    }
    if let condition {
        return conditionInstruction(condition)
    }
    switch state {
    case .waitingForFace:
        return "Waiting for face"
    case .runningSignalShort, .runningSignalGood, .runningSignalBad, .runningSignalBadDeviceUnstable:
        return "Measurement conditions are good"
    case .finalizing:
        return "Finalizing"
    case .finished:
        return "Finished"
    case .failed:
        return "Measurement failed"
    case .notStarted, nil:
        return "Ready"
    @unknown default:
        return "Ready"
    }
}

private func conditionInstruction(_ condition: MeasurementEnvironmentCondition) -> String {
    switch condition {
    case .facePosition, .foreheadVisible:
        return "Uncover your forehead"
    case .glassesNotDetected:
        return "Remove your glasses"
    case .sufficientLightLevel:
        return "Move to brighter light"
    case .evenLighting:
        return "Use even lighting"
    case .noBacklight:
        return "Avoid backlight"
    case .faceStable:
        return "Keep your face still"
    case .deviceStable:
        return "Keep the phone still"
    @unknown default:
        return "Ready"
    }
}

private func isRunningMeasurementState(_ state: MeasurementState?) -> Bool {
    switch state {
    case .waitingForFace, .runningSignalShort, .runningSignalGood, .runningSignalBad,
         .runningSignalBadDeviceUnstable, .finalizing:
        return true
    default:
        return false
    }
}

private func measurementMetricValues(_ results: MeasurementResults?) -> [DisplayValue] {
    let quality = results?.qualityMetrics
    return [
        DisplayValue("Heart rate", formatNumber(number(results?.heartRateBpm)), "bpm"),
        DisplayValue("HRV SDNN", formatNumber(results?.hrvSdnnMs, decimals: 1), "ms"),
        DisplayValue("HRV lnRMSSD", formatNumber(results?.hrvLnrmssdMs, decimals: 2), "ms"),
        DisplayValue("Cardiac stress", formatNumber(results?.stressIndex, decimals: 1), ""),
        DisplayValue("PNS activity", formatNumber(results?.parasympatheticActivity, decimals: 1), ""),
        DisplayValue("Breathing", formatNumber(results?.breathingRateBpm, decimals: 1), "brpm"),
        DisplayValue("Systolic", formatNumber(results?.systolicBloodPressureMmhg), "mmHg"),
        DisplayValue("Diastolic", formatNumber(results?.diastolicBloodPressureMmhg), "mmHg"),
        DisplayValue("Workload", formatNumber(results?.cardiacWorkloadMmhgPerSec, decimals: 1), "mmHg/s"),
        DisplayValue("Age", formatNumber(results?.ageYears), "years"),
        DisplayValue("BMI", formatNumber(results?.bmiKgPerM2, decimals: 1), "kg/m2"),
        DisplayValue("BMI category", formatEnum(results?.bmiCategory), ""),
        DisplayValue("Weight", formatNumber(results?.weightKg, decimals: 1), "kg"),
        DisplayValue("Height", formatNumber(results?.heightCm, decimals: 1), "cm"),
        DisplayValue("BP scale", formatBpScale(results), ""),
        DisplayValue("Signal", formatNumber(number(results?.averageSignalQuality), decimals: 1), "dB"),
        DisplayValue("PPG quality", formatNumber(quality?.ppgQualityIndex, decimals: 1), ""),
        DisplayValue("BCG quality", formatNumber(quality?.bcgQualityIndex, decimals: 1), ""),
        DisplayValue("BP quality", formatNumber(quality?.bloodPressureQualityIndex, decimals: 1), ""),
        DisplayValue("SBP median error", formatNumber(quality?.expectedSbpMedianAbsErrorMmhg, decimals: 1), "mmHg"),
        DisplayValue("SBP p80 error", formatNumber(quality?.expectedSbpP80AbsErrorMmhg, decimals: 1), "mmHg"),
        DisplayValue("SBP mean error", formatNumber(quality?.expectedSbpMeanAbsErrorMmhg, decimals: 1), "mmHg"),
        DisplayValue("SBP balanced MAE", formatNumber(quality?.expectedSbpBalancedMaeMmhg, decimals: 1), "mmHg"),
        DisplayValue("DBP median error", formatNumber(quality?.expectedDbpMedianAbsErrorMmhg, decimals: 1), "mmHg"),
        DisplayValue("DBP p80 error", formatNumber(quality?.expectedDbpP80AbsErrorMmhg, decimals: 1), "mmHg"),
        DisplayValue("DBP mean error", formatNumber(quality?.expectedDbpMeanAbsErrorMmhg, decimals: 1), "mmHg"),
        DisplayValue("DBP balanced MAE", formatNumber(quality?.expectedDbpBalancedMaeMmhg, decimals: 1), "mmHg"),
        DisplayValue("Heartbeats", "\(results?.heartbeats.count ?? 0)", ""),
    ]
}

private func healthRiskValues(_ risks: HealthRisks?) -> [DisplayValue] {
    return [
        DisplayValue("Wellness", formatNumber(risks?.wellnessScore, decimals: 1), ""),
        DisplayValue("Vascular age", formatNumber(risks?.vascularAge), "years"),
        DisplayValue("CVD risk", formatNumber(risks?.cvDiseases.overallRisk, decimals: 1), "%"),
        DisplayValue("Coronary disease", formatNumber(risks?.cvDiseases.coronaryHeartDiseaseRisk, decimals: 1), "%"),
        DisplayValue("Stroke risk", formatNumber(risks?.cvDiseases.strokeRisk, decimals: 1), "%"),
        DisplayValue("Heart failure", formatNumber(risks?.cvDiseases.heartFailureRisk, decimals: 1), "%"),
        DisplayValue("Peripheral vascular", formatNumber(risks?.cvDiseases.peripheralVascularDiseaseRisk, decimals: 1), "%"),
        DisplayValue("Hard CV", formatNumber(risks?.hardAndFatalEvents.hardCvEventRisk, decimals: 1), "%"),
        DisplayValue("Coronary death", formatNumber(risks?.hardAndFatalEvents.coronaryDeathEventRisk, decimals: 1), "%"),
        DisplayValue("Fatal stroke", formatNumber(risks?.hardAndFatalEvents.fatalStrokeEventRisk, decimals: 1), "%"),
        DisplayValue("CV mortality", formatNumber(risks?.hardAndFatalEvents.totalCvMortalityRisk, decimals: 1), "%"),
        DisplayValue("Risk score", formatNumber(risks?.scores.totalScore), ""),
        DisplayValue("Age score", formatNumber(risks?.scores.ageScore), ""),
        DisplayValue("SBP score", formatNumber(risks?.scores.sbpScore), ""),
        DisplayValue("Smoking score", formatNumber(risks?.scores.smokingScore), ""),
        DisplayValue("Diabetes score", formatNumber(risks?.scores.diabetesScore), ""),
        DisplayValue("BMI score", formatNumber(risks?.scores.bmiScore), ""),
        DisplayValue("Cholesterol score", formatNumber(risks?.scores.cholesterolScore), ""),
        DisplayValue("HDL score", formatNumber(risks?.scores.cholesterolHdlScore), ""),
        DisplayValue("Hypertension", formatNumber(risks?.hypertensionRisk, decimals: 1), "%"),
        DisplayValue("Diabetes", formatNumber(risks?.diabetesRisk, decimals: 1), "%"),
        DisplayValue("Waist-height", formatNumber(risks?.waistToHeightRatio, decimals: 2), ""),
        DisplayValue("Body fat", formatNumber(risks?.bodyFatPercentage, decimals: 1), "%"),
        DisplayValue("Body roundness", formatNumber(risks?.bodyRoundnessIndex, decimals: 2), ""),
        DisplayValue("A body shape", formatNumber(risks?.aBodyShapeIndex, decimals: 3), ""),
        DisplayValue("Conicity", formatNumber(risks?.conicityIndex, decimals: 2), ""),
        DisplayValue("BMR", formatNumber(risks?.basalMetabolicRate), "kcal"),
        DisplayValue("TDEE", formatNumber(risks?.totalDailyEnergyExpenditure), "kcal"),
        DisplayValue("NAFLD", formatEnum(risks?.nonAlcoholicFattyLiverDiseaseRisk), ""),
    ]
}

private func number(_ value: Double?) -> NSNumber? {
    guard let value else { return nil }
    return NSNumber(value: value)
}

private func formatNumber(_ value: NSNumber?, decimals: Int = 0) -> String {
    guard let value else { return "-" }
    let formatter = NumberFormatter()
    formatter.minimumFractionDigits = decimals
    formatter.maximumFractionDigits = decimals
    return formatter.string(from: value) ?? "-"
}

private func formatEnum<T>(_ value: T?) -> String {
    guard let value else { return "-" }
    return "\(value)"
}

private func formatBpScale(_ results: MeasurementResults?) -> String {
    guard results?.systolicBloodPressureMmhg != nil, results?.diastolicBloodPressureMmhg != nil else {
        return "-"
    }
    return "Included"
}

private func qualityIndicator(title: String, results: MeasurementResults?) -> UIStackView {
    let stack = UIStackView()
    stack.axis = .vertical
    stack.spacing = 8
    stack.addArrangedSubview(sectionTitle(title))
    let rows = qualityRows(results)
    if rows.isEmpty {
        stack.addArrangedSubview(bodyLabel("Quality will appear during the measurement."))
    } else {
        rows.forEach { stack.addArrangedSubview(qualityRow($0)) }
    }
    return stack
}

private func qualityRows(_ results: MeasurementResults?) -> [QualityValue] {
    guard let results else { return [] }
    var rows = [
        QualityValue(
            label: "Signal",
            value: formatNumber(NSNumber(value: results.averageSignalQuality), decimals: 1),
            progress: qualityProgress(results.averageSignalQuality)
        ),
    ]
    if let value = results.qualityMetrics?.ppgQualityIndex {
        rows.append(QualityValue(label: "PPG", value: formatNumber(value, decimals: 1), progress: qualityProgress(value.doubleValue)))
    }
    if let value = results.qualityMetrics?.bcgQualityIndex {
        rows.append(QualityValue(label: "BCG", value: formatNumber(value, decimals: 1), progress: qualityProgress(value.doubleValue)))
    }
    if let value = results.qualityMetrics?.bloodPressureQualityIndex {
        rows.append(QualityValue(label: "BP", value: formatNumber(value, decimals: 1), progress: qualityProgress(value.doubleValue)))
    }
    return rows
}

private func qualityRow(_ row: QualityValue) -> UIView {
    let label = UILabel()
    label.text = row.label
    label.textColor = .black
    label.widthAnchor.constraint(equalToConstant: 72).isActive = true

    let value = UILabel()
    value.text = row.value
    value.textColor = .black
    value.textAlignment = .right
    value.widthAnchor.constraint(equalToConstant: 52).isActive = true

    let meter: UIView
    if let progress = row.progress {
        let progressView = UIProgressView(progressViewStyle: .default)
        progressView.progressTintColor = .black
        progressView.trackTintColor = UIColor(white: 0.86, alpha: 1)
        progressView.progress = progress
        meter = progressView
    } else {
        let line = UIView()
        line.backgroundColor = .black
        line.heightAnchor.constraint(equalToConstant: 1).isActive = true
        meter = line
    }

    let stack = UIStackView(arrangedSubviews: [label, meter, value])
    stack.axis = .horizontal
    stack.alignment = .center
    stack.spacing = 10
    return stack
}

private func qualityProgress(_ value: Double?) -> Float? {
    guard let value, value.isFinite else { return nil }
    let normalized = value <= 1 ? value : value / 100
    return Float(min(1, max(0, normalized)))
}

private func grid(values: [DisplayValue]) -> UIStackView {
    let stack = UIStackView()
    stack.axis = .vertical
    stack.spacing = 10
    for chunkStart in stride(from: 0, to: values.count, by: 2) {
        let row = UIStackView()
        row.axis = .horizontal
        row.spacing = 10
        row.distribution = .fillEqually
        row.addArrangedSubview(tile(values[chunkStart]))
        if chunkStart + 1 < values.count {
            row.addArrangedSubview(tile(values[chunkStart + 1]))
        } else {
            row.addArrangedSubview(UIView())
        }
        stack.addArrangedSubview(row)
    }
    return stack
}

private func tile(_ value: DisplayValue) -> UIView {
    let title = UILabel()
    title.text = value.title
    title.font = .preferredFont(forTextStyle: .caption1)
    title.textColor = .darkGray
    title.numberOfLines = 2

    let metric = UILabel()
    metric.text = value.unit.isEmpty ? value.value : "\(value.value) \(value.unit)"
    metric.font = .preferredFont(forTextStyle: .headline)
    metric.textColor = .black
    metric.numberOfLines = 1
    metric.adjustsFontSizeToFitWidth = true
    metric.minimumScaleFactor = 0.7

    let stack = UIStackView(arrangedSubviews: [title, metric])
    stack.axis = .vertical
    stack.spacing = 4
    stack.translatesAutoresizingMaskIntoConstraints = false

    let container = UIView()
    container.backgroundColor = .white
    container.layer.borderColor = UIColor.black.cgColor
    container.layer.borderWidth = 1
    container.addSubview(stack)
    NSLayoutConstraint.activate([
        stack.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 12),
        stack.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -12),
        stack.topAnchor.constraint(equalTo: container.topAnchor, constant: 10),
        stack.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -10),
        container.heightAnchor.constraint(greaterThanOrEqualToConstant: 112),
    ])
    return container
}

private func sectionTitle(_ text: String) -> UILabel {
    let label = UILabel()
    label.text = text
    label.font = .preferredFont(forTextStyle: .headline)
    label.textColor = .black
    return label
}

private func bodyLabel(_ text: String) -> UILabel {
    let label = UILabel()
    label.text = text
    label.textColor = .black
    label.numberOfLines = 0
    return label
}

private func formField(title: String, field: UITextField) -> UIStackView {
    let label = UILabel()
    label.text = title
    label.font = .preferredFont(forTextStyle: .subheadline)
    label.textColor = .black

    let stack = UIStackView(arrangedSubviews: [label, field])
    stack.axis = .vertical
    stack.spacing = 6
    return stack
}

private func numberField(title: String, value: Double) -> UITextField {
    let field = UITextField()
    field.borderStyle = .roundedRect
    field.placeholder = title
    field.text = formatNumber(NSNumber(value: value), decimals: value.truncatingRemainder(dividingBy: 1) == 0 ? 0 : 1)
    field.textColor = .black
    field.backgroundColor = .white
    field.keyboardType = .decimalPad
    field.heightAnchor.constraint(equalToConstant: 44).isActive = true
    return field
}

private func switchRow(title: String, control: UISwitch) -> UIView {
    let label = UILabel()
    label.text = title
    label.textColor = .black
    let row = UIStackView(arrangedSubviews: [label, control])
    row.axis = .horizontal
    row.alignment = .center
    row.distribution = .equalSpacing
    return row
}

private func segmentedRow(title: String, control: UISegmentedControl) -> UIView {
    let label = UILabel()
    label.text = title
    label.textColor = .black
    label.numberOfLines = 0
    let stack = UIStackView(arrangedSubviews: [label, control])
    stack.axis = .vertical
    stack.spacing = 6
    return stack
}

private func centered(_ view: UIView) -> UIView {
    let wrapper = UIView()
    view.translatesAutoresizingMaskIntoConstraints = false
    wrapper.addSubview(view)
    NSLayoutConstraint.activate([
        view.centerXAnchor.constraint(equalTo: wrapper.centerXAnchor),
        view.topAnchor.constraint(equalTo: wrapper.topAnchor),
        view.bottomAnchor.constraint(equalTo: wrapper.bottomAnchor),
    ])
    return wrapper
}

private func styleFilledButton(_ button: UIButton, title: String) {
    button.setTitle(title, for: .normal)
    button.backgroundColor = .black
    button.tintColor = .white
    button.layer.cornerRadius = 8
}

private func setFilledButtonEnabled(_ button: UIButton, isEnabled: Bool) {
    button.isEnabled = isEnabled
    button.backgroundColor = isEnabled ? .black : UIColor(white: 0.82, alpha: 1)
    button.tintColor = .white
}

private func styleOutlinedButton(_ button: UIButton, title: String) {
    button.setTitle(title, for: .normal)
    button.backgroundColor = .white
    button.tintColor = .black
    button.layer.borderColor = UIColor.black.cgColor
    button.layer.borderWidth = 1
    button.layer.cornerRadius = 8
}

private func setOutlinedButtonEnabled(_ button: UIButton, isEnabled: Bool) {
    button.isEnabled = isEnabled
    button.tintColor = isEnabled ? .black : .gray
    button.layer.borderColor = (isEnabled ? UIColor.black : UIColor.gray).cgColor
}
