#!/usr/bin/env bash
# -------------------------------------------------------------
# Shen.AI – React Native custom UI example (Android build helper)
# -------------------------------------------------------------
# Requires: Yarn, Node.js, Android SDK platform‑tools (adb)
#
# Usage:
#   SHENAI_API_KEY="<key>" ./scripts/run_react_native_custom_ui_android.sh
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
ANDROID_DIR="$EXAMPLE_DIR/android"
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
command -v yarn >/dev/null 2>&1 || fail "Yarn not found. Install with: npm i -g yarn" 1
command -v node >/dev/null 2>&1 || fail "Node.js not found. Install from https://nodejs.org" 1
command -v adb  >/dev/null 2>&1 || fail "Android platform‑tools (adb) not found in PATH." 1

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

### 5 ▸ Gradle wrapper bootstrap (first run)
cd "$ANDROID_DIR"
./gradlew --quiet tasks >/dev/null

### 6 ▸ Ensure a device is available
if ! adb devices | awk 'NR>1 && $2=="device" {print}' | grep -q .; then
  fail "No unlocked Android device detected. Start one and retry." 1
fi

### 7 ▸ Build & launch
cd "$EXAMPLE_DIR"
if has_port_arg "$@"; then
  yarn android "$@"
else
  yarn android --port "$METRO_PORT" "$@"
fi
