//
//  AppDelegate.swift
//  shenai-swift-example
//

import UIKit
import ShenaiSDK

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var timer: Timer?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        let initSettings = InitializationSettings()
        initSettings.eventCallback = { (e: Event) -> Void in
            print("Shen.AI event: ", e.rawValue)
        }
        
        let result = ShenaiSDK.initialize("API_KEY", userID: nil, settings: initSettings)
        if result == .success {
            print("SDK initialized successfully!")
        } else {
            print("SDK initialization error")
        }
        
        window = UIWindow(frame: UIScreen.main.bounds)
        let mainVC = ShenaiView()
        
        window?.rootViewController = mainVC
        window?.makeKeyAndVisible()

        // Start the timer
        timer = Timer.scheduledTimer(timeInterval: 5.0, target: self, selector: #selector(repeatMethod), userInfo: nil, repeats: true)
        
        return true
    }
    

    @objc func repeatMethod() {
        let currentHeartRate = ShenaiSDK.getHeartRate10s()
        let measurementResult = ShenaiSDK.getMeasurementResults()

        if measurementResult != nil {
            print("Measurement result: HR \(measurementResult?.heartRateBpm) BPM, SDNN \(measurementResult?.hrvSdnnMs) ms")
        } else if currentHeartRate != nil {
            print("Current heart rate: \(currentHeartRate!)")
        }
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        timer?.invalidate()
    }
}

