#!/usr/bin/env bash
# -------------------------------------------------------------
# Shen.AI – React Native custom UI example (iOS build helper)
# -------------------------------------------------------------
# Requires: Yarn, Node.js, Xcode 15+, CocoaPods
#
# Usage:
#   SHENAI_API_KEY="<key>" ./scripts/run_react_native_custom_ui_ios.sh                 # lets React Native decide
#   SHENAI_API_KEY="<key>" ./scripts/run_react_native_custom_ui_ios.sh --device "<id>" # explicit physical device
#
# Exit codes:
#   0  success
#   1  missing prerequisite
#   2  SDK not unpacked
# -------------------------------------------------------------
set -euo pipefail

###############  CONFIG  ######################################
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )"
EXAMPLE_DIR="$ROOT_DIR/examples/react-native/react_native_custom_ui"
SDK_DIR="$EXAMPLE_DIR/react-native-shenai-sdk"
NODE_MODULES_DIR="$EXAMPLE_DIR/node_modules"
YARN_CACHE_DIR="${TMPDIR:-/tmp}/shenai-react-native-custom-ui-yarn-cache"
METRO_PORT="${RCT_METRO_PORT:-8083}"
IOS_DIR="$EXAMPLE_DIR/ios"
###############################################################

say()  { echo -e "[Shen.AI] $*"; }
fail() { say "$1"; exit "${2:-1}"; }
has_port_arg() {
  local arg
  for arg in "$@"; do
    [[ "$arg" == "--port" || "$arg" == --port=* ]] && return 0
  done
  return 1
}

### 1 ▸ Prerequisite checks
command -v yarn       >/dev/null 2>&1 || fail "Yarn not found. Install with: npm i -g yarn" 1
command -v node       >/dev/null 2>&1 || fail "Node.js not found. Install from https://nodejs.org" 1
command -v xcodebuild >/dev/null 2>&1 || fail "Xcode command‑line tools missing. Run 'xcode-select --install'." 1
pod --version         >/dev/null 2>&1 || fail "CocoaPods missing. Install with 'sudo gem install cocoapods'." 1

### 2 ▸ Validate SDK presence
[[ -d "$SDK_DIR" ]] || fail "Shen.AI React Native SDK directory not found at $SDK_DIR" 2

### 3 ▸ Forward API key to Metro/Babel
export SHENAI_API_KEY="${SHENAI_API_KEY:-}"
if [[ -z "$SHENAI_API_KEY" ]]; then
  say "SHENAI_API_KEY is not set. The app will show a missing-key screen."
else
  say "Using SHENAI_API_KEY from the environment."
fi
export RCT_METRO_PORT="$METRO_PORT"
say "Using Metro port $METRO_PORT."

### 4 ▸ JS dependencies
cd "$EXAMPLE_DIR"
if [[ -d "$NODE_MODULES_DIR" ]]; then
  say "Using existing JS dependencies."
else
  say "Installing JS dependencies with Yarn…"
  YARN_CACHE_FOLDER="$YARN_CACHE_DIR" yarn install --silent --force
fi

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
  if has_port_arg "$@"; then
    yarn ios --device "$DEVICE_ID" "$@"
  else
    yarn ios --port "$METRO_PORT" --device "$DEVICE_ID" "$@"
  fi
else
  say "Running 'yarn ios' – React Native will pick a physical device if one is connected, otherwise a simulator (note: simulators lack camera input)."
  if has_port_arg "$@"; then
    yarn ios "$@"
  else
    yarn ios --port "$METRO_PORT" "$@"
  fi
fi
