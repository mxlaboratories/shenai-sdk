import 'package:flutter/material.dart';
import 'package:shenai_sdk_example/domain/constants_values.dart';
import 'package:shenai_sdk_example/style/colors.dart';
import 'package:shenai_sdk_example/style/dimens.dart';
import 'package:shenai_sdk_example/widgets/buttons/rounded_flat_button.dart';

class InfoDialog extends StatelessWidget {
  final String? message;
  final RichText? richText;
  final String? buttonText;

  const InfoDialog({
    this.message,
    this.richText,
    this.buttonText,
  });

  Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => this,
    );
  }

  @override
  Widget build(BuildContext context) => Dialog(
    backgroundColor: Colors.transparent,
    child: Material(
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(Dimens.spacingM)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(Dimens.spacingL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Row(
              mainAxisAlignment: message != null ? MainAxisAlignment.spaceBetween : MainAxisAlignment.end,
              children: [
                if (message != null)
                  Expanded(
                    child:Text(
                      message!,
                      textAlign: TextAlign.center,
                    ),
                  ),
                InkWell(
                  onTap: () => Navigator.of(context).pop(),
                  child:const Icon(Icons.close),
                ),
              ],
            ),const SizedBox(height: Dimens.spacingXL),
            if (richText != null) richText!,
            RoundedFlatButton(
              color: AppColors.valueBarColorRed,
              disabledColor: AppColors.mainColorLightGrey,
              label: ConstantsValues.closeText,
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
    ),
  );
}
