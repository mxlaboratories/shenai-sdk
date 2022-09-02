import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/extensions/context_extension.dart';
import 'package:shenai_sdk_example/widgets/label_card.dart';
import 'package:shenai_sdk_example/widgets/linear_progress_view.dart';

class CustomValueTile extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final String? image;
  final bool isProgress;

  const CustomValueTile({
    super.key,
    required this.label,
    required this.value,
    required this.unit,
    this.image,
    this.isProgress = false,
  });

  @override
  Widget build(BuildContext context) {
    return LabeledCard(
      label: label,
      image: image,
      child: Row(
        children: [
          if (isProgress) const LinearProgressView(),
          if (!isProgress)
            RichText(
              text: TextSpan(
                text: value,
                style: context.typo.customTileValueText,
                children: [
                  TextSpan(
                    text: ' $unit',
                    style: context.typo.customTileUnitText,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
