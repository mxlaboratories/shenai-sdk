import 'package:shenai_sdk_example/domain/constants_values.dart';

class HealthRiskFactor {
  final int? age;
  final double? cholesterol;
  final double? cholesterolHdl;
  final double? sbp;
  final bool? isSmoker;
  final bool? hypertensionTreatment;
  final bool? hasDiabetes;
  final double? bodyHeight;
  final double? bodyWeight;
  final UserGender? gender;
  final String? country;
  final UserRace? race;

  HealthRiskFactor({
    this.age,
    this.cholesterol,
    this.cholesterolHdl,
    this.sbp,
    this.isSmoker,
    this.hypertensionTreatment,
    this.hasDiabetes,
    this.bodyHeight,
    this.bodyWeight,
    this.gender,
    this.country,
    this.race,
  });

  HealthRiskFactor copyWith({
    int? age,
    double? cholesterol,
    double? cholesterolHdl,
    double? sbp,
    bool? isSmoker,
    bool? hypertensionTreatment,
    bool? hasDiabetes,
    double? bodyHeight,
    double? bodyWeight,
    UserGender? gender,
    String? country,
    UserRace? race,
  }) {
    return HealthRiskFactor(
      country: country ?? this.country,
      age: age ?? this.age,
      cholesterol: cholesterol ?? this.cholesterol,
      cholesterolHdl: cholesterolHdl ?? this.cholesterolHdl,
      sbp: sbp ?? this.sbp,
      isSmoker: isSmoker ?? this.isSmoker,
      hypertensionTreatment: hypertensionTreatment ?? this.hypertensionTreatment,
      hasDiabetes: hasDiabetes ?? this.hasDiabetes,
      bodyHeight: bodyHeight ?? this.bodyHeight,
      gender: gender ?? this.gender,
      race: race ?? this.race,
      bodyWeight: bodyWeight ?? this.bodyWeight,
    );
  }
}

enum UserGender {
  male(ConstantsValues.male),
  female(ConstantsValues.female),
  other(ConstantsValues.other);

  final String value;

  const UserGender(this.value);
}

enum UserRace {
  white(ConstantsValues.white),
  africanAmerican(ConstantsValues.africanAmerican),
  other(ConstantsValues.other);

  final String value;

  const UserRace(this.value);
}
