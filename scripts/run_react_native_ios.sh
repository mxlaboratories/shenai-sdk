#!/usr/bin/env bash
# -------------------------------------------------------------
# Shen.AI – React Native minimal example (iOS build helper)
# -------------------------------------------------------------
# Requires: Yarn, Node.js, Xcode 15+, CocoaPods
#
# Usage:
#   ./scripts/run_react_native_ios.sh                 # lets React Native decide
#   ./scripts/run_react_native_ios.sh --device "<id>" # explicit physical device
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
IOS_DIR="$EXAMPLE_DIR/ios"
###############################################################

say()  { echo -e "[Shen.AI] $*"; }
fail() { say "$1"; exit "${2:-1}"; }

### 1 ▸ Prerequisite checks
command -v yarn       >/dev/null 2>&1 || fail "Yarn not found. Install with: npm i -g yarn" 1
command -v node       >/dev/null 2>&1 || fail "Node.js not found. Install from https://nodejs.org" 1
command -v xcodebuild >/dev/null 2>&1 || fail "Xcode command‑line tools missing. Run 'xcode-select --install'." 1
pod --version         >/dev/null 2>&1 || fail "CocoaPods missing. Install with 'sudo gem install cocoapods'." 1

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

### 5 ▸ CocoaPods
cd "$IOS_DIR"
say "Installing CocoaPods dependencies…"
pod install --silent

### 6 ▸ Build & launch
cd "$EXAMPLE_DIR"
if [[ "${1:-}" == "--device" && -n "${2:-}" ]]; then
  DEVICE_ARGS=(--device "$2")
  say "Running on specified device id $2…"
else
  say "Running 'yarn ios' – React Native will pick a physical device if one is connected, otherwise a simulator (note: simulators lack camera input)."
fi

yarn ios ${DEVICE_ARGS[@]+"${DEVICE_ARGS[@]}"}
