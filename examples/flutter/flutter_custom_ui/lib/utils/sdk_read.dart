import 'package:flutter/foundation.dart';

Future<T?> readSdkOrNull<T>(Future<T> Function() read) async {
  try {
    return await read();
  } catch (error) {
    if (kDebugMode) {
      debugPrint('Shen.AI read failed: $error');
    }
    return null;
  }
}
