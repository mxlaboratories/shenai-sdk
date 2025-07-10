#!/usr/bin/env bash
# -------------------------------------------------------------
# Shen.AI – React Native minimal example (Android build helper)
# -------------------------------------------------------------
# Requires: Yarn, Node.js, Android SDK platform‑tools (adb)
#
# Usage:
#   ./scripts/run_react_native_android.sh
#
# Exit codes:
#   0  success
#   1  missing prerequisite
#   2  SDK not unpacked
#   3  API key still placeholder
# -------------------------------------------------------------
set -euo pipefail

###############  CONFIG  ######################################
EXAMPLE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )/examples/react-native/react_native_minimal"
SDK_DIR="$EXAMPLE_DIR/react-native-shenai-sdk"
APP_FILE="$EXAMPLE_DIR/App.tsx"
ANDROID_DIR="$EXAMPLE_DIR/android"
###############################################################

say()  { echo -e "[Shen.AI] $*"; }
fail() { say "$1"; exit "${2:-1}"; }

### 1 ▸ Prerequisite checks
command -v yarn >/dev/null 2>&1 || fail "Yarn not found. Install with: npm i -g yarn" 1
command -v node >/dev/null 2>&1 || fail "Node.js not found. Install from https://nodejs.org" 1
command -v adb  >/dev/null 2>&1 || fail "Android platform‑tools (adb) not found in PATH." 1

### 2 ▸ Validate SDK presence
[[ -d "$SDK_DIR" ]] || fail "Shen.AI React Native SDK directory not found at $SDK_DIR" 2

### 3 ▸ Warn if API key placeholder still present
if grep -q 'initialize("API_KEY"' "$APP_FILE"; then
  fail "App.tsx still contains the placeholder \"API_KEY\". Replace it with your real key before running." 3
fi

### 4 ▸ JS dependencies
cd "$EXAMPLE_DIR"
say "Installing JS dependencies with Yarn…"
yarn install --silent

### 5 ▸ Gradle wrapper bootstrap (first run)
cd "$ANDROID_DIR"
./gradlew --quiet tasks >/dev/null

### 6 ▸ Ensure a device is available
if ! adb devices | awk 'NR>1 && $2=="device" {print}' | grep -q .; then
  fail "No unlocked Android device detected. Start one and retry." 1
fi

### 7 ▸ Build & launch
cd "$EXAMPLE_DIR"
yarn android
