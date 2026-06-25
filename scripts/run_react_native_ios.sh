#!/usr/bin/env bash
# -------------------------------------------------------------
# Shen.AI – React Native minimal example (iOS build helper)
# -------------------------------------------------------------
# Requires: Yarn, Node.js, Xcode 15+, CocoaPods
#
# Usage:
#   SHENAI_API_KEY="<key>" ./scripts/run_react_native_ios.sh                 # lets React Native decide
#   SHENAI_API_KEY="<key>" ./scripts/run_react_native_ios.sh --device "<id>" # explicit physical device
#
# Exit codes:
#   0  success
#   1  missing prerequisite
# -------------------------------------------------------------
set -euo pipefail

###############  CONFIG  ######################################
EXAMPLE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )/examples/react-native/react_native_minimal"
IOS_DIR="$EXAMPLE_DIR/ios"
###############################################################

say()  { echo -e "[Shen.AI] $*"; }
fail() { say "$1"; exit "${2:-1}"; }

### 1 ▸ Prerequisite checks
command -v yarn       >/dev/null 2>&1 || fail "Yarn not found. Install with: npm i -g yarn" 1
command -v node       >/dev/null 2>&1 || fail "Node.js not found. Install from https://nodejs.org" 1
command -v xcodebuild >/dev/null 2>&1 || fail "Xcode command‑line tools missing. Run 'xcode-select --install'." 1
pod --version         >/dev/null 2>&1 || fail "CocoaPods missing. Install with 'sudo gem install cocoapods'." 1

### 2 ▸ Forward API key to Metro/Babel
export SHENAI_API_KEY="${SHENAI_API_KEY:-}"
if [[ -z "$SHENAI_API_KEY" ]]; then
  say "SHENAI_API_KEY is not set. The app will show a missing-key screen."
else
  say "Using SHENAI_API_KEY from the environment."
fi

### 3 ▸ Native toolchain
unset TOOLCHAINS LD LDPLUSPLUS
export CC="$(xcrun --find clang)"
export CXX="$(xcrun --find clang++)"
say "Using Xcode toolchain: $CC"

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
  DEVICE_ID="$2"
  shift 2
  say "Running on specified device id $DEVICE_ID…"
  yarn ios --device "$DEVICE_ID" "$@"
else
  say "Running 'yarn ios' – React Native will pick a physical device if one is connected, otherwise a simulator (note: simulators lack camera input)."
  yarn ios "$@"
fi
