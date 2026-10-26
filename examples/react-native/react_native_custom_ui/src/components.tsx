import React from "react";
import {
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import type {MeasurementResults} from "react-native-shenai-sdk";

import type {TileValue} from "./measurement";
import {formatNumber, normalizedQuality, qualityRows} from "./measurement";
import type {Choice} from "./profile";
import {styles} from "./styles";

export function InitializationMessage({
  initialized,
  initializationResult,
  status,
}: {
  initialized: boolean;
  initializationResult: number | null | false;
  status: string;
}) {
  if (initialized) {
    return null;
  }
  return (
    <View style={styles.messageBox}>
      <Text style={styles.messageTitle}>
        {initializationResult === false ? "Initialization failed" : "Initializing SDK"}
      </Text>
      <Text style={styles.messageText}>{status}</Text>
    </View>
  );
}

export function MetricGrid({values}: {values: TileValue[]}) {
  return (
    <View style={styles.grid}>
      {values.map(([label, value, unit]) => (
        <View key={label} style={styles.tile}>
          <Text style={styles.tileLabel}>{label}</Text>
          <Text style={styles.tileValue}>{value}</Text>
          {!!unit && <Text style={styles.tileUnit}>{unit}</Text>}
        </View>
      ))}
    </View>
  );
}

export function QualityIndicator({
  results,
}: {
  results: MeasurementResults | null;
}) {
  const rows = qualityRows(results);
  if (rows.length === 0) {
    return <Text style={styles.mutedText}>No signal quality yet</Text>;
  }
  return (
    <View style={styles.qualityList}>
      {rows.map(([label, value]) => {
        const normalized = normalizedQuality(value);
        return (
          <View key={label} style={styles.qualityRow}>
            <Text style={styles.qualityLabel}>{label}</Text>
            <View style={styles.qualityTrack}>
              {normalized != null && (
                <View
                  style={[
                    styles.qualityFill,
                    {width: `${Math.round(normalized * 100)}%`},
                  ]}
                />
              )}
            </View>
            <Text style={styles.qualityValue}>{formatNumber(value, 1)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function NumericField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        onChangeText={text => onChange(Number(text) || 0)}
        style={styles.input}
        value={String(value)}
      />
    </View>
  );
}

export function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        autoCapitalize="characters"
        onChangeText={onChange}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export function BooleanRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.formLabel}>{label}</Text>
      <Switch onValueChange={onChange} value={value} />
    </View>
  );
}

export function SegmentedChoice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Choice[];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.segmented}>
        {options.map(option => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="button"
              key={option.label}
              onPress={() => onChange(option.value)}
              style={[styles.segment, selected && styles.segmentSelected]}>
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
