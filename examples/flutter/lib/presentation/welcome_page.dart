import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';

class WelcomePage extends StatelessWidget {
  const WelcomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Column(
        children: [
          Expanded(
            child: Center(
              child: TextButton(
                child: const Text(ConstantsValues.welcomeTitleText),
                onPressed: () => Navigator.of(context).pushNamed('/measure'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
