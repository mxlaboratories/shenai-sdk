import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';
import 'package:shenai_sdk/shenai_sdk.dart';
import 'package:shenai_sdk/shenai_view.dart';
import 'dart:async';

const String shenApiKey = "YOUR_API_KEY";

void main() async {
  WidgetsFlutterBinding.ensureInitialized();  
  var res = await ShenaiSdk.initialize(shenApiKey, "");
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You'll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or simply save your changes to "hot reload" in a Flutter IDE).
        // Notice that the counter didn't reset back to zero; the application
        // is not restarted.
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  String _title = "Shen.ai SDK";

  Timer? timer;

  @override
  void initState() {
    super.initState();
    timer = Timer.periodic(Duration(seconds: 1), (Timer t) async {
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

  void _incrementCounter() {
    setState(() {
      // This call to setState tells the Flutter framework that something has
      // changed in this State, which causes it to rerun the build method below
      // so that the display can reflect the updated values. If we changed
      // _counter without calling setState(), then the build method would not be
      // called again, and so nothing would appear to happen.
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(_title),        
        // We want to execute an action when title was clicked
        leading: GestureDetector(
          onTap: () async { 
            if (await ShenaiSdk.isInitialized()) {
              ShenaiSdk.deinitialize().then((value) => print("Deinitialized!"));
            } else {
              await ShenaiSdk.initialize(shenApiKey, "");

              var risks = await ShenaiSdk.computeHealthRisks(RisksFactors(
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
              ));
              print("Risks:");
              print(risks.hardAndFatalEvents.coronaryDeathEventRisk);
              print(risks.cvDiseases.overallRisk);
              print(risks.vascularAge);
              print(risks.scores.ageScore);
            }
          },
          child: Icon(
            Icons.menu,
          ),
        ),
      ),
      body: Center(         
        child: ShenaiView(),
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
      ),
    );
  }
}
