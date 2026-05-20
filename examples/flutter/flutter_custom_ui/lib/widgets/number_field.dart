import 'package:flutter/material.dart';

class NumberField extends StatelessWidget {
  const NumberField({super.key, required this.label, required this.controller});

  final String label;
  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      validator: (value) {
        if (value == null || value.isEmpty || double.tryParse(value) == null) {
          return 'Required';
        }
        return null;
      },
    );
  }
}
