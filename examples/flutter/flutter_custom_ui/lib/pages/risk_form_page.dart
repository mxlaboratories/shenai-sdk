import 'package:flutter/material.dart';
import 'package:shenai_sdk/pigeon.dart';

import '../models/risk_profile.dart';
import '../utils/formatters.dart';
import '../widgets/number_field.dart';

class RiskFormPage extends StatefulWidget {
  const RiskFormPage({super.key, required this.profile, required this.onSaved});

  static const routeName = '/risk-form';

  final RiskProfile profile;
  final ValueChanged<RiskProfile> onSaved;

  @override
  State<RiskFormPage> createState() => _RiskFormPageState();
}

class _RiskFormPageState extends State<RiskFormPage> {
  final _formKey = GlobalKey<FormState>();
  late final _age = TextEditingController(text: '${widget.profile.age}');
  late final _height = TextEditingController(
    text: '${widget.profile.heightCm}',
  );
  late final _weight = TextEditingController(
    text: '${widget.profile.weightKg}',
  );
  late final _waist = TextEditingController(text: '${widget.profile.waistCm}');
  late final _neck = TextEditingController(text: '${widget.profile.neckCm}');
  late final _hip = TextEditingController(text: '${widget.profile.hipCm}');
  late final _cholesterol = TextEditingController(
    text: '${widget.profile.cholesterol}',
  );
  late final _hdl = TextEditingController(text: '${widget.profile.hdl}');
  late final _triglyceride = TextEditingController(
    text: '${widget.profile.triglyceride}',
  );
  late final _fastingGlucose = TextEditingController(
    text: '${widget.profile.fastingGlucose}',
  );
  late final _sbp = TextEditingController(text: '${widget.profile.sbp}');
  late final _dbp = TextEditingController(text: '${widget.profile.dbp}');
  late final _country = TextEditingController(text: widget.profile.country);

  late bool _smoker = widget.profile.isSmoker;
  late bool _diabetes = widget.profile.hasDiabetes;
  late bool _vegetableFruitDiet = widget.profile.vegetableFruitDiet;
  late bool _historyOfHighGlucose = widget.profile.historyOfHighGlucose;
  late bool _historyOfHypertension = widget.profile.historyOfHypertension;
  late Gender _gender = widget.profile.gender;
  late HypertensionTreatment _hypertensionTreatment =
      widget.profile.hypertensionTreatment;
  late PhysicalActivity _physicalActivity = widget.profile.physicalActivity;
  late Race _race = widget.profile.race;
  late FamilyHistory _familyDiabetes = widget.profile.familyDiabetes;
  late ParentalHistory _parentalHypertension =
      widget.profile.parentalHypertension;

  @override
  void dispose() {
    _age.dispose();
    _height.dispose();
    _weight.dispose();
    _waist.dispose();
    _neck.dispose();
    _hip.dispose();
    _cholesterol.dispose();
    _hdl.dispose();
    _triglyceride.dispose();
    _fastingGlucose.dispose();
    _sbp.dispose();
    _dbp.dispose();
    _country.dispose();
    super.dispose();
  }

  void _save() {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    final profile = RiskProfile(
      age: int.parse(_age.text),
      heightCm: double.parse(_height.text),
      weightKg: double.parse(_weight.text),
      waistCm: double.parse(_waist.text),
      neckCm: double.parse(_neck.text),
      hipCm: double.parse(_hip.text),
      cholesterol: double.parse(_cholesterol.text),
      hdl: double.parse(_hdl.text),
      triglyceride: double.parse(_triglyceride.text),
      fastingGlucose: double.parse(_fastingGlucose.text),
      sbp: double.parse(_sbp.text),
      dbp: double.parse(_dbp.text),
      isSmoker: _smoker,
      hypertensionTreatment: _hypertensionTreatment,
      hasDiabetes: _diabetes,
      gender: _gender,
      physicalActivity: _physicalActivity,
      country: _country.text.trim(),
      race: _race,
      vegetableFruitDiet: _vegetableFruitDiet,
      historyOfHighGlucose: _historyOfHighGlucose,
      historyOfHypertension: _historyOfHypertension,
      familyDiabetes: _familyDiabetes,
      parentalHypertension: _parentalHypertension,
    );
    widget.onSaved(profile);
    Navigator.of(context).pop(profile);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Health form')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const _SectionLabel('Body'),
            Row(
              children: [
                Expanded(
                  child: NumberField(label: 'Age', controller: _age),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _EnumDropdown<Gender>(
                    label: 'Gender',
                    value: _gender,
                    values: Gender.values,
                    onChanged: (value) => setState(() => _gender = value),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: NumberField(label: 'Height', controller: _height),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: NumberField(label: 'Weight', controller: _weight),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: NumberField(label: 'Waist', controller: _waist),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: NumberField(label: 'Neck', controller: _neck),
                ),
              ],
            ),
            const SizedBox(height: 12),
            NumberField(label: 'Hip', controller: _hip),
            const SizedBox(height: 20),
            const _SectionLabel('Blood'),
            Row(
              children: [
                Expanded(
                  child: NumberField(
                    label: 'Cholesterol',
                    controller: _cholesterol,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: NumberField(label: 'HDL', controller: _hdl),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: NumberField(
                    label: 'Triglyceride',
                    controller: _triglyceride,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: NumberField(
                    label: 'Fasting glucose',
                    controller: _fastingGlucose,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: NumberField(label: 'SBP', controller: _sbp),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: NumberField(label: 'DBP', controller: _dbp),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const _SectionLabel('History'),
            _EnumDropdown<HypertensionTreatment>(
              label: 'Hypertension treatment',
              value: _hypertensionTreatment,
              values: HypertensionTreatment.values,
              onChanged: (value) =>
                  setState(() => _hypertensionTreatment = value),
            ),
            const SizedBox(height: 12),
            _EnumDropdown<FamilyHistory>(
              label: 'Family diabetes',
              value: _familyDiabetes,
              values: FamilyHistory.values,
              onChanged: (value) => setState(() => _familyDiabetes = value),
            ),
            const SizedBox(height: 12),
            _EnumDropdown<ParentalHistory>(
              label: 'Parental hypertension',
              value: _parentalHypertension,
              values: ParentalHistory.values,
              onChanged: (value) =>
                  setState(() => _parentalHypertension = value),
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              value: _smoker,
              onChanged: (value) => setState(() => _smoker = value),
              title: const Text('Smoker'),
            ),
            SwitchListTile(
              value: _diabetes,
              onChanged: (value) => setState(() => _diabetes = value),
              title: const Text('Diabetes'),
            ),
            SwitchListTile(
              value: _historyOfHighGlucose,
              onChanged: (value) =>
                  setState(() => _historyOfHighGlucose = value),
              title: const Text('High glucose history'),
            ),
            SwitchListTile(
              value: _historyOfHypertension,
              onChanged: (value) =>
                  setState(() => _historyOfHypertension = value),
              title: const Text('Hypertension history'),
            ),
            const SizedBox(height: 20),
            const _SectionLabel('Lifestyle'),
            _EnumDropdown<PhysicalActivity>(
              label: 'Physical activity',
              value: _physicalActivity,
              values: PhysicalActivity.values,
              onChanged: (value) => setState(() => _physicalActivity = value),
            ),
            const SizedBox(height: 12),
            _EnumDropdown<Race>(
              label: 'Race',
              value: _race,
              values: Race.values,
              onChanged: (value) => setState(() => _race = value),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _country,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(
                labelText: 'Country',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Required';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            SwitchListTile(
              value: _vegetableFruitDiet,
              onChanged: (value) => setState(() => _vegetableFruitDiet = value),
              title: const Text('Fruit and vegetables'),
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: _save, child: const Text('Save')),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(text, style: Theme.of(context).textTheme.titleSmall),
    );
  }
}

class _EnumDropdown<T extends Enum> extends StatelessWidget {
  const _EnumDropdown({
    required this.label,
    required this.value,
    required this.values,
    required this.onChanged,
  });

  final String label;
  final T value;
  final List<T> values;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      items: values
          .map(
            (item) =>
                DropdownMenuItem(value: item, child: Text(formatEnum(item))),
          )
          .toList(),
      onChanged: (value) {
        if (value != null) {
          onChanged(value);
        }
      },
    );
  }
}
