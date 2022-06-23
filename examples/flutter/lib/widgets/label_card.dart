import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/extensions/context_extension.dart';
import 'package:shenai_sdk_example/style/dimens.dart';

class LabeledCard extends StatelessWidget {
  final String? label;
  final Widget child;
  final String? image;

  const LabeledCard({
    Key? key,
    this.label,
    this.image,
    required this.child,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0.5,
      child: Stack(
        children: [
          if (image != null)
            Align(
              alignment: Alignment.centerRight,
              child: Image.asset(image ?? ""),
            ),
          Padding(
            padding: const EdgeInsets.all(Dimens.spacingS),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (label != null)
                  Text(
                    label ?? "",
                    style: context.typo.labelCardText,
                  ),
                child,
              ],
            ),
          )
        ],
      ),
    );
  }
}
