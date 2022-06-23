import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:provider/provider.dart';

class BlocFactory {
  final GetIt injector;

  const BlocFactory({
    required this.injector,
  });

  T get<T extends Object>() => injector.get<T>();

  static BlocFactory of(BuildContext context, {bool listen = true}) =>
      Provider.of<BlocFactory>(context, listen: listen);
}
