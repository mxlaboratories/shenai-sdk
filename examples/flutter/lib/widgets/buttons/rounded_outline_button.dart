import 'package:flutter/material.dart';

class RoundedOutlineButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final Icon? icon;
  final Color color;
  final Color textColor;
  final BorderSide side;

  const RoundedOutlineButton({
    super.key,
    required this.label,
    required this.onPressed,
    required this.color,
    required this.textColor,
    this.icon,
    this.side = const BorderSide(color: Colors.white),
  });

  @override
  Widget build(BuildContext context) {
    return TextButton(
      style: TextButton.styleFrom(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30.0),
          side: side,
        ),
        primary: color,
        textStyle: TextStyle(color: textColor),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      ),
      onPressed: onPressed,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          if (icon != null) icon!,
          Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
