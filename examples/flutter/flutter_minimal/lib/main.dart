import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';
import 'package:shenai_sdk/shenai_sdk.dart';
import 'package:shenai_sdk/shenai_view.dart';
import 'dart:async';

const String shenApiKey = "YOUR_API_KEY";

void main() async {
  WidgetsFlutterBinding.ensureInitialized();  
  await ShenaiSdk.initialize(shenApiKey, "");
  await ShenaiSdk.setCustomMeasurementConfig(CustomMeasurementConfig(
    instantMetrics: [Metric.heartRate,Metric.systolicBp,Metric.diastolicBp],
    summaryMetrics: [Metric.age],
  ));
  ShenaiSdk.setEventCallback((event) {
    print("Shen.AI event: $event");
  });
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  bool _isInitialized = true;

  String _title = "Shen.ai SDK";

  Timer? timer;

  @override
  void initState() {
    super.initState();
    timer = Timer.periodic(const Duration(seconds: 1), (Timer t) async {
      var res = await ShenaiSdk.getMeasurementState();
      var results = await ShenaiSdk.getMeasurementResults();
      if (results != null && results.systolic_blood_pressure_mmhg != null) {
        setState(() {
          _title = "Systolic: " + results.systolic_blood_pressure_mmhg.toString() + " mmHg";
        });
      }
      else {
        setState(() {        
          _title = res.toString();
        });
      }
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_title),        
        leading: GestureDetector(
          onTap: () async { 
            if (await ShenaiSdk.isInitialized()) {
              ShenaiSdk.deinitialize().then((value) => print("Deinitialized!"));
              setState(() {
                _isInitialized = false;
              });
            } else {
              await ShenaiSdk.initialize(shenApiKey, "");

              setState(() {
                _isInitialized = true;
              });

              var factors = RisksFactors(
                age: 45,
                cholesterol: 220,
                cholesterolHdl: 47,
                sbp: 137,
                isSmoker: true,
                hypertensionTreatment: true,
                hasDiabetes: true,
                bodyHeight: 180,
                bodyWeight: 50,
                gender: Gender.male,
                race: Race.white,
                country: "US",      
              );

              var risks = await ShenaiSdk.computeHealthRisks(factors);
              print("Risks:");
              print(risks.hardAndFatalEvents.coronaryDeathEventRisk);
              print(risks.cvDiseases.overallRisk);
              print(risks.vascularAge);
              print(risks.scores.ageScore);
            }
          },
          child: const Icon(Icons.menu),
        ),
      ),
      body: Center(child: _isInitialized ? ShenaiView() : const Text("Not initialized")),
    );
  }
}
