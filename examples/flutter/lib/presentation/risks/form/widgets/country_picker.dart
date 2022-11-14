import 'package:country_code_picker/country_code_picker.dart';
import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';

class CountryPicker extends StatelessWidget {
  final Function(String) onChanged;

  const CountryPicker({super.key, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(ConstantsValues.country),
        Stack(
          alignment: Alignment.centerLeft,
          children: [
            const Align(
              alignment: Alignment.centerRight,
              child: Icon(Icons.arrow_drop_down, color: Colors.black54),
            ),
            CountryCodePicker(
              onChanged: (code) {
                if (code.code != null) onChanged(code.code!);
              },
              showFlagMain: true,
              showFlagDialog: true,
              initialSelection: 'AU',
              alignLeft: true,
              showOnlyCountryWhenClosed: true,
              showCountryOnly: true,
              flagDecoration: BoxDecoration(
                borderRadius: BorderRadius.circular(7),
                border: Border.all(color: Colors.black12),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
